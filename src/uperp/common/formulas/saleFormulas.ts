import type { ProductEspecificationModel } from "@/model/productEspecification.model";
import type { SaleItemModel, SaleModel, SaleServiceModel } from "@/model/sale.model";
import type {
  CartSaleItem,
  ISaleServiceForm,
  PaymentItem,
} from "../../pages/AuthenticatedPages/CommonSale/types";
import { calculateSpecialPriceSavings, resolveItemUnitPrice } from "./unitPrice.ts";

export { calculateSpecialPriceSavings };

export type SaleItemLike = SaleItemModel | CartSaleItem;

export const round2 = (n: number) => Math.round(n * 100) / 100;

const isSaleItemModel = (item: SaleItemLike): item is SaleItemModel =>
  "productSnapshot" in item && item.productSnapshot != null;

const getItemSpecification = (item: SaleItemLike): ProductEspecificationModel | null | undefined =>
  isSaleItemModel(item) ? item.productSnapshot : item.productEspecification;

const getItemSalePrice = (item: SaleItemLike) => Number(getItemSpecification(item)?.salePrice ?? 0);

// Espelha resolveItemUnitPrice do backend: usa o preço especial apenas quando
// o item realmente foi vendido com preço especial e o snapshot existe.
const resolveItemPrice = (item: SaleItemLike) => {
  if (isSaleItemModel(item)) {
    return item.isEspecialPrice && item.specialPriceSnapshot != null
      ? Number(item.specialPriceSnapshot)
      : Number(item.salePriceSnapshot ?? getItemSalePrice(item));
  }

  return resolveItemUnitPrice(item);
};

export const calculateItemNet = (item: SaleItemLike) => {
  const gross = round2(resolveItemPrice(item) * Number(item.quantitySold) * Number(item.unitSold));
  const discount = round2(Number(item.discountInfo?.value ?? 0));

  return round2(gross - discount);
};

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
  return items.reduce((acc, item) => round2(acc + calculateItemNet(item)), 0);
};

export const calculateServiceItemsTotal = (
  saleServices: ISaleServiceForm[] | SaleServiceModel[],
) => {
  return saleServices.reduce((acc, item) => round2(acc + round2(Number(item.amount))), 0);
};

export const calculateTotalCartItems = (
  items: SaleItemLike[],
  saleServices: ISaleServiceForm[] | SaleServiceModel[] | undefined,
  saleDiscount?: { value?: number } | null,
) => {
  const itemsTotal = calculateItemsTotal(items);
  const servicesTotal = calculateServiceItemsTotal(saleServices ?? []);
  const subtotal = round2(itemsTotal + servicesTotal);
  const discount = round2(Number(saleDiscount?.value ?? 0));

  return Math.max(round2(subtotal - discount), 0);
};

export const calculateRemainingSaleOnOrderContent = (total: number, payments: PaymentItem[]) => {
  const totalPayments = calculateTotalPayments(payments);
  return Math.max(round2(total - totalPayments), 0);
};

export const calculateChangeSaleOnOrderContent = (total: number, payments: PaymentItem[]) => {
  const totalPayments = calculateTotalPayments(payments);
  return Math.max(round2(totalPayments - total), 0);
};

export const calculateSaleService = (services: SaleServiceModel[]) => {
  return calculateServiceItemsTotal(services);
};

export const calculateSaleTotal = (sale: SaleModel) => {
  return calculateTotalCartItems(sale.items, sale.services, sale.discount);
};

export const calculateTotalPayments = (payments: PaymentItem[]) => {
  return round2(
    payments.reduce((total, payment) => total + round2(Number(payment.amount ?? 0)), 0),
  );
};
