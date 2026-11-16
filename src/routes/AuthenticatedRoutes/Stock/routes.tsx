import { lazy } from "react";
import { BasicRoute } from "@/routes/-types";
import { SideBarPermissions } from "@/uperp/common/permissions/const/keys/sidebar.permission";
import { StockProductForm } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/StockProduct";
import { StockView } from "@/uperp/pages/AuthenticatedPages/Stock/StockView/StockView";

export enum StockPaths {
  BASE = "/estoque",
  CREATE_PRODUCT = `${StockPaths.BASE}/criar-produto`,
  UPDATE_PRODUCT = `${StockPaths.BASE}/atualizar-produto/:id`,
  STATISTICS = `${StockPaths.BASE}/estatisticas`,
}

const StockStatistics = lazy(
  () => import("@/uperp/pages/AuthenticatedPages/Stock/StockStatistics/StockStatistics"),
);

export const stockBaseRoutes: BasicRoute[] = [
  {
    path: StockPaths.BASE,
    element: <StockView />,
  },
  {
    path: StockPaths.CREATE_PRODUCT,
    element: <StockProductForm />,
  },
  {
    path: StockPaths.UPDATE_PRODUCT,
    element: <StockProductForm isEdit />,
  },
  {
    path: StockPaths.STATISTICS,
    element: <StockStatistics />,
    requiredPermission: SideBarPermissions.AccessStockSection.name,
  },
];
