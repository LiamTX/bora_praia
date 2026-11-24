import {
    PRAIA_CATALOG_VERSION,
    PRAIAS_CATALOG,
} from '@infra/services/praia-catalog/praia-catalog.data';

describe('PRAIAS_CATALOG', () => {
    it('possui versão e identificadores estáveis e únicos', () => {
        expect(PRAIA_CATALOG_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
        expect(PRAIAS_CATALOG.length).toBeGreaterThan(80);

        expect(new Set(PRAIAS_CATALOG.map((praia) => praia.id)).size).toBe(PRAIAS_CATALOG.length);
        expect(new Set(PRAIAS_CATALOG.map((praia) => praia.slug)).size).toBe(PRAIAS_CATALOG.length);
    });

    it('não ativa coordenadas aproximadas, pontos indefinidos ou locais não elegíveis', () => {
        const ativosInvalidos = PRAIAS_CATALOG.filter(
            (praia) =>
                praia.ativo &&
                (!praia.elegivelRecomendacao ||
                    praia.precisaoCoordenada !== 'oficial_ima' ||
                    praia.latitude === null ||
                    praia.longitude === null),
        );

        expect(ativosInvalidos).toEqual([]);
        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'matadeiro')?.ativo).toBe(false);
        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'praia-de-cima')?.ativo).toBe(false);
        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'beira-mar-norte')?.elegivelRecomendacao).toBe(false);
    });

    it('mantém relacionamentos de segmentos válidos', () => {
        const ids = new Set(PRAIAS_CATALOG.map((praia) => praia.id));

        for (const praia of PRAIAS_CATALOG) {
            if (praia.segmentoDe) expect(ids.has(praia.segmentoDe)).toBe(true);
            if (praia.previsaoDe) expect(ids.has(praia.previsaoDe)).toBe(true);
        }

        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'praia-do-meio-pinheira')?.segmentoDe).toBe(
            'pinheira',
        );
        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'jurere-internacional')?.previsaoDe).toBe(
            'jurere-tradicional',
        );
    });

    it('preserva perfis como editoriais e registra alertas estruturais', () => {
        for (const praia of PRAIAS_CATALOG) {
            expect(praia.perfilEstatico.length).toBeGreaterThan(0);
            expect(praia.fonteLocalizacao.length).toBeGreaterThan(0);
        }

        expect(PRAIAS_CATALOG.find((praia) => praia.slug === 'barra-da-lagoa')?.alertasEstruturais).toEqual(
            expect.arrayContaining([expect.objectContaining({ codigo: 'canal-corrente' })]),
        );
    });
});
