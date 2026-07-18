import { BasicRoute } from "@/routes/-types";
import { Configuracoes } from "@/uperp/pages/Configuracoes";

export enum SettingsPaths {
  PAGE = "/configuracoes",
}

export const settingsBaseRoutes: BasicRoute[] = [
  {
    path: SettingsPaths.PAGE,
    element: <Configuracoes />,
  },
];
