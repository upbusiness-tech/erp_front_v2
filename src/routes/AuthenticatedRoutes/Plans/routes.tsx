import { BasicRoute } from "@/routes/-types";
import { Planos } from "@/uperp/pages/Planos";

export enum PlansPaths {
  PAGE = "/planos",
}

export const plansBaseRoutes: BasicRoute[] = [
  {
    path: PlansPaths.PAGE,
    element: <Planos />,
  },
];
