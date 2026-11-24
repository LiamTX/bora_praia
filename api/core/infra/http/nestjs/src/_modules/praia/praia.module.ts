import { Module } from '@nestjs/common';
import { ListarPraiasUseCase } from '@application/praias/listar-praias.usecase';
import { ConsultarPraiaUseCase } from '@application/praias/consultar-praia.usecase';
import { ConsultarCondicoesPraiaUseCase } from '@application/praias/consultar-condicoes-praia.usecase';
import { ObterRecomendacoesUseCase } from '@application/recomendacoes/obter-recomendacoes.usecase';
import { PraiaCatalogService } from '@infra/services/praia-catalog/praia-catalog.service';
import { OpenMeteoForecastService } from '@infra/services/open-meteo/open-meteo-forecast.service';
import { OpenMeteoMarineService } from '@infra/services/open-meteo/open-meteo-marine.service';
import { SystemClockService } from '@infra/services/clock/system-clock.service';
import { PraiaController } from '@nest/_modules/praia/praia.controller';
import { PraiaService } from '@nest/_modules/praia/praia.service';

@Module({
    controllers: [PraiaController],
    providers: [
        { provide: PraiaCatalogService, useFactory: () => new PraiaCatalogService() },
        { provide: OpenMeteoForecastService, useFactory: () => new OpenMeteoForecastService() },
        { provide: OpenMeteoMarineService, useFactory: () => new OpenMeteoMarineService() },
        { provide: SystemClockService, useFactory: () => new SystemClockService() },
        {
            provide: ListarPraiasUseCase,
            useFactory: (catalog: PraiaCatalogService) => new ListarPraiasUseCase(catalog),
            inject: [PraiaCatalogService],
        },
        {
            provide: ConsultarPraiaUseCase,
            useFactory: (catalog: PraiaCatalogService) => new ConsultarPraiaUseCase(catalog),
            inject: [PraiaCatalogService],
        },
        {
            provide: ConsultarCondicoesPraiaUseCase,
            useFactory: (
                catalog: PraiaCatalogService,
                forecast: OpenMeteoForecastService,
                marine: OpenMeteoMarineService,
                clock: SystemClockService,
            ) => new ConsultarCondicoesPraiaUseCase(catalog, forecast, marine, clock),
            inject: [PraiaCatalogService, OpenMeteoForecastService, OpenMeteoMarineService, SystemClockService],
        },
        {
            provide: ObterRecomendacoesUseCase,
            useFactory: (
                catalog: PraiaCatalogService,
                condicoes: ConsultarCondicoesPraiaUseCase,
                clock: SystemClockService,
            ) => new ObterRecomendacoesUseCase(catalog, condicoes, clock),
            inject: [PraiaCatalogService, ConsultarCondicoesPraiaUseCase, SystemClockService],
        },
        {
            provide: PraiaService,
            useFactory: (
                listar: ListarPraiasUseCase,
                consultar: ConsultarPraiaUseCase,
                condicoes: ConsultarCondicoesPraiaUseCase,
                recomendacoes: ObterRecomendacoesUseCase,
            ) => new PraiaService(listar, consultar, condicoes, recomendacoes),
            inject: [
                ListarPraiasUseCase,
                ConsultarPraiaUseCase,
                ConsultarCondicoesPraiaUseCase,
                ObterRecomendacoesUseCase,
            ],
        },
    ],
})
export class PraiaModule {}
