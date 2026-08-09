import { BasicRoute } from "@/routes/-types";
import { Settings } from "@/uperp/pages/Settings/Settings";

export enum SettingsPaths {
  PAGE = "/configuracoes",
}

export const settingsBaseRoutes: BasicRoute[] = [
  {
    path: SettingsPaths.PAGE,
    element: <Settings />,
  },
];
