import { dataLocal } from '@application/_shared/data-local';
import {
    IObterRecomendacoesUseCase,
    ObterRecomendacoesInput,
    ObterRecomendacoesResponseDTO,
    RecomendacaoPraiaDTO,
} from '@domain/_usecase/recomendacoes/obter-recomendacoes.usecase';
import { IConsultarCondicoesPraiaUseCase } from '@domain/_usecase/praias/consultar-condicoes-praia.usecase';
import { FonteDadosDTO } from '@domain/_usecase/praias/condicoes-praia.dto';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IClockService } from '@domain/_services/clock/clock.service';

export class ObterRecomendacoesUseCase implements IObterRecomendacoesUseCase {
    constructor(
        private readonly praiaCatalogService: IPraiaCatalogService,
        private readonly consultarCondicoesPraiaUseCase: IConsultarCondicoesPraiaUseCase,
        private readonly clockService: IClockService,
    ) {}

    async execute(input: ObterRecomendacoesInput): Promise<ObterRecomendacoesResponseDTO> {
        const praias = this.praiaCatalogService.listarAtivasParaRecomendacao();
        const condicoes = [];
        for (let index = 0; index < praias.length; index += 4) {
            const lote = praias.slice(index, index + 4);
            const resultados = await Promise.all(
                lote.map((praia) =>
                    this.consultarCondicoesPraiaUseCase.execute({
                        slug: praia.slug,
                        data: input.data,
                        periodo: input.periodo,
                    }),
                ),
            );
            condicoes.push(...resultados.map((resultado) => resultado.dados));
        }

        const recomendacoes = condicoes
            .map((condicao) => {
                const avaliacao = condicao.avaliacoes[input.objetivo];
                return {
                    praia: condicao.praia,
                    nota: avaliacao.nota,
                    situacao: avaliacao.situacao,
                    motivos: avaliacao.motivos,
                    alertas: avaliacao.alertas,
                    confianca: avaliacao.confianca,
                    clima: condicao.clima,
                    mar: condicao.mar,
                };
            })
            .sort((a, b) => b.nota - a.nota || a.praia.nome.localeCompare(b.praia.nome, 'pt-BR'))
            .map((recomendacao, index) => ({ ...recomendacao, posicao: index + 1 })) as RecomendacaoPraiaDTO[];

        const fontes = new Map<string, FonteDadosDTO>();
        for (const condicao of condicoes) {
            for (const fonte of condicao.fontes) {
                const atual = fontes.get(fonte.nome);
                if (!atual || fonte.consultadoEm > atual.consultadoEm) fontes.set(fonte.nome, fonte);
            }
        }
        const now = this.clockService.now();

        return {
            dados: {
                objetivo: input.objetivo,
                data: condicoes[0]?.data ?? input.data ?? dataLocal(now),
                periodo: input.periodo,
                geradoEm: now.toISOString(),
                recomendacoes,
                fontes: [...fontes.values()],
            },
        };
    }
}
