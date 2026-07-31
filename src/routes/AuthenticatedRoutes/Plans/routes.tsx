import { BasicRoute } from "@/routes/-types";
import { InvoiceView } from "@/uperp/pages/AuthenticatedPages/Invoices/InvoiceView/InvoiceView";

export enum PlansPaths {
  PAGE = "/planos",
}

export const plansBaseRoutes: BasicRoute[] = [
  {
    path: PlansPaths.PAGE,
    element: <InvoiceView />,
  },
];
