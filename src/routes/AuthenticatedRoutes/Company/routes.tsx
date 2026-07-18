import { BasicRoute } from "@/routes/-types";
import { Empresa } from "@/uperp/pages/Empresa";

export enum CompanyPaths {
  DETAIL = "/empresa",
}

export const companyBaseRoutes: BasicRoute[] = [
  {
    path: CompanyPaths.DETAIL,
    element: <Empresa />,
  },
];
