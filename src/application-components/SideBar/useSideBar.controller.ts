import { useAuthStore } from "@/stores/auth.store";
import { useStore } from "@/uperp/store";
import { Grid, theme as antdTheme, type MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasPermission } from "@/utils/permissions";
import {
  getMenuPath,
  getParentKey,
  menu,
  pageKeyRequiresPermission,
  resolveActiveMenuKey,
  type MenuKey,
  type PageKey,
} from "./SideBar.consts";
import { LoginPaths } from "@/routes/UnauthenticatedRoutes/Login/routes";

const { useBreakpoint } = Grid;

function openInNewTab(path: string) {
  const anchor = document.createElement("a");
  anchor.href = path;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

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

  const activeKey = useMemo<MenuKey>(
    () => resolveActiveMenuKey(location.pathname),
    [location.pathname],
  );
  const activeParentKey = useMemo<PageKey | undefined>(() => getParentKey(activeKey), [activeKey]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!activeParentKey) return;

    setOpenKeys((prev) => (prev.includes(activeParentKey) ? prev : [...prev, activeParentKey]));
  }, [activeParentKey]);

  const handleOpenChange = useCallback((keys: string[]) => setOpenKeys(keys), []);

  const userName = employeeName || "Usuário";

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleMenuClick = useCallback(
    (key: MenuKey) => {
      navigate(getMenuPath(key));
      if (isMobile) setDrawerOpen(false);
    },
    [navigate, isMobile],
  );

  const menuItems = useMemo<MenuProps["items"]>(
    () =>
      menu
        .filter((m) => hasPermission(permissions, pageKeyRequiresPermission[m.key]))
        .map((m) => {
          const children = m.children?.map((c) => ({
            key: c.key,
            label: c.label,
            icon: c.icon,
          }));

          return {
            key: m.key,
            label: m.label,
            icon: m.icon,
            children,
            ...(m.children
              ? {
                  onTitleClick: (info: { domEvent: { ctrlKey: boolean; metaKey: boolean } }) => {
                    if (collapsed) return;

                    if (info.domEvent.ctrlKey || info.domEvent.metaKey) {
                      openInNewTab(getMenuPath(m.key));
                      return;
                    }

                    navigate(getMenuPath(m.key));
                    if (isMobile) setDrawerOpen(false);
                  },
                }
              : {}),
          };
        }),
    [permissions, collapsed, navigate, isMobile],
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
    activeKey,
    openKeys,
    handleOpenChange,
    handleMenuClick,
    handleLogout,
    menuItems,
    handleChangeEmployee,
  };
}
