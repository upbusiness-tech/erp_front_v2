export interface ProductDashboardQueryDto {
  from: string;
  to: string;
  limit?: number;
}

export interface ProductDashboardEntry {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
  stockQuantity: number;
  turnover: number;
}

export interface ProductDashboardResponse {
  period: {
    from: string;
    to: string;
  };
  summary: {
    unitsSold: number;
    revenue: number;
    featuredProduct: ProductDashboardEntry | null;
    zeroStockProducts: number;
  };
  rankings: {
    bestSelling: ProductDashboardEntry[];
    highestRevenue: ProductDashboardEntry[];
    highestTurnover: ProductDashboardEntry[];
    urgentRestock: ProductDashboardEntry[];
  };
}
