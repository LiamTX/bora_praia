export type PrecisaoCoordenada = 'oficial_ima' | 'aproximada' | 'ponto_a_definir' | 'validada_campo';
export type PrioridadePraia = 'alta' | 'media' | 'baixa' | 'nao_ranquear' | 'produto_separado' | 'fase_posterior';
export type AmbientePraia = 'oceano_aberto' | 'enseada' | 'baia' | 'foz' | 'lagoa' | 'orla_urbana';
export type ExposicaoSwellEstatica = 'baixa' | 'media' | 'alta' | 'variavel';
export type AcessoPraia = 'carro' | 'caminhada_curta' | 'trilha' | 'barco' | 'travessia_rio' | 'acesso_a_validar';
export type InfraestruturaPraia = 'alta' | 'media' | 'baixa' | 'nenhuma' | 'a_validar';
export type IndicacaoEstatica = 'relaxar' | 'banho' | 'surf' | 'familia' | 'contemplacao' | 'gastronomia' | 'trilha';

export interface AlertaEstruturalPraia {
    codigo: string;
    mensagem: string;
}

export interface IPraia {
    id: string;
    slug: string;
    nome: string;
    nomesAlternativos: string[];
    municipio: string;
    regiao: string;
    segmentoDe: string | null;
    previsaoDe: string | null;
    latitude: number | null;
    longitude: number | null;
    precisaoCoordenada: PrecisaoCoordenada;
    ambiente: AmbientePraia;
    direcaoCostaInicioGraus: number | null;
    direcaoCostaFimGraus: number | null;
    exposicaoSwellEstatica: ExposicaoSwellEstatica;
    acesso: AcessoPraia[];
    infraestrutura: InfraestruturaPraia;
    indicacaoEstatica: IndicacaoEstatica[];
    alertasEstruturais: AlertaEstruturalPraia[];
    perfilEstatico: string;
    prioridade: PrioridadePraia;
    elegivelRecomendacao: boolean;
    ativo: boolean;
    requerBalneabilidadeRecente: boolean;
    visivelCatalogo: boolean;
    fonteLocalizacao: string;
    revisadoEm: string | null;
    revisadoPor: string | null;
}
