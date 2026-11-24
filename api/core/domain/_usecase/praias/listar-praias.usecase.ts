import { PraiaResumoDTO } from '@domain/_usecase/praias/praia.dto';

export interface ListarPraiasResponseDTO {
    dados: PraiaResumoDTO[];
}

export interface IListarPraiasUseCase {
    execute(): Promise<ListarPraiasResponseDTO>;
}
