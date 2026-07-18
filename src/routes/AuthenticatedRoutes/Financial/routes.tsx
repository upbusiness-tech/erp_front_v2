import { BasicRoute } from "@/routes/-types";
import { Financas } from "@/uperp/pages/Financas";

export enum FinancialPaths {
  DASHBOARD = "/financas",
}

export const financialBaseRoutes: BasicRoute[] = [
  {
    path: FinancialPaths.DASHBOARD,
    element: <Financas />,
  },
];
