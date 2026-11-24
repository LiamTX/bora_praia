import { PraiaResumoDTO } from '@domain/_usecase/praias/praia.dto';
import { IPraia } from '@domain/db/entities/praia.entity';

export function praiaResumo(praia: IPraia): PraiaResumoDTO {
    if (praia.latitude === null || praia.longitude === null) {
        throw new Error('Praia sem coordenadas não pode ser convertida para o DTO público.');
    }

    return {
        id: praia.id,
        slug: praia.slug,
        nome: praia.nome,
        regiao: praia.regiao,
        latitude: praia.latitude,
        longitude: praia.longitude,
    };
}
