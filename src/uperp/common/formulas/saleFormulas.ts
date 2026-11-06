import type { ProductEspecificationModel } from "@/model/productEspecification.model";
import type { SaleItemModel, SaleModel, SaleServiceModel } from "@/model/sale.model";
import type {
  CartSaleItem,
  ISaleServiceForm,
  PaymentItem,
} from "../../pages/AuthenticatedPages/CommonSale/types";
import { calculateSpecialPriceSavings } from "./unitPrice.ts";

export { calculateSpecialPriceSavings };

export type SaleItemLike = SaleItemModel | CartSaleItem;

export const round2 = (n: number) => Math.round(n * 100) / 100;

const isSaleItemModel = (item: SaleItemLike): item is SaleItemModel =>
  "productSnapshot" in item && item.productSnapshot != null;

const getItemSpecification = (item: SaleItemLike): ProductEspecificationModel | null | undefined =>
  isSaleItemModel(item) ? item.productSnapshot : item.productEspecification;

const getItemSalePrice = (item: SaleItemLike) => Number(getItemSpecification(item)?.salePrice ?? 0);

export const calculateGrossSubtotal = (
  items: SaleItemLike[],
  services?: ISaleServiceForm[] | SaleServiceModel[],
) => {
  const totalItems = items.reduce((acc, item) => {
    return acc + getItemSalePrice(item) * Number(item.quantitySold) * Number(item.unitSold);
  }, 0);

  const totalService = services?.reduce((acc, item) => {
    return acc + Number(item.amount);
  }, 0);

  return totalItems + (totalService ?? 0);
};

export const calculateItemDiscountsTotal = (items: SaleItemLike[]) => {
  return items.reduce((acc, item) => {
    return acc + Number(item.discountInfo?.value ?? 0);
  }, 0);
};

export const calculateItemsTotal = (items: SaleItemLike[]) => {
  const gross = calculateGrossSubtotal(items, []);
  const savings = calculateSpecialPriceSavings(items);
  const itemDiscounts = calculateItemDiscountsTotal(items);
  return Math.max(gross - savings - itemDiscounts, 0);
};

export const calculateServiceItemsTotal = (
  saleServices: ISaleServiceForm[] | SaleServiceModel[],
) => {
  const totalService = saleServices?.reduce((acc, item) => {
    return acc + Number(item.amount);
  }, 0);

  return totalService;
};

export const calculateTotalCartItems = (
  items: SaleItemLike[],
  saleServices: ISaleServiceForm[] | SaleServiceModel[] | undefined,
  saleDiscount?: { value?: number } | null,
) => {
  let itemsTotal = calculateItemsTotal(items);
  if (saleServices) itemsTotal += calculateServiceItemsTotal(saleServices);
  const discount = Number(saleDiscount?.value ?? 0);
  return Math.max(itemsTotal - discount, 0);
};

export const calculateRemainingSaleOnOrderContent = (total: number, payments: PaymentItem[]) => {
  const totalPayments = calculateTotalPayments(payments);
  return Math.max(total - totalPayments, 0);
};

export const calculateChangeSaleOnOrderContent = (total: number, payments: PaymentItem[]) => {
  const totalPayments = calculateTotalPayments(payments);
  return Math.max(totalPayments - total, 0);
};

export const calculateSaleService = (services: SaleServiceModel[]) => {
  const totalServices = services.reduce((acc, service) => {
    return acc + service.amount;
  }, 0);
  return totalServices;
};

export const calculateSaleTotal = (sale: SaleModel) => {
  return calculateTotalCartItems(sale.items, sale.services, sale.discount);
};

export const calculateTotalPayments = (payments: PaymentItem[]) => {
  const total = payments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);
  return total;
};
