import { ConsultarPraiaUseCase } from '@application/praias/consultar-praia.usecase';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IPraia } from '@domain/db/entities/praia.entity';

const praia = {
    id: 'joaquina',
    slug: 'joaquina',
    nome: 'Joaquina',
    regiao: 'Leste da ilha',
    latitude: -27.62863,
    longitude: -48.4483,
    indicacaoEstatica: ['banho', 'surf'],
    ambiente: 'oceano_aberto',
    perfilEstatico: 'Praia aberta associada ao surf.',
} as IPraia;

describe('ConsultarPraiaUseCase', () => {
    const catalog: jest.Mocked<IPraiaCatalogService> = {
        listar: jest.fn(),
        buscarPorSlug: jest.fn().mockReturnValue(praia),
        buscarPorId: jest.fn(),
        listarAtivasParaRecomendacao: jest.fn(),
    };

    it('retorna características estáticas sem apresentá-las como observação', async () => {
        const useCase = new ConsultarPraiaUseCase(catalog);

        const result = await useCase.execute({ slug: 'joaquina' });

        expect(result.dados.caracteristicas).toEqual({
            indicadaParaBanho: true,
            indicadaParaSurf: true,
            possuiTrechosProtegidos: false,
            observacoes: [praia.perfilEstatico],
        });
    });

    it('retorna 404 para slug inexistente', async () => {
        catalog.buscarPorSlug.mockReturnValueOnce(undefined);
        const useCase = new ConsultarPraiaUseCase(catalog);

        await expect(useCase.execute({ slug: 'inexistente' })).rejects.toEqual(
            expect.objectContaining({ statusCode: 404 }),
        );
    });
});
