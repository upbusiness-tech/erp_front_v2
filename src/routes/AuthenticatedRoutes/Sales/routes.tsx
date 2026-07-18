import { BasicRoute } from "@/routes/-types";
import { CommonSale } from "@/uperp/pages/CommonSale/CommonSale";
import { VendaServico } from "@/uperp/pages/VendaServico";

export enum SalesPaths {
  COMMON_SALE = "/venda/balcao",
  SERVICE_SALE = "/venda/servico",
}

export const salesBaseRoutes: BasicRoute[] = [
  {
    path: SalesPaths.COMMON_SALE,
    element: <CommonSale />,
  },
  {
    path: SalesPaths.SERVICE_SALE,
    element: <VendaServico />,
  },
];
