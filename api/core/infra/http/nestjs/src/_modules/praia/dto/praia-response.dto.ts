import { ApiProperty } from '@nestjs/swagger';
import {
    ClimaPeriodoDTO,
    FonteDadosDTO,
    MarPeriodoDTO,
    ObjetivoDTO,
    PeriodoDTO,
} from '@domain/_usecase/praias/condicoes-praia.dto';
import { RecomendacaoPraiaDTO } from '@domain/_usecase/recomendacoes/obter-recomendacoes.usecase';

export class PraiaResumoDto {
    @ApiProperty() id: string;
    @ApiProperty() slug: string;
    @ApiProperty() nome: string;
    @ApiProperty() regiao: string;
    @ApiProperty() latitude: number;
    @ApiProperty() longitude: number;
}

export class CaracteristicasPraiaDto {
    @ApiProperty() indicadaParaBanho: boolean;
    @ApiProperty() indicadaParaSurf: boolean;
    @ApiProperty() possuiTrechosProtegidos: boolean;
    @ApiProperty({ type: [String] }) observacoes: string[];
}

export class PraiaDetalheDto extends PraiaResumoDto {
    @ApiProperty({ type: CaracteristicasPraiaDto }) caracteristicas: CaracteristicasPraiaDto;
}

export class ListarPraiasDataDto {
    @ApiProperty({ type: [PraiaResumoDto] }) dados: PraiaResumoDto[];
}

export class ConsultarPraiaDataDto {
    @ApiProperty({ type: PraiaDetalheDto }) dados: PraiaDetalheDto;
}

export class CondicoesPraiaDataDto {
    @ApiProperty() dados: {
        praia: PraiaResumoDto;
        data: string;
        periodo: PeriodoDTO;
        atualizadoEm: string;
        clima: ClimaPeriodoDTO;
        mar: MarPeriodoDTO;
        avaliacoes: Record<ObjetivoDTO, unknown>;
        fontes: FonteDadosDTO[];
    };
}

export class RecomendacoesDataDto {
    @ApiProperty() dados: {
        objetivo: ObjetivoDTO;
        data: string;
        periodo: PeriodoDTO;
        geradoEm: string;
        recomendacoes: RecomendacaoPraiaDTO[];
        fontes: FonteDadosDTO[];
    };
}

export class ListarPraiasHttpResponseDto {
    @ApiProperty({ type: ListarPraiasDataDto }) data: ListarPraiasDataDto;
    @ApiProperty({ example: 200 }) statusCode: number;
    @ApiProperty({ nullable: true, example: null }) message: string | null;
}

export class ConsultarPraiaHttpResponseDto {
    @ApiProperty({ type: ConsultarPraiaDataDto }) data: ConsultarPraiaDataDto;
    @ApiProperty({ example: 200 }) statusCode: number;
    @ApiProperty({ nullable: true, example: null }) message: string | null;
}

export class CondicoesPraiaHttpResponseDto {
    @ApiProperty({ type: CondicoesPraiaDataDto }) data: CondicoesPraiaDataDto;
    @ApiProperty({ example: 200 }) statusCode: number;
    @ApiProperty({ nullable: true, example: null }) message: string | null;
}

export class RecomendacoesHttpResponseDto {
    @ApiProperty({ type: RecomendacoesDataDto }) data: RecomendacoesDataDto;
    @ApiProperty({ example: 200 }) statusCode: number;
    @ApiProperty({ nullable: true, example: null }) message: string | null;
}
