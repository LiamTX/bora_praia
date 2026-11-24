import { AppError } from '@application/error';

const TIME_ZONE = 'America/Sao_Paulo';

export function dataLocal(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

export function horaLocal(date: Date): number {
    return Number(
        new Intl.DateTimeFormat('en-US', {
            timeZone: TIME_ZONE,
            hour: '2-digit',
            hourCycle: 'h23',
        }).format(date),
    );
}

export function resolverDataPrevisao(data: string | undefined, now: Date): string {
    const hoje = dataLocal(now);
    const resultado = data ?? hoje;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(resultado);
    if (!match) throw new AppError('A data deve usar o formato YYYY-MM-DD.', 400);

    const ano = Number(match[1]);
    const mes = Number(match[2]);
    const dia = Number(match[3]);
    const timestamp = Date.UTC(ano, mes - 1, dia);
    const valida = new Date(timestamp);
    if (
        valida.getUTCFullYear() !== ano ||
        valida.getUTCMonth() !== mes - 1 ||
        valida.getUTCDate() !== dia
    ) {
        throw new AppError('A data informada é inválida.', 400);
    }

    const [anoHoje, mesHoje, diaHoje] = hoje.split('-').map(Number);
    const diferencaDias = Math.round(
        (timestamp - Date.UTC(anoHoje, mesHoje - 1, diaHoje)) / 86400000,
    );
    if (diferencaDias < 0 || diferencaDias > 6) {
        throw new AppError('A data deve estar entre hoje e os próximos seis dias.', 400);
    }

    return resultado;
}
