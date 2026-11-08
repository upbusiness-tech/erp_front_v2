import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import type { ProductStockOverviewModel } from "@/model/productStockOverview.model";
import { ProductService } from "@/services/product.service";
import type { PaginatedResponse } from "@/types/crud.types";
import { message } from "antd";
import { useEffect } from "react";

const productStockOverviewService = new ProductService("stock-overview");

export function useStockOverviewController() {
  const { data, isLoading, isError, error } = useGetAllWithParams<
    PaginatedResponse<ProductStockOverviewModel>
  >(productStockOverviewService);

  useEffect(() => {
    if (isError && error) {
      message.error("Não foi possível carregar o resumo do estoque.");
    }
  }, [isError, error]);

  return {
    overview: data?.data?.[0],
    isLoading,
  };
}
