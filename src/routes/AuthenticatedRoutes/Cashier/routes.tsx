import { BasicRoute } from "@/routes/-types";
import { CashFlowOpen } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowOpen/CashFlowOpen";
import { CashFlowView } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CashFlowView";
import { Caixa } from "@/uperp/pages/Caixa";

export enum CashierPaths {
  BASE = "/caixa",
  OPEN = `${CashierPaths.BASE}/abrir`,
}

export const cashierBaseRoutes: BasicRoute[] = [
  {
    path: CashierPaths.BASE,
    element: <CashFlowView />,
  },
  {
    path: CashierPaths.OPEN,
    element: <CashFlowOpen />,
  },
];
