import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IPraia } from '@domain/db/entities/praia.entity';
import { PRAIAS_CATALOG } from '@infra/services/praia-catalog/praia-catalog.data';

export class PraiaCatalogService implements IPraiaCatalogService {
    listar(): IPraia[] {
        return PRAIAS_CATALOG;
    }

    buscarPorSlug(slug: string): IPraia | undefined {
        return PRAIAS_CATALOG.find((praia) => praia.slug === slug);
    }

    buscarPorId(id: string): IPraia | undefined {
        return PRAIAS_CATALOG.find((praia) => praia.id === id);
    }

    listarAtivasParaRecomendacao(): IPraia[] {
        return PRAIAS_CATALOG.filter((praia) => praia.ativo && praia.elegivelRecomendacao);
    }
}
