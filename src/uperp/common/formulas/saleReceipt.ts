import { PaymentMethod } from "@/enums/payment.enum";
import {
  SaleItemModel,
  SaleModel,
  SaleReceiptModel,
  SaleReceiptPaymentModel,
  SaleReceiptServiceModel,
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

type UnitSoldFormat = { precision: number; suffix: string; divisor: number };

// divisor converte a unidade de exibição (g/cm/ml) para a unidade comercial do preço (kg/m/l)
const UNIT_SOLD_FORMAT: Record<string, UnitSoldFormat> = {
  Gramas: { precision: 3, suffix: "g", divisor: 1000 },
  Metro: { precision: 2, suffix: "cm", divisor: 100 },
  Litro: { precision: 2, suffix: "ml", divisor: 1000 },
};

export const getUnitSoldFormat = (unitOfMeasure?: string): UnitSoldFormat | null =>
  (unitOfMeasure && UNIT_SOLD_FORMAT[unitOfMeasure]) || null;

export const formatUnitSoldAmount = (unitOfMeasure?: string, unitSold?: number): string | null => {
  const format = getUnitSoldFormat(unitOfMeasure);
  if (!format || unitSold == null) return null;
  return Number(unitSold).toFixed(format.precision).replace(".", ",") + format.suffix;
};

const getItemUnitPrice = (item: SaleItemModel): number => {
  const normalPrice = toNumber(item.productEspecification.salePrice);
  const specialPrice = toNumber(item.internCustomerPrice?.specialPrice);
  const hasSpecialPrice = item.isEspecialPrice && item.internCustomerPrice?.specialPrice != null;
  return hasSpecialPrice ? specialPrice : normalPrice;
};

export const calculateSaleSubtotal = (sale: SaleModel): number =>
  calculateGrossSubtotal(sale.items, sale.services);

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
      unitSold: toNumber(item.unitSold) || 1,
      note: item.note || undefined,
      discountValue: itemDiscount > 0 ? itemDiscount : undefined,
    };
  });

  const services: SaleReceiptServiceModel[] = (sale.services ?? []).map((service) => ({
    id: service.id,
    description: service.description,
    onwerEmployee: service.onwerEmployee,
    amount: toNumber(service.amount),
    discountValue: toNumber(service.discount?.value) || undefined,
  }));

  const payments: SaleReceiptPaymentModel[] = sale.payments.map((payment) => ({
    id: payment.id,
    type: payment.type,
    amount: toNumber(payment.amount),
  }));

  const subtotal = calculateGrossSubtotal(sale.items, sale.services);
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
    services,
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
