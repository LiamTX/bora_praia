import { PraiaDetalheDTO } from '@domain/_usecase/praias/praia.dto';

export interface ConsultarPraiaInput {
    slug: string;
}

export interface ConsultarPraiaResponseDTO {
    dados: PraiaDetalheDTO;
}

export interface IConsultarPraiaUseCase {
    execute(input: ConsultarPraiaInput): Promise<ConsultarPraiaResponseDTO>;
}
