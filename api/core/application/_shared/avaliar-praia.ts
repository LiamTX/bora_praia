import {
    AlertaDTO,
    AvaliacaoPraiaDTO,
    ClimaPeriodoDTO,
    ConfiancaDTO,
    MarPeriodoDTO,
    ObjetivoDTO,
    SituacaoDTO,
} from '@domain/_usecase/praias/condicoes-praia.dto';
import { IPraia } from '@domain/db/entities/praia.entity';

function situacao(nota: number): SituacaoDTO {
    if (nota >= 80) return 'muito_favoravel';
    if (nota >= 65) return 'favoravel';
    if (nota >= 50) return 'moderada';
    if (nota >= 35) return 'pouco_favoravel';
    return 'desfavoravel';
}

export function avaliarPraia(
    praia: IPraia,
    objetivo: ObjetivoDTO,
    clima: ClimaPeriodoDTO,
    mar: MarPeriodoDTO,
): AvaliacaoPraiaDTO {
    let nota = 100;
    const motivos: string[] = [];
    const alertas: AlertaDTO[] = praia.alertasEstruturais.map((alerta) => ({
        ...alerta,
        severidade: 'informativa',
        fonte: null,
        atualizadoEm: null,
    }));
    let dadosDisponiveis = 0;

    if (praia.requerBalneabilidadeRecente) {
        alertas.push({
            codigo: 'balneabilidade-indisponivel',
            mensagem: 'A avaliação não inclui um boletim recente de balneabilidade; consulte o IMA antes do banho.',
            severidade: 'atencao',
            fonte: null,
            atualizadoEm: null,
        });
    }

    if (clima.probabilidadeChuvaMaximaPct === null) {
        alertas.push({
            codigo: 'chuva-indisponivel',
            mensagem: 'A probabilidade de chuva não está disponível para este período.',
            severidade: 'atencao',
            fonte: 'open-meteo-forecast',
            atualizadoEm: null,
        });
    } else {
        dadosDisponiveis++;
        if (clima.probabilidadeChuvaMaximaPct >= 60) {
            nota -= objetivo === 'surf' ? 15 : 30;
            motivos.push(`A probabilidade máxima de chuva é ${clima.probabilidadeChuvaMaximaPct}%.`);
        } else if (clima.probabilidadeChuvaMaximaPct >= 30) {
            nota -= 10;
            motivos.push(`Há possibilidade de chuva no período (${clima.probabilidadeChuvaMaximaPct}%).`);
        } else {
            motivos.push(`A probabilidade máxima de chuva é baixa (${clima.probabilidadeChuvaMaximaPct}%).`);
        }
    }

    if (clima.velocidadeVentoMediaKmH === null) {
        alertas.push({
            codigo: 'vento-indisponivel',
            mensagem: 'A previsão de vento não está disponível para este período.',
            severidade: 'atencao',
            fonte: 'open-meteo-forecast',
            atualizadoEm: null,
        });
    } else {
        dadosDisponiveis++;
        const vento = clima.velocidadeVentoMediaKmH;
        if (objetivo !== 'surf' && vento >= 30) {
            nota -= 25;
            motivos.push(`O vento médio de ${vento} km/h reduz o conforto previsto.`);
        } else if (objetivo !== 'surf' && vento >= 18) {
            nota -= 10;
            motivos.push(`O vento médio previsto é ${vento} km/h.`);
        } else {
            motivos.push(`O vento médio previsto é ${vento} km/h.`);
        }
    }

    if (mar.alturaOndaMaximaM === null) {
        nota -= 30;
        alertas.push({
            codigo: 'ondas-indisponiveis',
            mensagem: 'A previsão de ondas não está disponível; ausência de dado não representa mar calmo.',
            severidade: 'critica',
            fonte: 'open-meteo-marine',
            atualizadoEm: null,
        });
    } else {
        dadosDisponiveis++;
        const onda = mar.alturaOndaMaximaM;
        if (objetivo === 'surf') {
            if (onda < 0.4) {
                nota -= 35;
                motivos.push(`A altura máxima prevista de ${onda} m é baixa para surf.`);
            } else if (onda > 2.5) {
                nota -= 40;
                motivos.push(`A altura máxima prevista de ${onda} m exige cautela e experiência.`);
            } else {
                motivos.push(`A altura máxima prevista das ondas é ${onda} m.`);
            }
        } else {
            const limite = objetivo === 'criancas' ? 0.6 : objetivo === 'banho' ? 1 : 1.5;
            if (onda > limite * 1.5) {
                nota -= objetivo === 'criancas' ? 50 : 35;
                motivos.push(`A altura máxima prevista de ${onda} m é elevada para o objetivo.`);
            } else if (onda > limite) {
                nota -= objetivo === 'criancas' ? 30 : 20;
                motivos.push(`A altura máxima prevista de ${onda} m requer atenção para o objetivo.`);
            } else {
                motivos.push(`A altura máxima prevista das ondas é ${onda} m.`);
            }
        }
    }

    if (objetivo === 'criancas' && !praia.indicacaoEstatica.includes('familia')) {
        nota -= 15;
        motivos.push('O cadastro editorial não destaca este local como procurado por famílias.');
    }

    const confianca: ConfiancaDTO = dadosDisponiveis === 3 ? 'alta' : dadosDisponiveis === 0 ? 'baixa' : 'media';
    if (dadosDisponiveis === 0) nota = Math.min(nota, 34);
    nota = Math.max(0, Math.min(100, Math.round(nota)));

    return { nota, situacao: situacao(nota), motivos, alertas, confianca };
}
