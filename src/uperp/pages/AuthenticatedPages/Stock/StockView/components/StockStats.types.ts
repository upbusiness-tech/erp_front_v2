// ============================================================
// Tipagens mockadas para estatisticas de estoque
// Posteriormente sera adaptado para a tipagem real da API
// ============================================================

export type TransactionType = "sale" | "restock" | "adjustment" | "return";

// --- Estatisticas de Categorias ---

export interface CategoryStatsItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalSold: number;
  revenue: number;
}

export interface CategoryStatsResponse {
  period: { from: string; to: string };
  categories: CategoryStatsItem[];
}

// --- Transacoes de Produto ---

export interface ProductTransaction {
  id: string;
  date: string;
  type: TransactionType;
  quantity: number;
  unit: string;
  totalValue: number;
  description: string;
  createdBy: string;
}

// --- Estatisticas Detalhadas do Produto ---

export interface ProductStatsDetail {
  productId: number;
  productName: string;
  categoryName: string;
  categoryColor: string;
  unitOfMeasure: string;
  supplier: string;
  createdBy: string;
  createdAt: string;
  totalSold: number;
  grossRevenue: number;
  netRevenue: number;
  transactions: ProductTransaction[];
}

// --- Dados Mockados ---

export const MOCK_CATEGORY_STATS: CategoryStatsResponse = {
  period: { from: "2026-07-01", to: "2026-08-24" },
  categories: [
    {
      categoryId: "1",
      categoryName: "Roupas",
      categoryColor: "#F26B1F",
      totalSold: 342,
      revenue: 15200.0,
    },
    {
      categoryId: "2",
      categoryName: "Eletronicos",
      categoryColor: "#2563EB",
      totalSold: 189,
      revenue: 48500.0,
    },
    {
      categoryId: "3",
      categoryName: "Alimentos",
      categoryColor: "#16A34A",
      totalSold: 567,
      revenue: 8900.0,
    },
    {
      categoryId: "4",
      categoryName: "Cosmeticos",
      categoryColor: "#9333EA",
      totalSold: 124,
      revenue: 6700.0,
    },
    {
      categoryId: "5",
      categoryName: "Moveis",
      categoryColor: "#DC2626",
      totalSold: 43,
      revenue: 32100.0,
    },
  ],
};

export const MOCK_PRODUCT_STATS: ProductStatsDetail = {
  productId: 1,
  productName: "Camiseta Basica Algodao",
  categoryName: "Roupas",
  categoryColor: "#F26B1F",
  unitOfMeasure: "un",
  supplier: "Fornecedor ABC Ltda",
  createdBy: "Maria Silva",
  createdAt: "2026-03-15",
  totalSold: 87,
  grossRevenue: 3915.0,
  netRevenue: 2340.0,
  transactions: [
    {
      id: "t1",
      date: "2026-08-23",
      type: "sale",
      quantity: 2,
      unit: "un",
      totalValue: 90.0,
      description: "Venda de 2 unidades",
      createdBy: "Joao Santos",
    },
    {
      id: "t2",
      date: "2026-08-22",
      type: "restock",
      quantity: 50,
      unit: "un",
      totalValue: 750.0,
      description: "Reposicao de 50 unidades",
      createdBy: "Maria Silva",
    },
    {
      id: "t3",
      date: "2026-08-20",
      type: "sale",
      quantity: 5,
      unit: "un",
      totalValue: 225.0,
      description: "Venda de 5 unidades",
      createdBy: "Joao Santos",
    },
    {
      id: "t4",
      date: "2026-08-18",
      type: "adjustment",
      quantity: -3,
      unit: "un",
      totalValue: 0,
      description: "Ajuste de inventario - 3 unidades danificadas",
      createdBy: "Maria Silva",
    },
    {
      id: "t5",
      date: "2026-08-15",
      type: "sale",
      quantity: 10,
      unit: "un",
      totalValue: 450.0,
      description: "Venda de 10 unidades",
      createdBy: "Pedro Lima",
    },
    {
      id: "t6",
      date: "2026-08-12",
      type: "restock",
      quantity: 30,
      unit: "un",
      totalValue: 450.0,
      description: "Reposicao de 30 unidades",
      createdBy: "Maria Silva",
    },
    {
      id: "t7",
      date: "2026-08-10",
      type: "return",
      quantity: 1,
      unit: "un",
      totalValue: 45.0,
      description: "Devolucao de 1 unidade - defeito",
      createdBy: "Ana Costa",
    },
    {
      id: "t8",
      date: "2026-08-08",
      type: "sale",
      quantity: 15,
      unit: "un",
      totalValue: 675.0,
      description: "Venda de 15 unidades",
      createdBy: "Pedro Lima",
    },
    {
      id: "t9",
      date: "2026-08-05",
      type: "restock",
      quantity: 10,
      unit: "un",
      totalValue: 150.0,
      description: "Reposicao de 10 unidades",
      createdBy: "Maria Silva",
    },
    {
      id: "t10",
      date: "2026-08-01",
      type: "sale",
      quantity: 8,
      unit: "un",
      totalValue: 360.0,
      description: "Venda de 8 unidades",
      createdBy: "Joao Santos",
    },
  ],
};
