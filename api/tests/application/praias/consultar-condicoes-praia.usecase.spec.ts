import { ConsultarCondicoesPraiaUseCase } from '@application/praias/consultar-condicoes-praia.usecase';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IClockService } from '@domain/_services/clock/clock.service';
import {
    IOpenMeteoForecastService,
    OpenMeteoForecastResponseDTO,
} from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';
import {
    IOpenMeteoMarineService,
    OpenMeteoMarineResponseDTO,
} from '@domain/_services/open-meteo-marine/open-meteo-marine.service';
import { IPraia } from '@domain/db/entities/praia.entity';

const praia = {
    id: 'canasvieiras',
    slug: 'canasvieiras',
    nome: 'Canasvieiras',
    regiao: 'Norte da ilha',
    latitude: -27.42776,
    longitude: -48.47231,
    ativo: true,
    elegivelRecomendacao: true,
    precisaoCoordenada: 'oficial_ima',
    indicacaoEstatica: ['relaxar', 'banho', 'familia'],
    alertasEstruturais: [],
    requerBalneabilidadeRecente: true,
} as IPraia;

const hours = ['2026-11-28T06:00', '2026-11-28T07:00', '2026-11-28T12:00'];
const forecast = {
    current: {
        time: '2026-11-28T12:00',
        temperature_2m: 26,
        apparent_temperature: 27,
        precipitation: 0,
        weather_code: 2,
        cloud_cover: 40,
        wind_speed_10m: 12,
        wind_direction_10m: 90,
        wind_gusts_10m: 20,
    },
    hourly: {
        time: hours,
        temperature_2m: [24, 26, 28],
        apparent_temperature: [25, 27, 29],
        precipitation_probability: [20, 40, 10],
        precipitation: [1, 2, 0],
        weather_code: [1, 2, 3],
        cloud_cover: [20, 40, 60],
        wind_speed_10m: [10, 14, 18],
        wind_direction_10m: [80, 100, 120],
        wind_gusts_10m: [18, 22, 25],
    },
} as OpenMeteoForecastResponseDTO;
const marine = {
    hourly: {
        time: hours,
        wave_height: [0.8, 1.2, 1],
        wave_direction: [90, 100, 110],
        wave_period: [8, 10, 9],
        swell_wave_height: [0.5, 0.7, 0.6],
        swell_wave_direction: [80, 90, 100],
        swell_wave_period: [10, 12, 11],
        sea_surface_temperature: [22, 23, 24],
    },
} as OpenMeteoMarineResponseDTO;

describe('ConsultarCondicoesPraiaUseCase', () => {
    const catalog: jest.Mocked<IPraiaCatalogService> = {
        listar: jest.fn(),
        buscarPorSlug: jest.fn().mockReturnValue(praia),
        buscarPorId: jest.fn(),
        listarAtivasParaRecomendacao: jest.fn(),
    };
    const forecastService: jest.Mocked<IOpenMeteoForecastService> = {
        obterPrevisao: jest.fn().mockResolvedValue(forecast),
    };
    const marineService: jest.Mocked<IOpenMeteoMarineService> = {
        obterPrevisao: jest.fn().mockResolvedValue(marine),
    };
    const clock: IClockService = { now: () => new Date('2026-11-28T15:00:00.000Z') };

    it('agrega a manhã no fuso local e avalia todos os objetivos', async () => {
        const useCase = new ConsultarCondicoesPraiaUseCase(
            catalog,
            forecastService,
            marineService,
            clock,
        );

        const result = await useCase.execute({ slug: 'canasvieiras', periodo: 'manha', data: '2026-11-28' });

        expect(result.dados.clima).toEqual({
            temperaturaMediaC: 25,
            sensacaoTermicaMediaC: 26,
            probabilidadeChuvaMaximaPct: 40,
            precipitacaoTotalMm: 3,
            velocidadeVentoMediaKmH: 12,
            velocidadeRajadaMaximaKmH: 22,
            direcaoVentoPredominanteGraus: 90,
            codigoTempo: 2,
        });
        expect(result.dados.mar.alturaOndaMediaM).toBe(1);
        expect(result.dados.mar.alturaOndaMaximaM).toBe(1.2);
        expect(result.dados.mar.temperaturaSuperficieAguaMediaC).toBe(22.5);
        expect(Object.keys(result.dados.avaliacoes)).toEqual(['relaxar', 'banho', 'surf', 'criancas']);
        expect(result.dados.avaliacoes.banho.alertas).toEqual(
            expect.arrayContaining([expect.objectContaining({ codigo: 'balneabilidade-indisponivel' })]),
        );
        expect(result.dados.fontes.map((fonte) => fonte.nome)).toEqual([
            'open-meteo-forecast',
            'open-meteo-marine',
        ]);
    });

    it('não consulta APIs para ponto não ativado', async () => {
        catalog.buscarPorSlug.mockReturnValueOnce({ ...praia, ativo: false });
        const useCase = new ConsultarCondicoesPraiaUseCase(
            catalog,
            forecastService,
            marineService,
            clock,
        );

        await expect(useCase.execute({ slug: 'canasvieiras', periodo: 'dia' })).rejects.toMatchObject({
            statusCode: 422,
        });
        expect(forecastService.obterPrevisao).not.toHaveBeenCalled();
    });
});
