import { PaymentMethod } from "@/enums/payment.enum";
import { SaleType } from "@/enums/sale.enum";

export type SalesDashboardResponse = {
  period: {
    from: string;
    to: string;
  };

  filters: {
    paymentType: PaymentMethod[];
    saleType: SaleType[];
    customerName: string | null;
    saleCode: string | null;
  };

  summary: {
    filteredSales: number;
    total: number;
  };

  paymentBreakdown: {
    type: PaymentMethod;
    amount: number;
  }[];
};
