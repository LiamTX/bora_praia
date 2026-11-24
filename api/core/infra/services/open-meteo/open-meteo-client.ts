import { AppError } from '@application/error';
import { OpenMeteoErrorResponseDTO } from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';

interface CacheEntry<T> {
    expiraEm: number;
    valor: Promise<T>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function openMeteoRequest<T extends object>(
    url: string,
    cache: Map<string, CacheEntry<T>>,
): Promise<T> {
    const cached = cache.get(url);
    if (cached && cached.expiraEm > Date.now()) return cached.valor;

    const valor = executeRequest<T>(url);
    cache.set(url, { expiraEm: Date.now() + CACHE_TTL_MS, valor });

    try {
        return await valor;
    } catch (error) {
        cache.delete(url);
        throw error;
    }
}

async function executeRequest<T extends object>(url: string): Promise<T> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const body = (await response.json()) as T | OpenMeteoErrorResponseDTO;

        if (!response.ok || ('error' in body && body.error === true)) {
            const reason = 'reason' in body ? body.reason : 'A previsão externa não está disponível.';
            throw new AppError(reason, 502);
        }

        return body as T;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Não foi possível consultar a previsão externa.', 502);
    }
}
