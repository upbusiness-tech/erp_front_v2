import type { Product, Customer, Employee, Sale, Invoice, Category } from "./types";

export const initialCategories: Category[] = [
  { id: "c1", name: "Vestuário" },
  { id: "c2", name: "Calçados" },
  { id: "c3", name: "Acessórios" },
];

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Camiseta Básica",
    sku: "CAM001",
    price: 49.9,
    stock: 32,
    category: "Vestuário",
    variations: { sizes: ["P", "M", "G", "GG"], colors: ["Branco", "Preto", "Cinza"] },
  },
  {
    id: "2",
    name: "Calça Jeans",
    sku: "CAL001",
    price: 159.9,
    stock: 18,
    category: "Vestuário",
    variations: { sizes: ["38", "40", "42", "44", "46"], colors: ["Azul", "Preto"] },
  },
  {
    id: "3",
    name: "Tênis Esportivo",
    sku: "TEN001",
    price: 299.9,
    stock: 7,
    category: "Calçados",
    variations: { sizes: ["38", "39", "40", "41", "42", "43"], colors: ["Branco", "Preto", "Vermelho"] },
  },
  { id: "4", name: "Boné Trucker", sku: "BON001", price: 39.9, stock: 0, category: "Acessórios" },
  { id: "5", name: "Mochila Casual", sku: "MOC001", price: 189.9, stock: 12, category: "Acessórios" },
  { id: "6", name: "Relógio Digital", sku: "REL001", price: 249.9, stock: 4, category: "Acessórios" },
  {
    id: "7",
    name: "Camisa Polo",
    sku: "CAM002",
    price: 89.9,
    stock: 25,
    category: "Vestuário",
    variations: { sizes: ["P", "M", "G", "GG"], colors: ["Marinho", "Vinho", "Verde"] },
  },
  {
    id: "8",
    name: "Bermuda Sarja",
    sku: "BER001",
    price: 79.9,
    stock: 14,
    category: "Vestuário",
    variations: { sizes: ["38", "40", "42", "44"] },
  },
];

export const initialCustomers: Customer[] = [
  { id: "1", name: "Ana Souza", email: "ana@email.com", phone: "(11) 99999-1234", document: "123.456.789-00", loyalty: true },
  { id: "2", name: "Bruno Lima", email: "bruno@email.com", phone: "(11) 98888-5678", document: "987.654.321-00", loyalty: false },
  { id: "3", name: "Carla Mendes", email: "carla@email.com", phone: "(11) 97777-9999", document: "111.222.333-44", loyalty: true },
];

export const initialEmployees: Employee[] = [
  { id: "1", name: "Pedro Almeida", role: "Gerente", email: "pedro@uperp.com", active: true },
  { id: "2", name: "Juliana Costa", role: "Vendedor(a)", email: "juliana@uperp.com", active: true },
  { id: "3", name: "Marcos Silva", role: "Caixa", email: "marcos@uperp.com", active: true },
  { id: "4", name: "Renata Dias", role: "Estoquista", email: "renata@uperp.com", active: false },
];

export const initialSales: Sale[] = [
  { id: "V001", date: "2026-06-20", total: 459.7, items: 3, type: "balcao", payments: [{ method: "credito", value: 459.7 }] },
  { id: "V002", date: "2026-06-20", total: 289.9, items: 2, type: "balcao", payments: [{ method: "pix", value: 289.9 }] },
  { id: "V003", date: "2026-06-19", total: 150.0, items: 1, type: "servico", payments: [{ method: "dinheiro", value: 150 }] },
  { id: "V004", date: "2026-06-19", total: 1200.0, items: 5, type: "balcao", payments: [{ method: "credito", value: 800 }, { method: "pix", value: 400 }] },
  { id: "V005", date: "2026-06-18", total: 89.9, items: 1, type: "balcao", payments: [{ method: "debito", value: 89.9 }] },
];

export const initialInvoices: Invoice[] = [
  { id: "F-2026-06", period: "Junho/2026", amount: 299.9, status: "aberta", dueDate: "2026-06-30" },
  { id: "F-2026-05", period: "Maio/2026", amount: 299.9, status: "paga", dueDate: "2026-05-30" },
  { id: "F-2026-04", period: "Abril/2026", amount: 299.9, status: "paga", dueDate: "2026-04-30" },
  { id: "F-2026-03", period: "Março/2026", amount: 299.9, status: "paga", dueDate: "2026-03-30" },
];
