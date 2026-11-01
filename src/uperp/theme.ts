import type { ThemeConfig } from "antd";
import { BRAND, DANGER, SUCCESS, WARNING } from "@/theme/colors";

export const uperpTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND,
    colorInfo: BRAND,
    colorSuccess: SUCCESS,
    colorWarning: WARNING,
    colorError: DANGER,
    colorBgLayout: "#F5F5F5",
    colorText: "#111111",
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: "#111111",
      siderBg: "#111111",
      bodyBg: "#F5F5F5",
      triggerBg: "#1F1F1F",
    },
    Menu: {
      darkItemBg: "#111111",
      darkItemSelectedBg: BRAND,
      darkItemHoverBg: "#1F1F1F",
      darkSubMenuItemBg: "#0A0A0A",
    },
    Button: {
      fontWeight: 500,
    },
  },
};
