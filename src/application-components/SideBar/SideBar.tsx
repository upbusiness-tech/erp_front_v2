import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { ChevronDown, LogOut, Menu as MenuIcon, Settings } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { BrandHeader } from "./BrandHeader";
import { titles, PageKey } from "./SideBar.consts";
import { useSideBarController } from "./useSideBar.controller";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export function SideBar() {
  const {
    collapsed,
    setCollapsed,
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
  } = useSideBarController();

  const navigate = useNavigate();

  const renderMenu = () => (
    <Menu
      theme={dark ? "dark" : "light"}
      mode="inline"
      selectedKeys={[currentPage]}
      onClick={(e) => handleMenuClick(e.key as PageKey)}
      items={menuItems}
      style={{ borderRight: 0, paddingTop: 8 }}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme={dark ? "dark" : "light"}
          width={240}
        >
          <BrandHeader dark={dark} collapsed={collapsed} />
          {renderMenu()}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{
            body: { padding: 0, background: dark ? "#111" : "#fff" },
            header: { display: "none" },
          }}
        >
          <BrandHeader dark={dark} />
          {renderMenu()}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: isMobile ? "0 12px" : "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            gap: 8,
          }}
        >
          <Space size={8} style={{ minWidth: 0, flex: 1 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuIcon size={20} />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {titles[currentPage]}
            </Title>
          </Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "settings",
                  label: "Configurações",
                  icon: <Settings size={14} />,
                  onClick: () => navigate("/configuracoes"),
                },
                {
                  key: "logout",
                  label: "Sair",
                  icon: <LogOut size={14} />,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Space style={{ cursor: "pointer" }} size={6}>
              <Avatar size={isMobile ? "small" : "default"} style={{ background: "#F26B1F" }}>
                {userName.charAt(0)}
              </Avatar>
              {!isMobile && (
                <div style={{ lineHeight: 1.2 }}>
                  <Text strong style={{ display: "block" }}>
                    {userName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Funcionário
                  </Text>
                </div>
              )}
              <ChevronDown size={14} />
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: isMobile ? 12 : 24,
            background: token.colorBgLayout,
            minWidth: 0,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
