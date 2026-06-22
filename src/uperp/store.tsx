import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Product,
  CartItem,
  Customer,
  Employee,
  Sale,
  Invoice,
  CashSession,
  CashMovement,
  AppSettings,
} from "./types";
import {
  initialProducts,
  initialCustomers,
  initialEmployees,
  initialSales,
  initialInvoices,
} from "./mockData";

interface Company {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  plan: string;
}

export interface AddToCartOptions {
  qty?: number;
  size?: string;
  color?: string;
  observation?: string;
}

interface StoreCtx {
  products: Product[];
  setProducts: (p: Product[]) => void;
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  sales: Sale[];
  addSale: (s: Sale) => void;
  invoices: Invoice[];

  cashOpen: boolean;
  cashSession: CashSession | null;
  cashMovements: CashMovement[];
  openCash: (initialValue: number, operatorName: string) => void;
  closeCash: () => void;
  addCashMovement: (m: Omit<CashMovement, "id" | "at">) => void;

  cart: CartItem[];
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addToCart: (p: Product, opts?: AddToCartOptions) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  company: Company;
  setCompany: (c: Company) => void;

  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const defaultSettings: AppSettings = {
  productObservations: true,
  printReceipt: false,
  requireCustomerOnSale: false,
  lowStockAlerts: true,
  askDiscountReason: false,
  autoOpenCashOnLogin: false,
  darkSidebar: true,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [company, setCompany] = useState<Company>({
    name: "Minha Loja Demo Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@minhaloja.com",
    phone: "(11) 3000-0000",
    address: "Rua das Flores, 100 - São Paulo/SP",
    plan: "Profissional",
  });

  const cashOpen = cashSession !== null;

  const openCash = (initialValue: number, operatorName: string) => {
    setCashSession({
      openedAt: new Date().toISOString(),
      initialValue,
      operatorName,
    });
    setCashMovements([]);
  };

  const closeCash = () => {
    setCashSession(null);
    setCashMovements([]);
  };

  const addCashMovement = (m: Omit<CashMovement, "id" | "at">) => {
    setCashMovements((arr) => [
      { ...m, id: Math.random().toString(36).slice(2), at: new Date().toISOString() },
      ...arr,
    ]);
  };

  const cartKey = (p: Product, opts?: AddToCartOptions) =>
    `${p.id}__${opts?.size || ""}__${opts?.color || ""}__${opts?.observation || ""}`;

  const addToCart = (p: Product, opts?: AddToCartOptions) => {
    const qty = opts?.qty ?? 1;
    const key = cartKey(p, opts);
    setCart((c) => {
      const exists = c.find((i) => i.id === key);
      if (exists) return c.map((i) => (i.id === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...c,
        {
          id: key,
          product: p,
          qty,
          size: opts?.size,
          color: opts?.color,
          observation: opts?.observation,
        },
      ];
    });
  };
  const updateCartQty = (id: string, qty: number) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId(null);
  };
  const addSale = (s: Sale) => {
    setSales((arr) => [s, ...arr]);
    if (cashSession) {
      addCashMovement({ type: "venda", value: s.total, note: `Venda ${s.id}` });
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <Ctx.Provider
      value={{
        products,
        setProducts,
        customers,
        setCustomers,
        employees,
        setEmployees,
        sales,
        addSale,
        invoices,
        cashOpen,
        cashSession,
        cashMovements,
        openCash,
        closeCash,
        addCashMovement,
        cart,
        selectedCustomerId,
        setSelectedCustomerId,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        company,
        setCompany,
        settings,
        updateSetting,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
