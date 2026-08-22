import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import type { PaginatedResponse } from "@/types/crud.types";
import { CreateQueryParams } from "@dataui/crud-request";
import { useGenericTable } from "./useGenericTable";

export interface UseGenericTableFetchOptions<TItem> {
  /** Instância do service (precisa expor BASE_PATH e getAll) */
  service: {
    BASE_PATH: string;
    getAll: (options?: CreateQueryParams) => Promise<PaginatedResponse<TItem>>;
  };
  /** Opções adicionais como sort, filter, join etc. (page e limit são injetados automaticamente) */
  options?: Omit<CreateQueryParams, "page" | "limit">;
  /** Quantidade inicial de itens por página (default: 8) */
  initialPageSize?: number;
  enabled?: boolean;
}

export interface UseGenericTableFetchReturn<TItem> {
  /** Lista de itens da página atual */
  data: TItem[];
  /** Total de registros (para o paginator saber quantas páginas existem) */
  total?: number;
  /** Quantidade total de páginas */
  pageCount?: number;
  /** Indica se está carregando */
  isLoading: boolean;
  /** Página atual (1-indexed) */
  page: number;
  /** Quantidade de itens por página */
  pageSize: number;
  /** Atualiza a página atual */
  handlePageChange: (page: number) => void;
  /** Altera o pageSize e reseta para a página 1 */
  handlePageSizeChange: (pageSize: number) => void;
  /** Reseta para a página 1 */
  resetPage: () => void;
}

/**
 * Hook que combina `useGenericTable` com `useGetAllWithParams`,
 * eliminando a necessidade de gerenciar estado de paginação e fetching separadamente.
 *
 * @example
 * ```tsx
 * const { data, total, isLoading, page, pageSize, handlePageChange, handlePageSizeChange } =
 *   useGenericTableFetch<EmployeeModel>({
 *     service: employeeService,
 *     options: { sort: { field: "name", order: "ASC" } },
 *   });
 *
 * <GenericTable
 *   data={data}
 *   total={total}
 *   isLoading={isLoading}
 *   page={page}
 *   pageSize={pageSize}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 * ```
 */
export function useGenericTableFetch<TItem>({
  service,
  options: extraOptions = {},
  initialPageSize = 8,
  enabled = true,
}: UseGenericTableFetchOptions<TItem>): UseGenericTableFetchReturn<TItem> {
  const { page, pageSize, handlePageChange, handlePageSizeChange, resetPage } =
    useGenericTable(initialPageSize);

  const { data, isLoading, isFetching } = useGetAllWithParams<PaginatedResponse<TItem>>(
    service,
    {
      ...extraOptions,
      page,
      limit: pageSize,
    },
    { enabled },
  );

  return {
    data: data?.data ?? [],
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading: isLoading || isFetching,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  };
}
