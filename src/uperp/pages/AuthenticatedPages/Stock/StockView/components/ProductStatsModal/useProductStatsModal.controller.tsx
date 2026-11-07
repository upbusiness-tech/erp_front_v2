/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import type { ProductModel } from "@/model/product.model";
import { ProductTransactionType } from "@/model/product.model";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import { extractStockFormatByProduct } from "@/uperp/common/formulas/productFormulas";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { INFO, SUCCESS } from "@/theme/colors";
import type { GeneralStatsByProduct, TransactionOverviewByProduct } from "./types";
import { VariationTags } from "@/application-components/VariationTags/VariationTags";

export function useProductStatsModalController({ product }: { product: ProductModel | null }) {
  const { period, setPreset, setCustomRange } = useDashboardPeriod("this_month");
  const navigate = useNavigate();

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
  ): { label: string; color: string; description: string; variant?: any | null } => {
    if (!product)
      return {
        label: "Movimentação",
        color: "#6B7280",
        description: "",
        variant: null,
      };
    switch (transaction.type) {
      case ProductTransactionType.SUBTRACTION:
        return {
          label: "Venda",
          color: SUCCESS,
          description: `Venda #${transaction.saleCode} de ${extractStockFormatByProduct(product, transaction.value)}`,
          variant: (
            <VariationTags
              specification={{
                brand: transaction.brand,
                color: transaction.color,
                size: transaction.size,
              }}
            />
          ),
        };
      case ProductTransactionType.PLUS:
        return {
          label: "Reposição",
          color: INFO,
          description: `Reposição de ${extractStockFormatByProduct(product, transaction.value)} (${[transaction.brand, transaction.color, transaction.size].join(" - ")})`,
        };
      default:
        return { label: "Movimentação", color: "#6B7280", description: "" };
    }
  };

  const handleGoToEditProduct = (id: number, especificacaoId?: number) => {
    const path = StockPaths.UPDATE_PRODUCT.replace(":id", String(id));
    navigate(especificacaoId ? `${path}?especificacaoId=${especificacaoId}` : path);
  };

  return {
    period,
    handlePeriodChange,
    isLoading: isLoading || isFetching,
    getTransactionLabel,
    stats: data ?? null,
    productTransactionsData,
    handleGoToEditProduct,
  };
}
