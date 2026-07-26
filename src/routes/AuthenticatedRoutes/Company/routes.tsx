import { BasicRoute } from "@/routes/-types";
import { CompanyView } from "@/uperp/pages/AuthenticatedPages/Company/CompanyView/CompanyView";

export enum CompanyPaths {
  BASE = "/empresa",
}

export const companyBaseRoutes: BasicRoute[] = [
  {
    path: CompanyPaths.BASE,
    element: <CompanyView />,
  },
];
