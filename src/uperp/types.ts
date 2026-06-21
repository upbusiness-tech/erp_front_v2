export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  customPrice?: number;
  description?: string;
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
}

export interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: "paga" | "aberta" | "atrasada";
  dueDate: string;
}
