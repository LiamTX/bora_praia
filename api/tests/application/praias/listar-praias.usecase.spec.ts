import { ListarPraiasUseCase } from '@application/praias/listar-praias.usecase';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IPraia } from '@domain/db/entities/praia.entity';

const praia = {
    id: 'canasvieiras',
    slug: 'canasvieiras',
    nome: 'Canasvieiras',
    regiao: 'Norte da ilha',
    latitude: -27.42776,
    longitude: -48.47231,
} as IPraia;

describe('ListarPraiasUseCase', () => {
    it('lista apenas locais públicos com coordenadas utilizáveis no DTO', async () => {
        const catalog: jest.Mocked<IPraiaCatalogService> = {
            listar: jest.fn().mockReturnValue([praia, { ...praia, id: 'sem-ponto', latitude: null }]),
            buscarPorSlug: jest.fn(),
            buscarPorId: jest.fn(),
            listarAtivasParaRecomendacao: jest.fn(),
        };
        const useCase = new ListarPraiasUseCase(catalog);

        await expect(useCase.execute()).resolves.toEqual({
            dados: [
                {
                    id: 'canasvieiras',
                    slug: 'canasvieiras',
                    nome: 'Canasvieiras',
                    regiao: 'Norte da ilha',
                    latitude: -27.42776,
                    longitude: -48.47231,
                },
            ],
        });
    });
});
