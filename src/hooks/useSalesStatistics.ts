import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import {
  mapSalesStatistics,
  statisticSaleHistoryService,
  type StatisticSaleHistoryResponse,
} from "@/services/statisticsApi.service";
import type { DateRangeString } from "@/types/dashboard";

export function useSalesStatistics(query: DateRangeString) {
  const result = useGetAllWithParams<StatisticSaleHistoryResponse>(
    statisticSaleHistoryService,
    undefined,
    { queryParams: { from: query.from, to: query.to } },
  );

  return {
    data: result.data ? mapSalesStatistics(result.data) : undefined,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
  };
}
