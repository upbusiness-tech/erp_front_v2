import { Route, Routes } from "react-router-dom";
import { salesBaseRoutes } from "./Sales/routes";
import { customersBaseRoutes } from "./Customers/routes";
import { stockBaseRoutes } from "./Stock/routes";
import { companyBaseRoutes } from "./Company/routes";
import { financialBaseRoutes } from "./Financial/routes";
import { cashierBaseRoutes } from "./Cashier/routes";
import { employeesBaseRoutes } from "./Employees/routes";
import { settingsBaseRoutes } from "./Settings/routes";
import { plansBaseRoutes } from "./Plans/routes";
import { SideBar } from "@/application-components/SideBar/SideBar";
import { AccessDenied } from "@/uperp/pages/AccessDenied/AccessDenied";
import { PermissionGuard } from "@/application-components/PermissionGuard/PermissionGuard";
import { Bootstrap } from "@/application-components/Bootstrap/Bootstrap";

const allRoutes = [
  ...salesBaseRoutes,
  ...customersBaseRoutes,
  ...stockBaseRoutes,
  ...companyBaseRoutes,
  ...financialBaseRoutes,
  ...cashierBaseRoutes,
  ...employeesBaseRoutes,
  ...settingsBaseRoutes,
  ...plansBaseRoutes,
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
