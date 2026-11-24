import { agregarClima, agregarMar } from '@application/_shared/agregar-periodo';
import { avaliarPraia } from '@application/_shared/avaliar-praia';
import { resolverDataPrevisao } from '@application/_shared/data-local';
import { praiaResumo } from '@application/_shared/praia-resumo';
import { AppError } from '@application/error';
import {
    ConsultarCondicoesPraiaInput,
    ConsultarCondicoesPraiaResponseDTO,
    IConsultarCondicoesPraiaUseCase,
} from '@domain/_usecase/praias/consultar-condicoes-praia.usecase';
import { ObjetivoDTO } from '@domain/_usecase/praias/condicoes-praia.dto';
import { IPraiaCatalogService } from '@domain/_services/praia-catalog/praia-catalog.service';
import { IClockService } from '@domain/_services/clock/clock.service';
import { IOpenMeteoForecastService } from '@domain/_services/open-meteo-forecast/open-meteo-forecast.service';
import { IOpenMeteoMarineService } from '@domain/_services/open-meteo-marine/open-meteo-marine.service';

export class ConsultarCondicoesPraiaUseCase implements IConsultarCondicoesPraiaUseCase {
    constructor(
        private readonly praiaCatalogService: IPraiaCatalogService,
        private readonly forecastService: IOpenMeteoForecastService,
        private readonly marineService: IOpenMeteoMarineService,
        private readonly clockService: IClockService,
    ) {}

    async execute(input: ConsultarCondicoesPraiaInput): Promise<ConsultarCondicoesPraiaResponseDTO> {
        const praia = this.praiaCatalogService.buscarPorSlug(input.slug);
        if (!praia || praia.visivelCatalogo === false) throw new AppError('Praia não encontrada.', 404);
        if (!praia.ativo || !praia.elegivelRecomendacao) {
            throw new AppError('Este local ainda não está ativado para consulta automática de condições.', 422);
        }

        const pontoPrevisao = praia.previsaoDe
            ? this.praiaCatalogService.buscarPorId(praia.previsaoDe)
            : praia;
        if (!pontoPrevisao || pontoPrevisao.latitude === null || pontoPrevisao.longitude === null) {
            throw new AppError('O ponto de previsão deste local não está disponível.', 422);
        }

        const now = this.clockService.now();
        const data = resolverDataPrevisao(input.data, now);
        const [forecast, marine] = await Promise.all([
            this.forecastService.obterPrevisao(pontoPrevisao.latitude, pontoPrevisao.longitude),
            this.marineService.obterPrevisao(pontoPrevisao.latitude, pontoPrevisao.longitude),
        ]);
        const clima = agregarClima(forecast, data, input.periodo, now);
        const mar = agregarMar(marine, data, input.periodo, now);
        const consultadoEm = now.toISOString();
        const avaliacoes = Object.fromEntries(
            (['relaxar', 'banho', 'surf', 'criancas'] as ObjetivoDTO[]).map((objetivo) => [
                objetivo,
                avaliarPraia(praia, objetivo, clima, mar),
            ]),
        ) as ConsultarCondicoesPraiaResponseDTO['dados']['avaliacoes'];

        return {
            dados: {
                praia: praiaResumo(praia),
                data,
                periodo: input.periodo,
                atualizadoEm: consultadoEm,
                clima,
                mar,
                avaliacoes,
                fontes: [
                    { nome: 'open-meteo-forecast', consultadoEm },
                    { nome: 'open-meteo-marine', consultadoEm },
                ],
            },
        };
    }
}
