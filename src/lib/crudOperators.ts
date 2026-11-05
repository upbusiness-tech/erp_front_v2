import type { CustomOperators } from "@dataui/crud-request";

/**
 * Operadores customizados registrados no backend em `src/crud.config.ts`.
 *
 * O `RequestQueryBuilder` valida o operador antes de serializar a query,
 * então ele precisa conhecer os mesmos operadores do backend. A lógica SQL
 * de cada operador é aplicada apenas no backend; aqui só declaramos a chave
 * para permitir a montagem da URL.
 */
export const CRUD_CUSTOM_OPERATORS = {
  $contUL: {},
} satisfies CustomOperators;
