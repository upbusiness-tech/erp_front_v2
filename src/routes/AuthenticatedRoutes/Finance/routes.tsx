import { BasicRoute } from "@/routes/-types";
import { FinanceTab } from "@/uperp/pages/AuthenticatedPages/Finance/FinanceBase/components/FinanceTab/FinanceTab";

export enum FinancePaths {
  BASE = "/financas",
}

export const financeBaseRoutes: BasicRoute[] = [
  {
    path: FinancePaths.BASE,
    element: <FinanceTab />,
  },
];
