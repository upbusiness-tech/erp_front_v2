import { BasicRoute } from "@/routes/-types";
import { SubscriptionView } from "@/uperp/pages/AuthenticatedPages/Subscriptions/SubscriptionView/SubscriptionView";

export enum PlansPaths {
  PAGE = "/planos",
}

export const plansBaseRoutes: BasicRoute[] = [
  {
    path: PlansPaths.PAGE,
    element: <SubscriptionView />,
  },
];
