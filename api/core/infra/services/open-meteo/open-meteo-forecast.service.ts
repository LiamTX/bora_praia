import {
    IOpenMeteoForecastService,
    OpenMeteoForecastRequestDTO,
    OpenMeteoForecastResponseDTO,
} from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';
import { openMeteoRequest } from '@infra/services/open-meteo/open-meteo-client';

export class OpenMeteoForecastService implements IOpenMeteoForecastService {
    private readonly cache = new Map();

    async obterPrevisao(latitude: number, longitude: number): Promise<OpenMeteoForecastResponseDTO> {
        const request: OpenMeteoForecastRequestDTO = {
            latitude,
            longitude,
            current:
                'temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
            hourly:
                'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
            daily:
                'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
            timezone: 'America/Sao_Paulo',
            forecast_days: 7,
        };
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(request)) params.set(key, String(value));

        return openMeteoRequest<OpenMeteoForecastResponseDTO>(
            `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
            this.cache,
        );
    }
}
