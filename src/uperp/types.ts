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
  variations?: ProductVariations;
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
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  loyalty: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: number;
  type: "balcao" | "servico";
  customerId?: string;
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

export interface AppSettings {
  productObservations: boolean;
  printReceipt: boolean;
  requireCustomerOnSale: boolean;
  lowStockAlerts: boolean;
  askDiscountReason: boolean;
  autoOpenCashOnLogin: boolean;
  darkSidebar: boolean;
}
