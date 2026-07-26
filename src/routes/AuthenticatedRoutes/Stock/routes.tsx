import { BasicRoute } from "@/routes/-types";
import { StockProductForm } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/StockProduct";
import { StockView } from "@/uperp/pages/AuthenticatedPages/Stock/StockView/StockView";

export enum StockPaths {
  BASE = "/estoque",
  CREATE_PRODUCT = `${StockPaths.BASE}/criar-produto`,
  UPDATE_PRODUCT = `${StockPaths.BASE}/atualizar-produto/:id`,
}

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
];
