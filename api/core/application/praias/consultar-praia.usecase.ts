import { praiaResumo } from '@application/_shared/praia-resumo';
import { AppError } from '@application/error';
import {
    ConsultarPraiaInput,
    ConsultarPraiaResponseDTO,
    IConsultarPraiaUseCase,
} from '@domain/_usecase/praias/consultar-praia.usecase';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';

export class ConsultarPraiaUseCase implements IConsultarPraiaUseCase {
    constructor(private readonly praiaCatalogService: IPraiaCatalogService) {}

    async execute(input: ConsultarPraiaInput): Promise<ConsultarPraiaResponseDTO> {
        const praia = this.praiaCatalogService.buscarPorSlug(input.slug);
        if (!praia || praia.visivelCatalogo === false || praia.latitude === null || praia.longitude === null) {
            throw new AppError('Praia não encontrada.', 404);
        }

        return {
            dados: {
                ...praiaResumo(praia),
                caracteristicas: {
                    indicadaParaBanho: praia.indicacaoEstatica.includes('banho'),
                    indicadaParaSurf: praia.indicacaoEstatica.includes('surf'),
                    possuiTrechosProtegidos: ['enseada', 'baia'].includes(praia.ambiente),
                    observacoes: [praia.perfilEstatico],
                },
            },
        };
    }
}
