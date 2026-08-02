import { BasicRoute } from "@/routes/-types";
import { CustomerForm } from "@/uperp/pages/AuthenticatedPages/Customer/CustomerForm/CustomerForm";
import { CustomerView } from "@/uperp/pages/AuthenticatedPages/Customer/CustomerView/CustomerView";

export enum CustomersPaths {
  BASE = "/clientes",
  CREATE = `${CustomersPaths.BASE}/criar`,
  UPDATE = `${CustomersPaths.BASE}/editar/:id`,
}

export const customersBaseRoutes: BasicRoute[] = [
  {
    path: CustomersPaths.BASE,
    element: <CustomerView />,
  },
  {
    path: CustomersPaths.CREATE,
    element: <CustomerForm />,
  },
  {
    path: CustomersPaths.UPDATE,
    element: <CustomerForm isEdit />,
  },
];
