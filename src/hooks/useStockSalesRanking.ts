import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import {
  mapStockSalesRanking,
  statisticStockHistoryService,
  type StatisticStockHistoryResponse,
} from "@/services/statisticsApi.service";
import { EOrder, type QueryStatisticPeriodDto } from "@/types/statistics";

export function useStockSalesRanking(query: QueryStatisticPeriodDto) {
  const result = useGetAllWithParams<StatisticStockHistoryResponse>(
    statisticStockHistoryService,
    undefined,
    {
      queryParams: {
        from: query.from,
        to: query.to,
        limit: String(query.limit ?? 5),
      },
    },
  );

  return {
    data: result.data ? mapStockSalesRanking(result.data, query.order ?? EOrder.DESC) : undefined,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
  };
}
