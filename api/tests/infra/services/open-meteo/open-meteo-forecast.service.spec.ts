import { OpenMeteoForecastService } from '@infra/services/open-meteo/open-meteo-forecast.service';

describe('OpenMeteoForecastService', () => {
    afterEach(() => jest.restoreAllMocks());

    it('monta a requisição com os campos e parâmetros contratados', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ current: {}, hourly: {}, daily: {} }),
        } as unknown as Response);
        const service = new OpenMeteoForecastService();

        await service.obterPrevisao(-27.42776, -48.47231);

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
        expect(url.searchParams.get('latitude')).toBe('-27.42776');
        expect(url.searchParams.get('longitude')).toBe('-48.47231');
        expect(url.searchParams.get('timezone')).toBe('America/Sao_Paulo');
        expect(url.searchParams.get('forecast_days')).toBe('7');
        expect(url.searchParams.get('current')).toContain('wind_gusts_10m');
        expect(url.searchParams.get('hourly')).toContain('precipitation_probability');
        expect(url.searchParams.get('daily')).toContain('sunset');
    });

    it('propaga a razão retornada pelo Open-Meteo como erro de serviço', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({ error: true, reason: 'Invalid coordinate' }),
        } as unknown as Response);
        const service = new OpenMeteoForecastService();

        await expect(service.obterPrevisao(-27, -48)).rejects.toMatchObject({
            statusCode: 502,
            message: 'Invalid coordinate',
        });
    });
});
