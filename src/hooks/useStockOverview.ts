import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import {
  mapStockOverview,
  statisticStockHealthService,
  statisticStockHistoryService,
  type StatisticStockHealthResponse,
  type StatisticStockHistoryResponse,
} from "@/services/statisticsApi.service";
import { EOrder, type QueryStatisticPeriodDto } from "@/types/statistics";

export function useStockOverview(query: QueryStatisticPeriodDto) {
  const limit = query.limit ?? 5;

  const history = useGetAllWithParams<StatisticStockHistoryResponse>(
    statisticStockHistoryService,
    undefined,
    { queryParams: { from: query.from, to: query.to, limit: String(limit) } },
  );

  const health = useGetAllWithParams<StatisticStockHealthResponse>(
    statisticStockHealthService,
    undefined,
    { queryParams: { limit: String(limit), order: query.order ?? EOrder.DESC } },
  );

  return {
    data: history.data && health.data ? mapStockOverview(history.data, health.data) : undefined,
    isLoading: history.isLoading || health.isLoading,
    isFetching: history.isFetching || health.isFetching,
    isError: history.isError || health.isError,
  };
}
