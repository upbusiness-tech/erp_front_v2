import type { GetAllOptions } from "@/types/crud.types";

/**
 * Converte o objeto GetAllOptions para query string no formato NestCRUD.
 *
 * Exemplo de saída:
 *   ?filter[0]=name||eq||sofia&sort[0]=name,ASC&join[0]=profile||name,email&limit=10&page=1
 *
 * Especificação: https://github.com/nestjsx/crud/wiki/Requests#query-string-format
 */

function normalizeFilters(opts: GetAllOptions) {
  const raw = opts.filter;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function normalizeSorts(opts: GetAllOptions) {
  const raw = opts.sort;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function normalizeJoins(opts: GetAllOptions) {
  const raw = opts.join;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function buildNestCrudQuery(opts: GetAllOptions): string {
  const params = new URLSearchParams();

  // filter[0]=name||eq||sofia&filter[1]=age||gt||18
  normalizeFilters(opts).forEach((f, i) => {
    const value = f.value !== undefined ? String(f.value) : "";
    params.append(`filter[${i}]`, `${f.field}||${f.operator}||${value}`);
  });

  // sort[0]=name,ASC&sort[1]=createdAt,DESC
  normalizeSorts(opts).forEach((s, i) => {
    params.append(`sort[${i}]`, `${s.field},${s.order}`);
  });

  // join[0]=profile||name,email
  normalizeJoins(opts).forEach((j, i) => {
    const select = j.select?.length ? `||${j.select.join(",")}` : "";
    params.append(`join[${i}]`, `${j.field}${select}`);
  });

  if (opts.page != null) params.append("page", String(opts.page));
  if (opts.limit != null) params.append("limit", String(opts.limit));
  if (opts.offset != null) params.append("offset", String(opts.offset));

  if (opts.queryParams) {
    Object.entries(opts.queryParams).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
