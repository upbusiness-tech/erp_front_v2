import { BasicRoute } from "@/routes/-types";
import { Caixa } from "@/uperp/pages/Caixa";

export enum CashierPaths {
  OPERATION = "/caixa",
}

export const cashierBaseRoutes: BasicRoute[] = [
  {
    path: CashierPaths.OPERATION,
    element: <Caixa />,
  },
];
