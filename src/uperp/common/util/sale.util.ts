import { SaleStatus, SaleType } from "@/enums/sale.enum";

export const mapSaleType: Record<SaleType, { label: string; color: string }> = {
  [SaleType.NORMAL]: { label: "Balcão", color: "orange" },
  [SaleType.SERVICE]: { label: "Serviço", color: "blue" },
  [SaleType.PDV]: { label: "PDV", color: "purple" },
};

export const mapSaleStatus: Record<SaleStatus, { label: string; color: string }> = {
  [SaleStatus.COMPLETED]: { label: SaleStatus.COMPLETED, color: "green" },
  [SaleStatus.CANCELED]: { label: SaleStatus.CANCELED, color: "error" },
  [SaleStatus.IN_PROGRESS]: { label: SaleStatus.IN_PROGRESS, color: "magenta" },
};
