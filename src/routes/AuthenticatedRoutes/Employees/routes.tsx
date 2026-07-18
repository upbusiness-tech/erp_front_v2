import { BasicRoute } from "@/routes/-types";
import { Funcionarios } from "@/uperp/pages/Funcionarios";

export enum EmployeesPaths {
  LIST = "/funcionarios",
}

export const employeesBaseRoutes: BasicRoute[] = [
  {
    path: EmployeesPaths.LIST,
    element: <Funcionarios />,
  },
];
