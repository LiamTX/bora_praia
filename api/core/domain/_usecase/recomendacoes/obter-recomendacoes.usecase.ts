import {
    AlertaDTO,
    ClimaPeriodoDTO,
    ConfiancaDTO,
    FonteDadosDTO,
    MarPeriodoDTO,
    ObjetivoDTO,
    PeriodoDTO,
    SituacaoDTO,
} from '@domain/_usecase/praias/condicoes-praia.dto';
import { PraiaResumoDTO } from '@domain/_usecase/praias/praia.dto';

export interface ObterRecomendacoesInput {
    objetivo: ObjetivoDTO;
    data?: string;
    periodo: PeriodoDTO;
}

export interface RecomendacaoPraiaDTO {
    posicao: number;
    praia: PraiaResumoDTO;
    nota: number;
    situacao: SituacaoDTO;
    motivos: string[];
    alertas: AlertaDTO[];
    confianca: ConfiancaDTO;
    clima: ClimaPeriodoDTO;
    mar: MarPeriodoDTO;
}

export interface RecomendacoesDTO {
    objetivo: ObjetivoDTO;
    data: string;
    periodo: PeriodoDTO;
    geradoEm: string;
    recomendacoes: RecomendacaoPraiaDTO[];
    fontes: FonteDadosDTO[];
}

export interface ObterRecomendacoesResponseDTO {
    dados: RecomendacoesDTO;
}

export interface IObterRecomendacoesUseCase {
    execute(input: ObterRecomendacoesInput): Promise<ObterRecomendacoesResponseDTO>;
}
