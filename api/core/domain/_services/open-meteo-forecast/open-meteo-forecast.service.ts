export type ISODateDTO = string;
export type ISODateTimeDTO = string;
export type NullableNumberArrayDTO = Array<number | null>;
export type NullableStringArrayDTO = Array<string | null>;

export interface OpenMeteoForecastRequestDTO {
    latitude: number;
    longitude: number;
    current: string;
    hourly: string;
    daily: string;
    timezone: 'America/Sao_Paulo';
    forecast_days: 7;
}

export interface OpenMeteoForecastResponseDTO {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number | null;
    current_units: OpenMeteoForecastCurrentUnitsDTO;
    current: OpenMeteoForecastCurrentDTO;
    hourly_units: OpenMeteoForecastHourlyUnitsDTO;
    hourly: OpenMeteoForecastHourlyDTO;
    daily_units: OpenMeteoForecastDailyUnitsDTO;
    daily: OpenMeteoForecastDailyDTO;
}

export interface OpenMeteoForecastCurrentUnitsDTO {
    time: 'iso8601';
    interval: 'seconds';
    temperature_2m: '°C';
    apparent_temperature: '°C';
    precipitation: 'mm';
    weather_code: 'wmo code';
    cloud_cover: '%';
    wind_speed_10m: 'km/h';
    wind_direction_10m: '°';
    wind_gusts_10m: 'km/h';
}

export interface OpenMeteoForecastCurrentDTO {
    time: ISODateTimeDTO;
    interval: number;
    temperature_2m: number | null;
    apparent_temperature: number | null;
    precipitation: number | null;
    weather_code: number | null;
    cloud_cover: number | null;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
    wind_gusts_10m: number | null;
}

export interface OpenMeteoForecastHourlyUnitsDTO {
    time: 'iso8601';
    temperature_2m: '°C';
    apparent_temperature: '°C';
    precipitation_probability: '%';
    precipitation: 'mm';
    weather_code: 'wmo code';
    cloud_cover: '%';
    wind_speed_10m: 'km/h';
    wind_direction_10m: '°';
    wind_gusts_10m: 'km/h';
}

export interface OpenMeteoForecastHourlyDTO {
    time: string[];
    temperature_2m: NullableNumberArrayDTO;
    apparent_temperature: NullableNumberArrayDTO;
    precipitation_probability: NullableNumberArrayDTO;
    precipitation: NullableNumberArrayDTO;
    weather_code: NullableNumberArrayDTO;
    cloud_cover: NullableNumberArrayDTO;
    wind_speed_10m: NullableNumberArrayDTO;
    wind_direction_10m: NullableNumberArrayDTO;
    wind_gusts_10m: NullableNumberArrayDTO;
}

export interface OpenMeteoForecastDailyUnitsDTO {
    time: 'iso8601';
    weather_code: 'wmo code';
    temperature_2m_max: '°C';
    temperature_2m_min: '°C';
    precipitation_sum: 'mm';
    precipitation_probability_max: '%';
    sunrise: 'iso8601';
    sunset: 'iso8601';
    wind_speed_10m_max: 'km/h';
    wind_gusts_10m_max: 'km/h';
    wind_direction_10m_dominant: '°';
}

export interface OpenMeteoForecastDailyDTO {
    time: string[];
    weather_code: NullableNumberArrayDTO;
    temperature_2m_max: NullableNumberArrayDTO;
    temperature_2m_min: NullableNumberArrayDTO;
    precipitation_sum: NullableNumberArrayDTO;
    precipitation_probability_max: NullableNumberArrayDTO;
    sunrise: NullableStringArrayDTO;
    sunset: NullableStringArrayDTO;
    wind_speed_10m_max: NullableNumberArrayDTO;
    wind_gusts_10m_max: NullableNumberArrayDTO;
    wind_direction_10m_dominant: NullableNumberArrayDTO;
}

export interface OpenMeteoErrorResponseDTO {
    error: true;
    reason: string;
}

export interface IOpenMeteoForecastService {
    obterPrevisao(latitude: number, longitude: number): Promise<OpenMeteoForecastResponseDTO>;
}
