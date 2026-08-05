import { PaymentMethod } from "@/enums/payment.enum";
import { SaleModel, SaleReceiptModel, SaleReceiptPaymentModel } from "@/model/sale.model";

export const SALE_PAYMENT_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CREDIT]: "Crédito",
  [PaymentMethod.DEBIT]: "Débito",
  [PaymentMethod.CASH]: "Dinheiro",
};

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

export const createSaleReceipt = (sale: SaleModel): SaleReceiptModel => {
  const items = sale.items.map((item) => {
    const normalPrice = toNumber(item.productEspecification.salePrice);
    const specialPrice = toNumber(item.internCustomerPrice?.specialPrice);
    const hasSpecialPrice = item.isEspecialPrice && item.internCustomerPrice?.specialPrice != null;
    const unitPrice = hasSpecialPrice ? specialPrice : normalPrice;
    const quantity = Number(item.quantitySold);

    return {
      id: item.id,
      name: item.product.name,
      quantity,
      originalUnitPrice: normalPrice,
      unitPrice,
      lineTotal: unitPrice * quantity,
      hasSpecialPrice,
      size: item.productEspecification.size || undefined,
      color: item.productEspecification.color || undefined,
      brand: item.productEspecification.brand || undefined,
      unitOfMeasure: item.product.unitOfMeasure || undefined,
      note: item.note || undefined,
    };
  });

  const payments: SaleReceiptPaymentModel[] = sale.payments.map((payment) => ({
    id: payment.id,
    type: payment.type,
    amount: toNumber(payment.amount),
  }));
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const specialPriceTotal = items.reduce(
    (total, item) => (item.hasSpecialPrice ? total + item.lineTotal : total),
    0,
  );
  const paid = payments.reduce((total, payment) => total + payment.amount, 0);

  return {
    sale,
    code: sale.code || String(sale.id),
    date: sale.createdAt || "",
    customerName: sale.internCustomer?.name || "Consumidor final",
    items,
    payments,
    subtotal,
    specialPriceTotal,
    paid,
    change: Math.max(paid - subtotal, 0),
  };
};
