import type { GetOneOption } from "@/types/crud.types";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export function useGetOneWithParams<TResponse>(
  service: {
    BASE_PATH: string;
    getById: (id: string | number) => Promise<TResponse>;
  },
  options: GetOneOption,
): UseQueryResult<TResponse> {
  const { staleTime, gcTime, enabled, id } = options;

  return useQuery<TResponse>({
    queryKey: [service.BASE_PATH, id],
    queryFn: () => service.getById(id),
    staleTime: staleTime ?? 30_000,
    gcTime: gcTime ?? 10 * 60 * 1000,
    refetchOnMount: true,
    enabled,
  });
}
