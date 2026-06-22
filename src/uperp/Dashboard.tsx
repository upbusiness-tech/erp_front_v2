import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Space, theme as antdTheme } from "antd";
import {
  Store,
  Briefcase,
  Boxes,
  BarChart3,
  Users,
  UserCog,
  Building2,
  CreditCard,
  LogOut,
  ChevronDown,
  Wallet,
  Settings,
} from "lucide-react";
import { VendaBalcao } from "./pages/VendaBalcao";
import { VendaServico } from "./pages/VendaServico";
import { Estoque } from "./pages/Estoque";
import { Financas } from "./pages/Financas";
import { Clientes } from "./pages/Clientes";
import { Funcionarios } from "./pages/Funcionarios";
import { Empresa } from "./pages/Empresa";
import { Planos } from "./pages/Planos";
import { Caixa } from "./pages/Caixa";
import { Configuracoes } from "./pages/Configuracoes";
import { useStore } from "./store";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type PageKey =
  | "balcao"
  | "caixa"
  | "servico"
  | "estoque"
  | "financas"
  | "clientes"
  | "funcionarios"
  | "empresa"
  | "planos"
  | "configuracoes";

const menu: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: "balcao", label: "Venda Balcão", icon: <Store size={16} /> },
  { key: "caixa", label: "Caixa", icon: <Wallet size={16} /> },
  { key: "servico", label: "Venda Serviço", icon: <Briefcase size={16} /> },
  { key: "estoque", label: "Estoque", icon: <Boxes size={16} /> },
  { key: "financas", label: "Finanças & Relatórios", icon: <BarChart3 size={16} /> },
  { key: "clientes", label: "Clientes", icon: <Users size={16} /> },
  { key: "funcionarios", label: "Funcionários", icon: <UserCog size={16} /> },
  { key: "empresa", label: "Empresa", icon: <Building2 size={16} /> },
  { key: "planos", label: "Planos & Mensalidades", icon: <CreditCard size={16} /> },
  { key: "configuracoes", label: "Configurações", icon: <Settings size={16} /> },
];

const titles: Record<PageKey, string> = {
  balcao: "Venda Balcão",
  caixa: "Caixa",
  servico: "Venda Serviço",
  estoque: "Estoque",
  financas: "Finanças & Relatórios",
  clientes: "Clientes",
  funcionarios: "Funcionários",
  empresa: "Empresa",
  planos: "Planos & Mensalidades",
  configuracoes: "Configurações",
};

interface Props {
  userName: string;
  onLogout: () => void;
}

export function Dashboard({ userName, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState<PageKey>("balcao");
  const { token } = antdTheme.useToken();
  const { settings } = useStore();

  const renderPage = () => {
    switch (page) {
      case "balcao": return <VendaBalcao onGoToCaixa={() => setPage("caixa")} />;
      case "caixa": return <Caixa operatorName={userName} onBack={() => setPage("balcao")} />;
      case "servico": return <VendaServico />;
      case "estoque": return <Estoque />;
      case "financas": return <Financas />;
      case "clientes": return <Clientes />;
      case "funcionarios": return <Funcionarios />;
      case "empresa": return <Empresa />;
      case "planos": return <Planos />;
      case "configuracoes": return <Configuracoes />;
    }
  };

  const dark = settings.darkSidebar;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={dark ? "dark" : "light"}
        width={240}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 20px",
            gap: 10,
            borderBottom: dark ? "1px solid #1f1f1f" : "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#F26B1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Store color="#fff" size={20} />
          </div>
          {!collapsed && (
            <Title level={4} style={{ color: dark ? "#fff" : "#1f1f1f", margin: 0 }}>
              UpERP
            </Title>
          )}
        </div>
        <Menu
          theme={dark ? "dark" : "light"}
          mode="inline"
          selectedKeys={[page]}
          onClick={(e) => setPage(e.key as PageKey)}
          items={menu.map((m) => ({ key: m.key, label: m.label, icon: m.icon }))}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {titles[page]}
          </Title>
          <Dropdown
            menu={{
              items: [
                {
                  key: "settings",
                  label: "Configurações",
                  icon: <Settings size={14} />,
                  onClick: () => setPage("configuracoes"),
                },
                {
                  key: "logout",
                  label: "Sair",
                  icon: <LogOut size={14} />,
                  onClick: onLogout,
                },
              ],
            }}
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar style={{ background: "#F26B1F" }}>{userName.charAt(0)}</Avatar>
              <div style={{ lineHeight: 1.2 }}>
                <Text strong style={{ display: "block" }}>{userName}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>Funcionário</Text>
              </div>
              <ChevronDown size={14} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: token.colorBgLayout }}>
          {renderPage()}
        </Content>
      </Layout>
    </Layout>
  );
}
