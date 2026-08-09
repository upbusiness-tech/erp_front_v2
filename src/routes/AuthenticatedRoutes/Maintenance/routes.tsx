import { BasicRoute } from "@/routes/-types";
import { Maintenance } from "@/uperp/pages/Maintenance/Maintenance";

export enum MaintenancePaths {
  PAGE = "/manutencao",
}

export const maintenanceBaseRoutes: BasicRoute[] = [
  {
    path: MaintenancePaths.PAGE,
    element: <Maintenance />,
  },
];
