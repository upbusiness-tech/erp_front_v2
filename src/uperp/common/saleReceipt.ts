import { PaymentMethod } from "@/enums/payment.enum";
import {
  SaleItemModel,
  SaleModel,
  SaleReceiptModel,
  SaleReceiptPaymentModel,
} from "@/model/sale.model";
import {
  calculateGrossSubtotal,
  calculateItemDiscountsTotal,
  calculateSpecialPriceSavings,
} from "./saleFormulas";

export const SALE_PAYMENT_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CREDIT]: "Crédito",
  [PaymentMethod.DEBIT]: "Débito",
  [PaymentMethod.CASH]: "Dinheiro",
};

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const getItemUnitPrice = (item: SaleItemModel): number => {
  const normalPrice = toNumber(item.productEspecification.salePrice);
  const specialPrice = toNumber(item.internCustomerPrice?.specialPrice);
  const hasSpecialPrice = item.isEspecialPrice && item.internCustomerPrice?.specialPrice != null;
  return hasSpecialPrice ? specialPrice : normalPrice;
};

export const calculateSaleSubtotal = (sale: SaleModel): number =>
  calculateGrossSubtotal(sale.items);

export const createSaleReceipt = (sale: SaleModel): SaleReceiptModel => {
  const items = sale.items.map((item) => {
    const unitPrice = getItemUnitPrice(item);
    const normalPrice = toNumber(item.productEspecification.salePrice);
    const hasSpecialPrice = item.isEspecialPrice && item.internCustomerPrice?.specialPrice != null;
    const quantity = Number(item.quantitySold);
    const itemDiscount = toNumber(item.discountInfo?.value);
    const lineTotal = Math.max(unitPrice * quantity - itemDiscount, 0);

    return {
      id: item.id,
      name: item.product.name,
      quantity,
      originalUnitPrice: normalPrice,
      unitPrice,
      lineTotal,
      hasSpecialPrice,
      size: item.productEspecification.size || undefined,
      color: item.productEspecification.color || undefined,
      brand: item.productEspecification.brand || undefined,
      unitOfMeasure: item.product.unitOfMeasure || undefined,
      note: item.note || undefined,
      discountValue: itemDiscount > 0 ? itemDiscount : undefined,
    };
  });

  const payments: SaleReceiptPaymentModel[] = sale.payments.map((payment) => ({
    id: payment.id,
    type: payment.type,
    amount: toNumber(payment.amount),
  }));

  const subtotal = calculateGrossSubtotal(sale.items);
  const specialPriceTotal = calculateSpecialPriceSavings(sale.items);
  const itemDiscountTotal = calculateItemDiscountsTotal(sale.items);
  const saleDiscountValue = toNumber(sale.discount?.value);
  const total = Math.max(subtotal - specialPriceTotal - itemDiscountTotal - saleDiscountValue, 0);
  const paid = payments.reduce((t, payment) => t + payment.amount, 0);

  return {
    sale,
    code: sale.code || String(sale.id),
    date: sale.createdAt || "",
    customerName: sale.internCustomer?.name || "Consumidor final",
    items,
    payments,
    subtotal,
    specialPriceTotal,
    itemDiscountTotal,
    saleDiscountValue,
    total,
    paid,
    change: Math.max(paid - total, 0),
  };
};
