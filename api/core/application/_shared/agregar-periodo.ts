import { dataLocal, horaLocal } from '@application/_shared/data-local';
import { ClimaPeriodoDTO, MarPeriodoDTO, PeriodoDTO } from '@domain/_usecase/praias/condicoes-praia.dto';
import { OpenMeteoForecastResponseDTO } from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';
import { OpenMeteoMarineResponseDTO } from '@domain/_services/open-meteo-marine/open-meteo-marine.service';

function indicesPeriodo(times: string[], data: string, periodo: PeriodoDTO, now: Date): number[] {
    const indices: number[] = [];
    for (let index = 0; index < times.length; index++) {
        const time = times[index];
        if (!time.startsWith(data)) continue;
        const hour = Number(time.slice(11, 13));
        const inclui =
            periodo === 'manha'
                ? hour >= 6 && hour < 12
                : periodo === 'tarde'
                  ? hour >= 12 && hour < 18
                  : periodo === 'dia'
                    ? hour >= 6 && hour < 18
                    : hour === horaLocal(now);
        if (inclui) indices.push(index);
    }
    return indices;
}

function valores(values: Array<number | null>, indices: number[]): number[] {
    return indices
        .map((index) => values[index])
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function media(values: Array<number | null>, indices: number[]): number | null {
    const validos = valores(values, indices);
    if (!validos.length) return null;
    return Math.round((validos.reduce((total, value) => total + value, 0) / validos.length) * 10) / 10;
}

function maximo(values: Array<number | null>, indices: number[]): number | null {
    const validos = valores(values, indices);
    return validos.length ? Math.max(...validos) : null;
}

function total(values: Array<number | null>, indices: number[]): number | null {
    const validos = valores(values, indices);
    if (!validos.length) return null;
    return Math.round(validos.reduce((sum, value) => sum + value, 0) * 10) / 10;
}

function direcaoPredominante(values: Array<number | null>, indices: number[]): number | null {
    const validos = valores(values, indices);
    if (!validos.length) return null;
    const soma = validos.reduce(
        (acc, value) => {
            const radians = (value * Math.PI) / 180;
            return { x: acc.x + Math.cos(radians), y: acc.y + Math.sin(radians) };
        },
        { x: 0, y: 0 },
    );
    return Math.round((Math.atan2(soma.y, soma.x) * 180) / Math.PI + 360) % 360;
}

function moda(values: Array<number | null>, indices: number[]): number | null {
    const validos = valores(values, indices);
    if (!validos.length) return null;
    const contagem = new Map<number, number>();
    for (const value of validos) contagem.set(value, (contagem.get(value) ?? 0) + 1);
    return [...contagem.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}

export function agregarClima(
    forecast: OpenMeteoForecastResponseDTO,
    data: string,
    periodo: PeriodoDTO,
    now: Date,
): ClimaPeriodoDTO {
    const hourly = forecast.hourly;
    const indices = indicesPeriodo(hourly.time, data, periodo, now);
    const usarCurrent = periodo === 'agora' && data === dataLocal(now);

    return {
        temperaturaMediaC: usarCurrent ? forecast.current.temperature_2m : media(hourly.temperature_2m, indices),
        sensacaoTermicaMediaC: usarCurrent
            ? forecast.current.apparent_temperature
            : media(hourly.apparent_temperature, indices),
        probabilidadeChuvaMaximaPct: maximo(hourly.precipitation_probability, indices),
        precipitacaoTotalMm: usarCurrent ? forecast.current.precipitation : total(hourly.precipitation, indices),
        velocidadeVentoMediaKmH: usarCurrent ? forecast.current.wind_speed_10m : media(hourly.wind_speed_10m, indices),
        velocidadeRajadaMaximaKmH: usarCurrent
            ? forecast.current.wind_gusts_10m
            : maximo(hourly.wind_gusts_10m, indices),
        direcaoVentoPredominanteGraus: usarCurrent
            ? forecast.current.wind_direction_10m
            : direcaoPredominante(hourly.wind_direction_10m, indices),
        codigoTempo: usarCurrent ? forecast.current.weather_code : moda(hourly.weather_code, indices),
    };
}

export function agregarMar(
    marine: OpenMeteoMarineResponseDTO,
    data: string,
    periodo: PeriodoDTO,
    now: Date,
): MarPeriodoDTO {
    const hourly = marine.hourly;
    const indices = indicesPeriodo(hourly.time, data, periodo, now);

    return {
        alturaOndaMediaM: media(hourly.wave_height, indices),
        alturaOndaMaximaM: maximo(hourly.wave_height, indices),
        direcaoOndaPredominanteGraus: direcaoPredominante(hourly.wave_direction, indices),
        periodoOndaMaximoS: maximo(hourly.wave_period, indices),
        alturaSwellMaximaM: maximo(hourly.swell_wave_height, indices),
        direcaoSwellPredominanteGraus: direcaoPredominante(hourly.swell_wave_direction, indices),
        periodoSwellMaximoS: maximo(hourly.swell_wave_period, indices),
        temperaturaSuperficieAguaMediaC: media(hourly.sea_surface_temperature, indices),
    };
}
