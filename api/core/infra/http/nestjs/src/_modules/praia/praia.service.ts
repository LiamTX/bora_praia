import { IListarPraiasUseCase } from '@domain/_usecase/praias/listar-praias.usecase';
import { IConsultarPraiaUseCase } from '@domain/_usecase/praias/consultar-praia.usecase';
import { IConsultarCondicoesPraiaUseCase } from '@domain/_usecase/praias/consultar-condicoes-praia.usecase';
import { IObterRecomendacoesUseCase } from '@domain/_usecase/recomendacoes/obter-recomendacoes.usecase';
import { ConsultarPraiaRequestDto } from '@nest/_modules/praia/dto/consultar-praia.dto';
import { ConsultarCondicoesPraiaRequestDto } from '@nest/_modules/praia/dto/consultar-condicoes-praia.dto';
import { ObterRecomendacoesRequestDto } from '@nest/_modules/praia/dto/obter-recomendacoes.dto';

export class PraiaService {
    constructor(
        private readonly listarPraiasUseCase: IListarPraiasUseCase,
        private readonly consultarPraiaUseCase: IConsultarPraiaUseCase,
        private readonly consultarCondicoesPraiaUseCase: IConsultarCondicoesPraiaUseCase,
        private readonly obterRecomendacoesUseCase: IObterRecomendacoesUseCase,
    ) {}

    async listar(_input: Record<string, never>) {
        return this.listarPraiasUseCase.execute();
    }

    async consultar(input: ConsultarPraiaRequestDto) {
        return this.consultarPraiaUseCase.execute(input);
    }

    async consultarCondicoes(input: ConsultarCondicoesPraiaRequestDto & ConsultarPraiaRequestDto) {
        return this.consultarCondicoesPraiaUseCase.execute(input);
    }

    async obterRecomendacoes(input: ObterRecomendacoesRequestDto) {
        return this.obterRecomendacoesUseCase.execute(input);
    }
}
