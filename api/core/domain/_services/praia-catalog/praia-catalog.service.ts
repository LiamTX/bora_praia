import { IPraia } from '@domain/db/entities/praia.entity';

export interface IPraiaCatalogService {
    listar(): IPraia[];
    buscarPorSlug(slug: string): IPraia | undefined;
    buscarPorId(id: string): IPraia | undefined;
    listarAtivasParaRecomendacao(): IPraia[];
}
