import {
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  Settings,
  Store,
  UserCog,
  Users,
  Wallet,
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

export const menu: { key: PageKey; label: string; icon: React.ReactNode }[] = [
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

export const titles: Record<PageKey, string> = {
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

export const pageKeyToPath: Record<PageKey, string> = {
  balcao: SalesPaths.COMMON_SALE,
  caixa: CashierPaths.BASE,
  servico: SalesPaths.SERVICE_SALE,
  estoque: StockPaths.BASE,
  financas: FinancePaths.BASE,
  clientes: CustomersPaths.BASE,
  funcionarios: EmployeesPaths.LIST,
  empresa: CompanyPaths.BASE,
  planos: PlansPaths.PAGE,
  configuracoes: SettingsPaths.PAGE,
};

export const pathToPageKey: Record<string, PageKey> = {
  [SalesPaths.COMMON_SALE]: "balcao",
  [CashierPaths.BASE]: "caixa",
  [SalesPaths.SERVICE_SALE]: "servico",
  [StockPaths.BASE]: "estoque",
  [FinancePaths.BASE]: "financas",
  [CustomersPaths.BASE]: "clientes",
  [EmployeesPaths.LIST]: "funcionarios",
  [CompanyPaths.BASE]: "empresa",
  [PlansPaths.PAGE]: "planos",
  [SettingsPaths.PAGE]: "configuracoes",
};

export const pageKeyRequiresPermission: Record<PageKey, string> = {
  balcao: SideBarPermissions.AccessCommonSaleSection.name,
  caixa: SideBarPermissions.AccessCashSection.name,
  servico: SideBarPermissions.AccessServiceSaleSection.name,
  estoque: SideBarPermissions.AccessStockSection.name,
  financas: SideBarPermissions.AccessFinanceSection.name,
  clientes: SideBarPermissions.AccessInternClientsSection.name,
  funcionarios: SideBarPermissions.AccessEmployeeSection.name,
  empresa: SideBarPermissions.AccessCompanySection.name,
  planos: SideBarPermissions.AccessInvoicesSection.name,
  configuracoes: SideBarPermissions.AccessSettingsSection.name,
};
