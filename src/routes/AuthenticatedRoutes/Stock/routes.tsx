import { BasicRoute } from "@/routes/-types";
import { Estoque } from "@/uperp/pages/Estoque";

export enum StockPaths {
  LIST = "/estoque",
}

export const stockBaseRoutes: BasicRoute[] = [
  {
    path: StockPaths.LIST,
    element: <Estoque />,
  },
];
