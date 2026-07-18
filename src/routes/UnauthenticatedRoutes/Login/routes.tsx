import { BasicRoute } from "@/routes/-types";
import { CompanyLogin } from "@/uperp/pages/UnauthenticatedPages/CompanyLogin/CompanyLogin";
import { CompanyAuthGuard, EmployeeLoginGuard } from "@/routes/AuthGuard";
import { EmployeeLogin } from "@/uperp/pages/AuthenticatedPages/EmployeeLogin/EmployeeLogin";

export enum LoginPaths {
  COMPANY_LOGIN = "",
  EMPLOYEE_LOGIN = "/entrar/funcionario",
}

export const loginBaseRoutes: BasicRoute[] = [
  {
    path: LoginPaths.COMPANY_LOGIN,
    element: (
      <CompanyAuthGuard>
        <CompanyLogin />
      </CompanyAuthGuard>
    ),
  },
  {
    path: LoginPaths.EMPLOYEE_LOGIN,
    element: (
      <EmployeeLoginGuard>
        <EmployeeLogin />
      </EmployeeLoginGuard>
    ),
  },
];
