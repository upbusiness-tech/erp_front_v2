import { BasicRoute } from "@/routes/-types";
import { CashFlowOpen } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowOpen/CashFlowOpen";
import { CashFlowView } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CashFlowView";
import { CashFlowHistoryDetail } from "@/uperp/pages/AuthenticatedPages/Finance/CashFlowHistory/CashFlowHistoryDetail/CashFlowHistoryDetail";
import { Caixa } from "@/uperp/pages/Caixa";

export enum CashierPaths {
  BASE = "/caixa",
  OPEN = `${CashierPaths.BASE}/abrir`,
  HISTORY = `${CashierPaths.BASE}/historico`,
  HISTORY_DETAIL = `${CashierPaths.HISTORY}/:cashFlowId`,
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
  {
    path: CashierPaths.HISTORY_DETAIL,
    element: <CashFlowHistoryDetail />,
  },
];
