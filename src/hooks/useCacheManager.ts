import { useQueryClient } from "@tanstack/react-query";
import type { GetAllOptions } from "@/types/crud.types";

/**
 * Interface mínima que um serviço precisa expor para usar o cache manager.
 * Todo serviço que estende BaseService já tem BASE_PATH.
 */
interface CachableService {
  BASE_PATH: string;
}

/**
 * Hook que expõe funções para gerenciar o cache do TanStack Query por serviço.
 *
 * Como a query key do useGetAllWithParams é [service.BASE_PATH, options],
 * as funções aqui usam o BASE_PATH como prefixo para operar em todas
 * as queries relacionadas àquele serviço de uma vez.
 *
 * Uso:
 *   const { invalidateQuery, removeQuery, refetchQuery } = useCacheManager();
 *
 *   // Após criar/editar/deletar um employee:
 *   await invalidateQuery(employeeService);  // recarrega TODAS as listagens de employee
 */
export function useCacheManager() {
  const queryClient = useQueryClient();

  return {
    /**
     * Marca TODAS as queries de um serviço como obsoletas.
     * O TanStack Query re-fetch automático na próxima vez que o componente
     * que usa aquela query for renderizado.
     */
    invalidateQuery: (service: CachableService) =>
      queryClient.invalidateQueries({ queryKey: [service.BASE_PATH] }),

    /**
     * Remove fisicamente as queries do cache.
     * Sem parâmetro extra remove TUDO do serviço.
     * Com options remove apenas a consulta específica.
     */
    removeQuery: (service: CachableService, options?: GetAllOptions) =>
      options
        ? queryClient.removeQueries({ queryKey: [service.BASE_PATH, options] })
        : queryClient.removeQueries({ queryKey: [service.BASE_PATH] }),

    /**
     * Força o refetch imediato de todas as queries do serviço.
     * Útil para atualizações urgentes (ex: após importação em lote).
     */
    refetchQuery: (service: CachableService) =>
      queryClient.refetchQueries({ queryKey: [service.BASE_PATH] }),
  };
}
