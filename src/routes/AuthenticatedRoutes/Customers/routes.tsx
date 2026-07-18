import { BasicRoute } from "@/routes/-types";
import { Clientes } from "@/uperp/pages/Clientes";

export enum CustomersPaths {
  LIST = "/clientes",
}

export const customersBaseRoutes: BasicRoute[] = [
  {
    path: CustomersPaths.LIST,
    element: <Clientes />,
  },
];
