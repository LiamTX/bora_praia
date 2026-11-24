import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConsultarPraiaRequestDto {
    @ApiProperty({ example: 'canasvieiras' })
    @IsNotEmpty({ message: 'O slug da praia é obrigatório.' })
    @IsString()
    slug: string;
}
