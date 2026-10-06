import { SaleItemModel, SaleModel, SaleServiceModel } from "@/model/sale.model";
import {
  CartSaleItem,
  ISaleServiceForm,
  PaymentItem,
} from "../../pages/AuthenticatedPages/CommonSale/types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const calculateGrossSubtotal = (
  items: CartSaleItem[] | SaleItemModel[],
  services?: ISaleServiceForm[] | SaleServiceModel[],
) => {
  const totalItems = items.reduce((acc, item) => {
    return (
      acc +
      Number(item.productEspecification.salePrice) *
        Number(item.quantitySold) *
        Number(item.unitSold)
    );
  }, 0);

  const totalService = services?.reduce((acc, item) => {
    return acc + Number(item.amount);
  }, 0);

  return totalItems + (totalService ?? 0);
};

export const calculateSpecialPriceSavings = (items: CartSaleItem[] | SaleItemModel[]) => {
  return items.reduce((acc, item) => {
    if (!item.isEspecialPrice || !item.internCustomerPrice?.specialPrice) return acc;
    const normal = Number(item.productEspecification.salePrice);
    const special = Number(item.internCustomerPrice.specialPrice);
    return acc + (normal - special) * Number(item.quantitySold) * Number(item.unitSold);
  }, 0);
};

export const calculateItemDiscountsTotal = (items: CartSaleItem[] | SaleItemModel[]) => {
  return items.reduce((acc, item) => {
    return acc + Number(item.discountInfo?.value ?? 0);
  }, 0);
};

export const calculateItemsTotal = (items: CartSaleItem[] | SaleItemModel[]) => {
  const gross = calculateGrossSubtotal(items);
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
  items: CartSaleItem[] | SaleItemModel[],
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
