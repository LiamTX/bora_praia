import {
    NullableNumberArrayDTO,
    OpenMeteoErrorResponseDTO,
} from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';

export interface OpenMeteoMarineRequestDTO {
    latitude: number;
    longitude: number;
    hourly: string;
    daily: string;
    timezone: 'America/Sao_Paulo';
    cell_selection: 'sea';
    forecast_days: 7;
}

export interface OpenMeteoMarineResponseDTO {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number | null;
    hourly_units: OpenMeteoMarineHourlyUnitsDTO;
    hourly: OpenMeteoMarineHourlyDTO;
    daily_units: OpenMeteoMarineDailyUnitsDTO;
    daily: OpenMeteoMarineDailyDTO;
}

export interface OpenMeteoMarineHourlyUnitsDTO {
    time: 'iso8601';
    wave_height: 'm';
    wave_direction: '°';
    wave_period: 's';
    swell_wave_height: 'm';
    swell_wave_direction: '°';
    swell_wave_period: 's';
    sea_surface_temperature: '°C';
}

export interface OpenMeteoMarineHourlyDTO {
    time: string[];
    wave_height: NullableNumberArrayDTO;
    wave_direction: NullableNumberArrayDTO;
    wave_period: NullableNumberArrayDTO;
    swell_wave_height: NullableNumberArrayDTO;
    swell_wave_direction: NullableNumberArrayDTO;
    swell_wave_period: NullableNumberArrayDTO;
    sea_surface_temperature: NullableNumberArrayDTO;
}

export interface OpenMeteoMarineDailyUnitsDTO {
    time: 'iso8601';
    wave_height_max: 'm';
    wave_direction_dominant: '°';
    wave_period_max: 's';
    swell_wave_height_max: 'm';
    swell_wave_direction_dominant: '°';
    swell_wave_period_max: 's';
}

export interface OpenMeteoMarineDailyDTO {
    time: string[];
    wave_height_max: NullableNumberArrayDTO;
    wave_direction_dominant: NullableNumberArrayDTO;
    wave_period_max: NullableNumberArrayDTO;
    swell_wave_height_max: NullableNumberArrayDTO;
    swell_wave_direction_dominant: NullableNumberArrayDTO;
    swell_wave_period_max: NullableNumberArrayDTO;
}

export type OpenMeteoMarineErrorResponseDTO = OpenMeteoErrorResponseDTO;

export interface IOpenMeteoMarineService {
    obterPrevisao(latitude: number, longitude: number): Promise<OpenMeteoMarineResponseDTO>;
}
