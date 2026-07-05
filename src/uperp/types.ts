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

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
}

export type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

export interface Payment {
  method: PaymentMethod;
  value: number;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: number;
  type: "balcao" | "servico";
  customerId?: string;
  payments?: Payment[];
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
