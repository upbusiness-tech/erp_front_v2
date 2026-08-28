import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import type { ProductModel } from "@/model/product.model";
import { ProductTransactionType } from "@/model/product.model";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import { extractStockFormatByProduct } from "@/uperp/common/formulas/productFormulas";
import dayjs from "dayjs";
import { useEffect } from "react";
import type { GeneralStatsByProduct, TransactionOverviewByProduct } from "./types";

export function useProductStatsModalController({ product }: { product: ProductModel | null }) {
  const { period, setPreset, setCustomRange } = useDashboardPeriod("this_month");

  const productDashboardService = new StatsDashboardService(
    `product-dashboard/${product?.id}/overview-stats`,
  );

  const productTransactionDashboardService = new StatsDashboardService(
    `product-transaction-dashboard/overview-product-transactions`,
  );

  const { data, isLoading, isFetching, isError, error } =
    useGetAllWithParams<GeneralStatsByProduct>(productDashboardService, undefined, {
      queryParams: {
        from: period.from,
        to: period.to,
      },
      enabled: !!product,
    });

  const { data: productTransactionsData, isLoading: isLoadingTransaction } =
    useGenericTableFetch<TransactionOverviewByProduct>({
      service: productTransactionDashboardService,
      options: {
        filter: [
          {
            field: "productId",
            operator: "eq",
            value: product?.id,
          },
        ],
      },
      enabled: !!product,
    });

  useEffect(() => {
    if (isError && error) {
      console.error("Erro ao carregar estatisticas do produto:", error);
    }
  }, [isError, error]);

  const handlePeriodChange = (next: typeof period) => {
    if (next.preset === "custom") {
      setPreset("custom");
      setCustomRange(dayjs(next.from), dayjs(next.to));
    } else {
      setPreset(next.preset);
    }
  };

  const getTransactionLabel = (
    transaction: TransactionOverviewByProduct,
  ): { label: string; color: string; description: string } => {
    if (!product) return { label: "Movimentação", color: "#6B7280", description: "" };
    switch (transaction.type) {
      case ProductTransactionType.SUBTRACTION:
        return {
          label: "Venda",
          color: "#16A34A",
          description: `Venda #${transaction.saleCode} de ${extractStockFormatByProduct(product, transaction.value)}`,
        };
      case ProductTransactionType.PLUS:
        return {
          label: "Reposição",
          color: "#2563EB",
          description: `Reposição de ${extractStockFormatByProduct(product, transaction.value)} (${[transaction.brand, transaction.color, transaction.size].join(" - ")})`,
        };
      default:
        return { label: "Movimentação", color: "#6B7280", description: "" };
    }
  };

  return {
    period,
    handlePeriodChange,
    isLoading: isLoading || isFetching,
    getTransactionLabel,
    stats: data ?? null,
    productTransactionsData,
  };
}
