import { useAuthStore } from "@/stores/auth.store";
import { useStore } from "@/uperp/store";
import { Grid, theme as antdTheme } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasPermission } from "@/utils/permissions";
import {
  menu,
  pageKeyToPath,
  pageKeyRequiresPermission,
  pathToPageKey,
  PageKey,
} from "./SideBar.consts";
import { LoginPaths } from "@/routes/UnauthenticatedRoutes/Login/routes";

const { useBreakpoint } = Grid;

export function useSideBarController() {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sideBarCollapsed") === "collapsed",
  );
  const handleCollapsed = (v: boolean) => {
    localStorage.setItem("sideBarCollapsed", v ? "collapsed" : "not-collapsed");
    setCollapsed(v);
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token } = antdTheme.useToken();
  const { settings } = useStore();
  const { employeeName, logout, permissions, employeeLogout } = useAuthStore();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = !screens.lg;
  const dark = settings.darkSidebar;

  const currentPage = useMemo(() => {
    const entry = Object.entries(pathToPageKey).find(
      ([path]) => location.pathname === path || location.pathname.startsWith(path + "/"),
    );
    return entry?.[1] ?? "balcao";
  }, [location.pathname]);

  const userName = employeeName || "Usuário";

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleMenuClick = useCallback(
    (key: PageKey) => {
      navigate(pageKeyToPath[key]);
      if (isMobile) setDrawerOpen(false);
    },
    [navigate, isMobile],
  );

  const menuItems = useMemo(
    () =>
      menu
        .filter((m) => hasPermission(permissions, pageKeyRequiresPermission[m.key]))
        .map((m) => ({ key: m.key, label: m.label, icon: m.icon })),
    [permissions],
  );

  const handleChangeEmployee = () => {
    employeeLogout();
    navigate(LoginPaths.EMPLOYEE_LOGIN);
  };

  return {
    collapsed,
    handleCollapsed,
    drawerOpen,
    setDrawerOpen,
    token,
    dark,
    isMobile,
    userName,
    currentPage,
    handleMenuClick,
    handleLogout,
    menuItems,
    handleChangeEmployee,
  };
}
