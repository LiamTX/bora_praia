import { ObterRecomendacoesUseCase } from '@application/recomendacoes/obter-recomendacoes.usecase';
import { IConsultarCondicoesPraiaUseCase } from '@domain/_usecase/praias/consultar-condicoes-praia.usecase';
import { CondicoesPraiaDTO } from '@domain/_usecase/praias/condicoes-praia.dto';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IClockService } from '@domain/_services/clock/clock.service';
import { IPraia } from '@domain/db/entities/praia.entity';

const praias = [
    { id: 'uma', slug: 'uma', nome: 'Praia Uma', regiao: 'Norte', latitude: -27, longitude: -48 },
    { id: 'duas', slug: 'duas', nome: 'Praia Duas', regiao: 'Sul', latitude: -27.7, longitude: -48.5 },
] as IPraia[];

function condicoes(praia: IPraia, nota: number): CondicoesPraiaDTO {
    const avaliacao = {
        nota,
        situacao: 'favoravel' as const,
        motivos: ['Condições favoráveis dentro dos critérios da avaliação.'],
        alertas: [],
        confianca: 'alta' as const,
    };
    return {
        praia,
        data: '2026-11-28',
        periodo: 'manha',
        atualizadoEm: '2026-11-28T15:00:00.000Z',
        clima: {
            temperaturaMediaC: 25,
            sensacaoTermicaMediaC: 26,
            probabilidadeChuvaMaximaPct: 10,
            precipitacaoTotalMm: 0,
            velocidadeVentoMediaKmH: 10,
            velocidadeRajadaMaximaKmH: 15,
            direcaoVentoPredominanteGraus: 90,
            codigoTempo: 1,
        },
        mar: {
            alturaOndaMediaM: 0.8,
            alturaOndaMaximaM: 1,
            direcaoOndaPredominanteGraus: 90,
            periodoOndaMaximoS: 10,
            alturaSwellMaximaM: 0.6,
            direcaoSwellPredominanteGraus: 90,
            periodoSwellMaximoS: 12,
            temperaturaSuperficieAguaMediaC: 23,
        },
        avaliacoes: { relaxar: avaliacao, banho: avaliacao, surf: avaliacao, criancas: avaliacao },
        fontes: [],
    };
}

describe('ObterRecomendacoesUseCase', () => {
    it('ranqueia somente o catálogo ativo e elegível, com posições sequenciais', async () => {
        const catalog: jest.Mocked<IPraiaCatalogService> = {
            listar: jest.fn(),
            buscarPorSlug: jest.fn(),
            buscarPorId: jest.fn(),
            listarAtivasParaRecomendacao: jest.fn().mockReturnValue(praias),
        };
        const consultarCondicoes: jest.Mocked<IConsultarCondicoesPraiaUseCase> = {
            execute: jest.fn().mockImplementation(({ slug }) =>
                Promise.resolve({ dados: condicoes(praias.find((praia) => praia.slug === slug), slug === 'uma' ? 65 : 90) }),
            ),
        };
        const clock: IClockService = { now: () => new Date('2026-11-28T15:00:00.000Z') };
        const useCase = new ObterRecomendacoesUseCase(catalog, consultarCondicoes, clock);

        const result = await useCase.execute({ objetivo: 'banho', periodo: 'manha', data: '2026-11-28' });

        expect(result.dados.recomendacoes.map((recomendacao) => recomendacao.praia.slug)).toEqual([
            'duas',
            'uma',
        ]);
        expect(result.dados.recomendacoes.map((recomendacao) => recomendacao.posicao)).toEqual([1, 2]);
        expect(consultarCondicoes.execute).toHaveBeenCalledTimes(2);
        expect(result.dados.geradoEm).toBe('2026-11-28T15:00:00.000Z');
    });
});
