export type GeneralStatsByProduct = {
  netProfit: number;
  grossProfit: number;
  unitsSold: number;
};

export type TransactionOverviewByProduct = {
  id: number;
  productId: string;
  color: string;
  brand: string;
  size: string;
  type: string;
  value: number;
  saleDate: string;
  saleCode: string;
  saleTotal: number;
  transactionDate: string;
  createdBy: string;
};
