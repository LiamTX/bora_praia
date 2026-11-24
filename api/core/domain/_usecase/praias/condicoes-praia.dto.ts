import { PraiaResumoDTO } from '@domain/_usecase/praias/praia.dto';

export type ObjetivoDTO = 'relaxar' | 'banho' | 'surf' | 'criancas';
export type PeriodoDTO = 'agora' | 'manha' | 'tarde' | 'dia';
export type SituacaoDTO = 'muito_favoravel' | 'favoravel' | 'moderada' | 'pouco_favoravel' | 'desfavoravel';
export type ConfiancaDTO = 'alta' | 'media' | 'baixa';
export type SeveridadeAlertaDTO = 'informativa' | 'atencao' | 'critica';

export interface AlertaDTO {
    codigo: string;
    mensagem: string;
    severidade: SeveridadeAlertaDTO;
    fonte: string | null;
    atualizadoEm: string | null;
}

export interface AvaliacaoPraiaDTO {
    nota: number;
    situacao: SituacaoDTO;
    motivos: string[];
    alertas: AlertaDTO[];
    confianca: ConfiancaDTO;
}

export interface ClimaPeriodoDTO {
    temperaturaMediaC: number | null;
    sensacaoTermicaMediaC: number | null;
    probabilidadeChuvaMaximaPct: number | null;
    precipitacaoTotalMm: number | null;
    velocidadeVentoMediaKmH: number | null;
    velocidadeRajadaMaximaKmH: number | null;
    direcaoVentoPredominanteGraus: number | null;
    codigoTempo: number | null;
}

export interface MarPeriodoDTO {
    alturaOndaMediaM: number | null;
    alturaOndaMaximaM: number | null;
    direcaoOndaPredominanteGraus: number | null;
    periodoOndaMaximoS: number | null;
    alturaSwellMaximaM: number | null;
    direcaoSwellPredominanteGraus: number | null;
    periodoSwellMaximoS: number | null;
    temperaturaSuperficieAguaMediaC: number | null;
}

export interface FonteDadosDTO {
    nome: 'open-meteo-forecast' | 'open-meteo-marine';
    consultadoEm: string;
}

export interface CondicoesPraiaDTO {
    praia: PraiaResumoDTO;
    data: string;
    periodo: PeriodoDTO;
    atualizadoEm: string;
    clima: ClimaPeriodoDTO;
    mar: MarPeriodoDTO;
    avaliacoes: Record<ObjetivoDTO, AvaliacaoPraiaDTO>;
    fontes: FonteDadosDTO[];
}
