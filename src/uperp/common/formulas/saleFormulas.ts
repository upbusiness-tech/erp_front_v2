import { SaleItemModel, SaleModel } from "@/model/sale.model";
import { CartSaleItem, PaymentItem } from "../../pages/AuthenticatedPages/CommonSale/types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const calculateGrossSubtotal = (items: CartSaleItem[] | SaleItemModel[]) => {
  return items.reduce((acc, item) => {
    return (
      acc +
      Number(item.productEspecification.salePrice) *
        Number(item.quantitySold) *
        Number(item.unitSold)
    );
  }, 0);
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

export const calculateTotalCartItems = (
  items: CartSaleItem[] | SaleItemModel[],
  saleDiscount?: { value?: number } | null,
) => {
  const itemsTotal = calculateItemsTotal(items);
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

export const calculateSaleTotal = (sale: SaleModel) => {
  return calculateTotalCartItems(sale.items, sale.discount);
};

export const calculateTotalPayments = (payments: PaymentItem[]) => {
  const total = payments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);
  return total;
};
