import type { GetAllOptions, PaginatedResponse } from "@/types/crud.types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

/**
 * Hook que envolve o TanStack Query para buscar listagens com filtros NestCRUD.
 *
 * TResponse é o tipo completo que o service.getAll retorna.
 * - Se for uma listagem paginada: TResponse = PaginatedResponse<MeuModelo>
 * - Se for uma listagem simples:  TResponse = MeuModelo[]
 * - Se for um único objeto:       TResponse = MeuModelo
 *
 * O hook não impõe nenhuma estrutura — você passa o tipo exato do retorno.
 *
 * Cada combinação de filtros + página vira uma entrada separada no cache.
 * Trocar de página não faz novo request se a página já foi visitada antes.
 *
 * Cache:
 *   invalidateQueries({ queryKey: [service.BASE_PATH] }) limpa TODOS os filtros
 *   e TODAS as páginas de uma vez.
 *
 * Uso com paginação:
 *   type Response = PaginatedResponse<EmployeeModel>;
 *   const { data } = useGetAllWithParams<Response>(employeeService, { page: 1, limit: 20 });
 *   // data → Response | undefined → data?.data (items), data?.total, data?.pageCount
 *
 * Uso sem paginação:
 *   const { data } = useGetAllWithParams<EmployeeModel[]>(employeeService);
 *   // data → EmployeeModel[] | undefined
 */
export function useGetAllWithParams<TResponse>(
  service: {
    BASE_PATH: string;
    getAll: (options: GetAllOptions) => Promise<TResponse>;
  },
  options: GetAllOptions = {},
): UseQueryResult<TResponse> {
  const { staleTime, gcTime, enabled, ...crudOptions } = options;

  return useQuery<TResponse>({
    queryKey: [service.BASE_PATH, crudOptions],
    queryFn: () => service.getAll(crudOptions),
    staleTime: staleTime ?? 30_000,
    gcTime: gcTime ?? 10 * 60 * 1000,
    refetchOnMount: true,
    enabled,
  });
}
