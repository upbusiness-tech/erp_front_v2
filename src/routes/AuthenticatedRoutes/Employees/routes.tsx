import { BasicRoute } from "@/routes/-types";
import { EmployeeForm } from "@/uperp/pages/AuthenticatedPages/Employees/EmployeeForm/EmployeeForm";
import { EmployeesView } from "@/uperp/pages/AuthenticatedPages/Employees/EmployeesView/EmployeesView";

const employeeBasePath = "/funcionarios";

export enum EmployeesPaths {
  LIST = employeeBasePath,
  EDIT = `${employeeBasePath}/editar/:uid`,
  CREATE = `${employeeBasePath}/criar`,
}

export const employeesBaseRoutes: BasicRoute[] = [
  {
    path: EmployeesPaths.LIST,
    element: <EmployeesView />,
  },
  {
    path: EmployeesPaths.EDIT,
    element: <EmployeeForm isEdit={true} />,
  },
  {
    path: EmployeesPaths.CREATE,
    element: <EmployeeForm />,
  },
];
