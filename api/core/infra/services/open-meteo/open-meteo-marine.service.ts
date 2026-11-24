import {
    IOpenMeteoMarineService,
    OpenMeteoMarineRequestDTO,
    OpenMeteoMarineResponseDTO,
} from '@domain/_services/open-meteo-marine/open-meteo-marine.service';
import { openMeteoRequest } from '@infra/services/open-meteo/open-meteo-client';

export class OpenMeteoMarineService implements IOpenMeteoMarineService {
    private readonly cache = new Map();

    async obterPrevisao(latitude: number, longitude: number): Promise<OpenMeteoMarineResponseDTO> {
        const request: OpenMeteoMarineRequestDTO = {
            latitude,
            longitude,
            hourly:
                'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature',
            daily:
                'wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max',
            timezone: 'America/Sao_Paulo',
            cell_selection: 'sea',
            forecast_days: 7,
        };
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(request)) params.set(key, String(value));

        return openMeteoRequest<OpenMeteoMarineResponseDTO>(
            `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`,
            this.cache,
        );
    }
}
