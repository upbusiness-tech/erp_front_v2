import { Bootstrap } from "@/application-components/Bootstrap/Bootstrap";
import { PermissionGuard } from "@/application-components/PermissionGuard/PermissionGuard";
import { SideBar } from "@/application-components/SideBar/SideBar";
import { AccessDenied } from "@/uperp/pages/AccessDenied/AccessDenied";
import { Route, Routes } from "react-router-dom";
import { cashierBaseRoutes } from "./Cashier/routes";
import { companyBaseRoutes } from "./Company/routes";
import { customersBaseRoutes } from "./Customers/routes";
import { employeesBaseRoutes } from "./Employees/routes";
import { financeBaseRoutes } from "./Finance/routes";
import { maintenanceBaseRoutes } from "./Maintenance/routes";
import { plansBaseRoutes } from "./Plans/routes";
import { salesBaseRoutes } from "./Sales/routes";
import { settingsBaseRoutes } from "./Settings/routes";
import { stockBaseRoutes } from "./Stock/routes";

const allRoutes = [
  ...salesBaseRoutes,
  ...customersBaseRoutes,
  ...stockBaseRoutes,
  ...companyBaseRoutes,
  ...cashierBaseRoutes,
  ...employeesBaseRoutes,
  ...settingsBaseRoutes,
  ...plansBaseRoutes,
  ...maintenanceBaseRoutes,
  ...financeBaseRoutes,
];

export const AuthenticatedRoutes = () => {
  return (
    <>
      <Bootstrap />
      <Routes>
        <Route element={<SideBar />}>
          <Route path="/acesso-bloqueado" element={<AccessDenied />} />
          {allRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiredPermission ? (
                  <PermissionGuard permission={route.requiredPermission}>
                    {route.element}
                  </PermissionGuard>
                ) : (
                  route.element
                )
              }
            />
          ))}
        </Route>
      </Routes>
    </>
  );
};
