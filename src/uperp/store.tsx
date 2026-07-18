import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import type {
  Product,
  CartItem,
  Customer,
  Employee,
  Sale,
  Invoice,
  CashSession,
  CashMovement,
  ClosedCashSession,
  AppSettings,
  Category,
} from "./types";
import {
  initialProducts,
  initialCustomers,
  initialEmployees,
  initialSales,
  initialInvoices,
  initialCategories,
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
  customPrice?: number;
}

interface StoreCtx {
  products: Product[];
  setProducts: (p: Product[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
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
  cashHistory: ClosedCashSession[];
  openCash: (initialValue: number, operatorName: string) => void;
  closeCash: (declaredValue?: number) => void;
  addCashMovement: (m: Omit<CashMovement, "id" | "at">) => void;

  cart: CartItem[];
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addToCart: (p: Product, opts?: AddToCartOptions) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  applySpecialPricesToCart: (customerId: string | null) => number;
  resetCartPrices: () => void;

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

const seedClosedSessions: ClosedCashSession[] = [
  {
    id: "CX-001",
    openedAt: "2026-06-19T08:00:00",
    closedAt: "2026-06-19T18:10:00",
    operatorName: "Marcos Silva",
    initialValue: 200,
    declaredValue: 1548.9,
    saleIds: ["V003", "V004"],
    movements: [
      { id: "m1", type: "venda", value: 150, note: "Venda V003", at: "2026-06-19T10:22:00" },
      { id: "m2", type: "venda", value: 1200, note: "Venda V004", at: "2026-06-19T14:45:00" },
      { id: "m3", type: "sangria", value: 300, note: "Depósito bancário", at: "2026-06-19T16:00:00" },
      { id: "m4", type: "entrada", value: 50, note: "Ajuste de troco", at: "2026-06-19T17:30:00" },
    ],
    totals: { vendas: 1350, entradas: 50, reposicoes: 0, sangrias: 300, saldo: 1300 },
  },
  {
    id: "CX-002",
    openedAt: "2026-06-18T08:15:00",
    closedAt: "2026-06-18T18:00:00",
    operatorName: "Juliana Costa",
    initialValue: 150,
    declaredValue: 239.9,
    saleIds: ["V005"],
    movements: [
      { id: "m5", type: "venda", value: 89.9, note: "Venda V005", at: "2026-06-18T11:00:00" },
    ],
    totals: { vendas: 89.9, entradas: 0, reposicoes: 0, sangrias: 0, saldo: 239.9 },
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashHistory, setCashHistory] = useState<ClosedCashSession[]>(seedClosedSessions);
  const currentSaleIdsRef = useRef<string[]>([]);
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
    currentSaleIdsRef.current = [];
  };

  const closeCash = (declaredValue?: number) => {
    if (!cashSession) return;
    const sum = (t: CashMovement["type"]) =>
      cashMovements.filter((m) => m.type === t).reduce((s, m) => s + m.value, 0);
    const vendas = sum("venda");
    const entradas = sum("entrada");
    const reposicoes = sum("reposicao");
    const sangrias = sum("sangria");
    const saldo = cashSession.initialValue + vendas + entradas + reposicoes - sangrias;
    const closed: ClosedCashSession = {
      id: `CX-${String(Math.floor(Math.random() * 900 + 100))}`,
      openedAt: cashSession.openedAt,
      closedAt: new Date().toISOString(),
      operatorName: cashSession.operatorName,
      initialValue: cashSession.initialValue,
      declaredValue,
      movements: cashMovements,
      saleIds: [...currentSaleIdsRef.current],
      totals: { vendas, entradas, reposicoes, sangrias, saldo },
    };
    setCashHistory((h) => [closed, ...h]);
    setCashSession(null);
    setCashMovements([]);
    currentSaleIdsRef.current = [];
  };

  const addCashMovement = (m: Omit<CashMovement, "id" | "at">) => {
    setCashMovements((arr) => [
      { ...m, id: Math.random().toString(36).slice(2), at: new Date().toISOString() },
      ...arr,
    ]);
  };

  const cartKey = (p: Product, opts?: AddToCartOptions) =>
    `${p.id}__${opts?.size || ""}__${opts?.color || ""}__${opts?.observation || ""}__${opts?.customPrice ?? ""}`;

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
          customPrice: opts?.customPrice,
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

  const applySpecialPricesToCart = (customerId: string | null): number => {
    if (!customerId) return 0;
    const customer = customers.find((c) => c.id === customerId);
    const map = new Map((customer?.specialPrices || []).map((s) => [s.productId, s.price]));
    let applied = 0;
    setCart((c) =>
      c.map((i) => {
        const sp = map.get(i.product.id);
        if (sp != null && sp !== i.product.price) {
          applied += 1;
          return { ...i, customPrice: sp };
        }
        return i;
      }),
    );
    return applied;
  };

  const resetCartPrices = () =>
    setCart((c) => c.map((i) => ({ ...i, customPrice: undefined })));

  const addSale = (s: Sale) => {
    setSales((arr) => [s, ...arr]);
    if (cashSession) {
      currentSaleIdsRef.current = [...currentSaleIdsRef.current, s.id];
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
        categories,
        setCategories,
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
        cashHistory,
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
        applySpecialPricesToCart,
        resetCartPrices,
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
