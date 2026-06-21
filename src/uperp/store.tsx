import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product, CartItem, Customer, Employee, Sale, Invoice } from "./types";
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
  toggleCash: () => void;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  company: Company;
  setCompany: (c: Company) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [cashOpen, setCashOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [company, setCompany] = useState<Company>({
    name: "Minha Loja Demo Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@minhaloja.com",
    phone: "(11) 3000-0000",
    address: "Rua das Flores, 100 - São Paulo/SP",
    plan: "Profissional",
  });

  const addToCart = (p: Product) => {
    setCart((c) => {
      const exists = c.find((i) => i.product.id === p.id);
      if (exists) return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1 }];
    });
  };
  const updateCartQty = (id: string, qty: number) =>
    setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty } : i)));
  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));
  const clearCart = () => setCart([]);
  const addSale = (s: Sale) => setSales((arr) => [s, ...arr]);

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
        toggleCash: () => setCashOpen((v) => !v),
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        company,
        setCompany,
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
