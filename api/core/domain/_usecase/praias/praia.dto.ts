export interface PraiaResumoDTO {
    id: string;
    slug: string;
    nome: string;
    regiao: string;
    latitude: number;
    longitude: number;
}

export interface CaracteristicasPraiaDTO {
    indicadaParaBanho: boolean;
    indicadaParaSurf: boolean;
    possuiTrechosProtegidos: boolean;
    observacoes: string[];
}

export interface PraiaDetalheDTO extends PraiaResumoDTO {
    caracteristicas: CaracteristicasPraiaDTO;
}
