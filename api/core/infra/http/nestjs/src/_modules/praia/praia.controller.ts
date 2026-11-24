import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from '@application/response';
import { PraiaService } from '@nest/_modules/praia/praia.service';
import { ConsultarPraiaRequestDto } from '@nest/_modules/praia/dto/consultar-praia.dto';
import { ConsultarCondicoesPraiaRequestDto } from '@nest/_modules/praia/dto/consultar-condicoes-praia.dto';
import { ObterRecomendacoesRequestDto } from '@nest/_modules/praia/dto/obter-recomendacoes.dto';
import {
    CondicoesPraiaHttpResponseDto,
    ConsultarPraiaHttpResponseDto,
    ListarPraiasHttpResponseDto,
    RecomendacoesHttpResponseDto,
} from '@nest/_modules/praia/dto/praia-response.dto';

@ApiTags('praias')
@Controller()
export class PraiaController {
    constructor(private readonly praiaService: PraiaService) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiResponse({ status: 200, type: ListarPraiasHttpResponseDto })
    @Get('praias')
    async listar() {
        return Response.success(await this.praiaService.listar({}));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiResponse({ status: 200, type: ConsultarPraiaHttpResponseDto })
    @Get('praias/:slug')
    async consultar(@Param() input: ConsultarPraiaRequestDto) {
        return Response.success(await this.praiaService.consultar(input));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiResponse({ status: 200, type: CondicoesPraiaHttpResponseDto })
    @Get('praias/:slug/condicoes')
    async consultarCondicoes(
        @Param() params: ConsultarPraiaRequestDto,
        @Query() query: ConsultarCondicoesPraiaRequestDto,
    ) {
        return Response.success(await this.praiaService.consultarCondicoes({ ...params, ...query }));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiResponse({ status: 200, type: RecomendacoesHttpResponseDto })
    @Get('recomendacoes')
    async obterRecomendacoes(@Query() input: ObterRecomendacoesRequestDto) {
        return Response.success(await this.praiaService.obterRecomendacoes(input));
    }
}
