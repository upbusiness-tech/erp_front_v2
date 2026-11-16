import {
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  Settings,
  Store,
  UserCog,
  Users,
  Wallet,
  CircleDollarSign,
  ChartNoAxesCombined,
} from "lucide-react";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { CompanyPaths } from "@/routes/AuthenticatedRoutes/Company/routes";
import { CustomersPaths } from "@/routes/AuthenticatedRoutes/Customers/routes";
import { EmployeesPaths } from "@/routes/AuthenticatedRoutes/Employees/routes";
import { PlansPaths } from "@/routes/AuthenticatedRoutes/Plans/routes";
import { SalesPaths } from "@/routes/AuthenticatedRoutes/Sales/routes";
import { SettingsPaths } from "@/routes/AuthenticatedRoutes/Settings/routes";
import { StockPaths } from "@/routes/AuthenticatedRoutes/Stock/routes";
import { SideBarPermissions } from "@/uperp/common/permissions/const/keys/sidebar.permission";
import { FinancePaths } from "@/routes/AuthenticatedRoutes/Finance/routes";

export type PageKey =
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

export type SubPageKey = "estatistica-estoque" | "estatistica-financas";

export type MenuKey = PageKey | SubPageKey;

export interface SubMenuItem {
  parentKey: PageKey;
  key: SubPageKey;
  label: string;
  icon: React.ReactNode;
}

export interface MenuItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  children?: SubMenuItem[];
}

export const menu: MenuItem[] = [
  { key: "balcao", label: "Venda Balcão", icon: <Store size={16} /> },
  { key: "servico", label: "Venda Serviço", icon: <Briefcase size={16} /> },
  { key: "caixa", label: "Caixa", icon: <Wallet size={16} /> },
  {
    key: "estoque",
    label: "Estoque",
    icon: <Boxes size={16} />,
    children: [
      {
        parentKey: "estoque",
        key: "estatistica-estoque",
        label: "Estatísticas",
        icon: <ChartNoAxesCombined size={16} />,
      },
    ],
  },
  {
    key: "financas",
    label: "Finanças",
    icon: <CircleDollarSign size={16} />,
    children: [
      {
        parentKey: "financas",
        key: "estatistica-financas",
        label: "Estatísticas",
        icon: <ChartNoAxesCombined size={16} />,
      },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: <Users size={16} />,
  },
  { key: "funcionarios", label: "Funcionários", icon: <UserCog size={16} /> },
  { key: "empresa", label: "Empresa", icon: <Building2 size={16} /> },
  { key: "planos", label: "Mensalidades", icon: <CreditCard size={16} /> },
  { key: "configuracoes", label: "Configurações", icon: <Settings size={16} /> },
];

export const titles: Record<MenuKey, string> = {
  balcao: "Venda Balcão",
  servico: "Venda Serviço",
  caixa: "Caixa",
  estoque: "Estoque",
  financas: "Finanças",
  clientes: "Clientes",
  funcionarios: "Funcionários",
  empresa: "Empresa",
  planos: "Mensalidades",
  configuracoes: "Configurações",
  "estatistica-estoque": "Estatísticas de Estoque",
  "estatistica-financas": "Estatísticas de Vendas",
};

export const pageKeyToPath: Record<PageKey, string> = {
  balcao: SalesPaths.COMMON_SALE,
  servico: SalesPaths.SERVICE_SALE,
  caixa: CashierPaths.BASE,
  estoque: StockPaths.BASE,
  financas: FinancePaths.BASE,
  clientes: CustomersPaths.BASE,
  funcionarios: EmployeesPaths.LIST,
  empresa: CompanyPaths.BASE,
  planos: PlansPaths.PAGE,
  configuracoes: SettingsPaths.PAGE,
};

export const subPageKeyToPath: Record<SubPageKey, string> = {
  "estatistica-estoque": StockPaths.STATISTICS,
  "estatistica-financas": FinancePaths.STATISTICS,
};

export function getMenuPath(key: MenuKey): string {
  if (key in pageKeyToPath) {
    return pageKeyToPath[key as PageKey];
  }
  return subPageKeyToPath[key as SubPageKey];
}

/**
 * Resolves the most specific menu item for a pathname.
 * Prefers an exact match, then the longest matching prefix.
 */
export function resolveActiveMenuKey(pathname: string): MenuKey {
  const entries: { key: MenuKey; path: string }[] = [
    ...Object.entries(pageKeyToPath).map(([key, path]) => ({ key: key as PageKey, path })),
    ...Object.entries(subPageKeyToPath).map(([key, path]) => ({ key: key as SubPageKey, path })),
  ];

  const exact = entries.find((entry) => entry.path === pathname);
  if (exact) {
    return exact.key;
  }

  const matches = entries
    .filter((entry) => entry.path !== "/" && pathname.startsWith(`${entry.path}/`))
    .sort((a, b) => b.path.length - a.path.length);

  return matches[0]?.key ?? "balcao";
}

/**
 * Returns the parent PageKey when the given key is a child, otherwise undefined.
 */
export function getParentKey(key: MenuKey): PageKey | undefined {
  const item = menu.find((m) => m.key === key || m.children?.some((child) => child.key === key));

  if (!item) {
    return undefined;
  }

  return item.key === key ? undefined : item.key;
}

export const pageKeyRequiresPermission: Record<PageKey, string> = {
  balcao: SideBarPermissions.AccessCommonSaleSection.name,
  servico: SideBarPermissions.AccessServiceSaleSection.name,
  caixa: SideBarPermissions.AccessCashSection.name,
  estoque: SideBarPermissions.AccessStockSection.name,
  financas: SideBarPermissions.AccessFinanceSection.name,
  clientes: SideBarPermissions.AccessInternClientsSection.name,
  funcionarios: SideBarPermissions.AccessEmployeeSection.name,
  empresa: SideBarPermissions.AccessCompanySection.name,
  planos: SideBarPermissions.AccessSubscriptionsSection.name,
  configuracoes: SideBarPermissions.AccessSettingsSection.name,
};
