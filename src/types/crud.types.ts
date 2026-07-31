// ---------------------------------------------------------------------------
// Tipos NestCRUD para construção de queries padronizadas
// Docs de referência: https://github.com/nestjsx/crud/wiki/Requests
// ---------------------------------------------------------------------------

/** Operadores de filtro suportados pelo NestCRUD */
export type CrudOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "between"
  | "contains"
  | "startswith"
  | "endswith"
  | "isnull"
  | "isnotnull";

/** Direção de ordenação */
export type CrudSortOrder = "ASC" | "DESC";

/** Filtro: campo + operador + valor */
export interface CrudFilter {
  field: string;
  operator: CrudOperator;
  value?: string | number | boolean | string[];
}

/** Ordenação: campo + direção */
export interface CrudSort {
  field: string;
  order: CrudSortOrder;
}

/** Join com relações */
export interface CrudJoin {
  field: string;
  select?: string[];
}
export interface GetOneOption {
  id: number | string;
  queryParams?: Record<string, string>;
  /** Tempo em ms até o cache ser considerado obsoleto (default: 30s) */
  staleTime?: number;
  /** Tempo em ms até o cache ser removido (default: 5min) */
  gcTime?: number;
  /** Quando false, impede a requisição (útil para filtros ainda não preenchidos) */
  enabled?: boolean;
}

/**
 * Resposta padronizada do NestCRUD com paginação.
 *
 * A API retorna esse formato quando a query inclui page e limit.
 * O campo data carrega os itens da página atual, e os metadados
 * (count, total, pageCount) permitem montar os controles de paginação.
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}
