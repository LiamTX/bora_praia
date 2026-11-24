import { CondicoesPraiaDTO, PeriodoDTO } from '@domain/_usecase/praias/condicoes-praia.dto';

export interface ConsultarCondicoesPraiaInput {
    slug: string;
    data?: string;
    periodo: PeriodoDTO;
}

export interface ConsultarCondicoesPraiaResponseDTO {
    dados: CondicoesPraiaDTO;
}

export interface IConsultarCondicoesPraiaUseCase {
    execute(input: ConsultarCondicoesPraiaInput): Promise<ConsultarCondicoesPraiaResponseDTO>;
}
