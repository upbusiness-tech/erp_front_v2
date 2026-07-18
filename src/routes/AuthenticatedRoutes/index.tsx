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
    <Routes>
      <Route element={<SideBar />}>
        {allRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
};
