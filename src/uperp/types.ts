export interface ProductVariations {
  sizes?: string[];
  colors?: string[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  unit?: string;
  supplier?: string;
  variantGroupId?: string;
  size?: string;
  color?: string;
  variations?: ProductVariations;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  qty: number;
  customPrice?: number;
  observation?: string;
  size?: string;
  color?: string;
  employeeId?: string;
  kind?: "produto" | "servico";
  description?: string;
}

export interface CustomerSpecialPrice {
  productId: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  loyalty?: boolean;
  specialPrices?: CustomerSpecialPrice[];
}

export type EmployeePermission =
  | "vendas.balcao"
  | "vendas.servico"
  | "caixa.gerenciar"
  | "estoque.gerenciar"
  | "clientes.gerenciar"
  | "funcionarios.gerenciar"
  | "financas.visualizar"
  | "empresa.editar"
  | "planos.gerenciar"
  | "configuracoes.gerenciar";

export interface PermissionDefinition {
  key: EmployeePermission;
  label: string;
  description: string;
  group: "Vendas" | "Cadastros" | "Financeiro" | "Administração";
}

export const PERMISSIONS: PermissionDefinition[] = [
  {
    key: "vendas.balcao",
    label: "Vendas de Balcão",
    description: "Registrar e finalizar vendas de balcão",
    group: "Vendas",
  },
  {
    key: "vendas.servico",
    label: "Vendas de Serviço",
    description: "Abrir e concluir ordens de serviço",
    group: "Vendas",
  },
  {
    key: "caixa.gerenciar",
    label: "Gerenciar Caixa",
    description: "Abrir, fechar caixa e movimentações",
    group: "Vendas",
  },
  {
    key: "estoque.gerenciar",
    label: "Gerenciar Estoque",
    description: "Cadastrar e editar produtos e categorias",
    group: "Cadastros",
  },
  {
    key: "clientes.gerenciar",
    label: "Gerenciar Clientes",
    description: "Cadastrar e editar clientes",
    group: "Cadastros",
  },
  {
    key: "funcionarios.gerenciar",
    label: "Gerenciar Funcionários",
    description: "Cadastrar funcionários e permissões",
    group: "Administração",
  },
  {
    key: "financas.visualizar",
    label: "Ver Finanças e Relatórios",
    description: "Acessar relatórios e histórico de caixas",
    group: "Financeiro",
  },
  {
    key: "empresa.editar",
    label: "Editar Empresa",
    description: "Alterar dados cadastrais da empresa",
    group: "Administração",
  },
  {
    key: "planos.gerenciar",
    label: "Planos e Mensalidades",
    description: "Visualizar e alterar plano contratado",
    group: "Financeiro",
  },
  {
    key: "configuracoes.gerenciar",
    label: "Configurações do Sistema",
    description: "Alterar preferências gerais",
    group: "Administração",
  },
];

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
  permissions: EmployeePermission[];
}

export type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

export interface Payment {
  method: PaymentMethod;
  value: number;
}

export interface SaleLine {
  name: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  size?: string;
  color?: string;
  observation?: string;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: number;
  type: "balcao" | "servico";
  customerId?: string;
  payments?: Payment[];
  lines?: SaleLine[];
  discount?: number;
}

export interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: "paga" | "aberta" | "atrasada";
  dueDate: string;
}

export type CashMovementType = "entrada" | "sangria" | "reposicao" | "venda";

export interface CashMovement {
  id: string;
  type: CashMovementType;
  value: number;
  note?: string;
  at: string;
}

export interface CashSession {
  openedAt: string;
  initialValue: number;
  operatorName: string;
}

export interface ClosedCashSession {
  id: string;
  openedAt: string;
  closedAt: string;
  operatorName: string;
  initialValue: number;
  declaredValue?: number;
  movements: CashMovement[];
  saleIds: string[];
  totals: {
    vendas: number;
    entradas: number;
    reposicoes: number;
    sangrias: number;
    saldo: number;
  };
}

export interface AppSettings {
  productObservations: boolean;
  printReceipt: boolean;
  requireCustomerOnSale: boolean;
  lowStockAlerts: boolean;
  askDiscountReason: boolean;
  autoOpenCashOnLogin: boolean;
  darkSidebar: boolean;
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX",
  debito: "Débito",
  credito: "Crédito",
  dinheiro: "Dinheiro",
};
