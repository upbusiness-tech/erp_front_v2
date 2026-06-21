import type { ThemeConfig } from "antd";

export const uperpTheme: ThemeConfig = {
  token: {
    colorPrimary: "#F26B1F",
    colorInfo: "#F26B1F",
    colorSuccess: "#16A34A",
    colorWarning: "#F59E0B",
    colorError: "#DC2626",
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
      darkItemSelectedBg: "#F26B1F",
      darkItemHoverBg: "#1F1F1F",
      darkSubMenuItemBg: "#0A0A0A",
    },
    Button: {
      fontWeight: 500,
    },
  },
};
