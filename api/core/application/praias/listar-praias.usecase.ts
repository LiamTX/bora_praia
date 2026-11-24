import { praiaResumo } from '@application/_shared/praia-resumo';
import { IListarPraiasUseCase, ListarPraiasResponseDTO } from '@domain/_usecase/praias/listar-praias.usecase';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';

export class ListarPraiasUseCase implements IListarPraiasUseCase {
    constructor(private readonly praiaCatalogService: IPraiaCatalogService) {}

    async execute(): Promise<ListarPraiasResponseDTO> {
        const dados = this.praiaCatalogService
            .listar()
            .filter(
                (praia) =>
                    praia.visivelCatalogo !== false && praia.latitude !== null && praia.longitude !== null,
            )
            .map(praiaResumo);

        return { dados };
    }
}
