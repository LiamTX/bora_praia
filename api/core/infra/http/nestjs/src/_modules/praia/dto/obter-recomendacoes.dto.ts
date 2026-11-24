import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { ObjetivoDTO, PeriodoDTO } from '@domain/_usecase/praias/condicoes-praia.dto';

export class ObterRecomendacoesRequestDto {
    @ApiProperty({ enum: ['relaxar', 'banho', 'surf', 'criancas'], example: 'relaxar' })
    @IsIn(['relaxar', 'banho', 'surf', 'criancas'], {
        message: 'O objetivo deve ser relaxar, banho, surf ou criancas.',
    })
    objetivo: ObjetivoDTO;

    @ApiPropertyOptional({ example: '2026-11-28' })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve usar o formato YYYY-MM-DD.' })
    data?: string;

    @ApiProperty({ enum: ['agora', 'manha', 'tarde', 'dia'], example: 'manha' })
    @IsIn(['agora', 'manha', 'tarde', 'dia'], { message: 'O período deve ser agora, manha, tarde ou dia.' })
    periodo: PeriodoDTO;
}
