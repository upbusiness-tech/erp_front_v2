import { BasicRoute } from "@/routes/-types";
import { CompanyLogin } from "@/uperp/auth/CompanyLogin/CompanyLogin";
import { EmployeeLogin } from "@/uperp/auth/EmployeeLogin";

export enum LoginPaths {
  COMPANY_LOGIN = "",
  EMPLOYEE_LOGIN = "/entrar/funcionario",
}

export const loginBaseRoutes: BasicRoute[] = [
  {
    path: LoginPaths.COMPANY_LOGIN,
    element: <CompanyLogin />,
  },
  {
    path: LoginPaths.EMPLOYEE_LOGIN,
    element: <EmployeeLogin />,
  },
];
