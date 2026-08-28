import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CategoryStats } from "@/model/productCategory.model";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import dayjs from "dayjs";

export function useStockCategoryStatsController() {
  // const [period, setPeriod] = useState<DashboardPeriod>({
  //   preset: "this_month",
  //   from: dayjs().startOf("month").format("YYYY-MM-DD"),
  //   to: dayjs().format("YYYY-MM-DD"),
  // });

  // const [isLoading, setIsLoading] = useState(false);

  // // TODO: substituir por chamada a API real
  // const [stats, setStats] = useState<CategoryStatsResponse>(MOCK_CATEGORY_STATS);

  // const handlePeriodChange = useCallback((next: DashboardPeriod) => {
  //   setPeriod(next);
  //   setIsLoading(true);
  //   // Simula delay de API
  //   setTimeout(() => {
  //     setStats((prev) => ({
  //       ...prev,
  //       period: { from: next.from, to: next.to },
  //     }));
  //     setIsLoading(false);
  //   }, 300);
  // }, []);

  // const categories: CategoryStatsItem[] = stats.categories;

  // const topCategory = categories.length
  //   ? categories.reduce((max, c) => (c.totalSold > max.totalSold ? c : max), categories[0])
  //   : null;

  // const totalSold = categories.reduce((sum, c) => sum + c.totalSold, 0);
  // const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

  const { period, setPreset, setCustomRange } = useDashboardPeriod("this_month");

  const handlePeriodChange = (next: typeof period) => {
    if (next.preset === "custom") {
      setPreset("custom");
      setCustomRange(dayjs(next.from), dayjs(next.to));
    } else {
      setPreset(next.preset);
    }
  };

  const categoriesTransactionDashboardService = new StatsDashboardService(
    `product-dashboard/top-selling-categories`,
  );

  const {
    data: categoriesStats,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllWithParams<CategoryStats[]>(categoriesTransactionDashboardService, undefined, {
    queryParams: {
      from: period.from,
      to: period.to,
    },
  });

  return {
    period,
    categoriesStats,
    isLoading,
    handlePeriodChange,
  };
}
