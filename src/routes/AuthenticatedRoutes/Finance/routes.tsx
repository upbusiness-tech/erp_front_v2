import { lazy } from "react";
import { BasicRoute } from "@/routes/-types";
import { SideBarPermissions } from "@/uperp/common/permissions/const/keys/sidebar.permission";
import { FinanceTab } from "@/uperp/pages/AuthenticatedPages/Finance/FinanceBase/components/FinanceTab/FinanceTab";

export enum FinancePaths {
  BASE = "/financas",
  STATISTICS = `${FinancePaths.BASE}/estatisticas`,
}

const SalesStatistics = lazy(
  () => import("@/uperp/pages/AuthenticatedPages/Finance/SalesStatistics/SalesStatistics"),
);

export const financeBaseRoutes: BasicRoute[] = [
  {
    path: FinancePaths.BASE,
    element: <FinanceTab />,
  },
  {
    path: FinancePaths.STATISTICS,
    element: <SalesStatistics />,
    requiredPermission: SideBarPermissions.AccessFinanceSection.name,
  },
];
