import { CartSaleItem, PaymentItem } from "../pages/AuthenticatedPages/CommonSale/types";

// ORDER CONTENT FORMULAS
export const calculateTotalCartItems = (items: CartSaleItem[]) => {
  const total = items.reduce((acc, item) => {
    const unitPrice = item.isEspecialPrice
      ? Number(item.internCustomerPrice?.specialPrice ?? 0)
      : Number(item.productEspecification.salePrice);
    return acc + unitPrice * Number(item.quantitySold);
  }, 0);

  return total;
};

export const calculateRemainingSaleOnOrderContent = (
  items: CartSaleItem[],
  payments: PaymentItem[],
) => {
  const totalItems = calculateTotalCartItems(items);
  const totalPayments = calculateTotalPayments(payments);
  const remaining = totalItems - totalPayments;
  if (remaining <= 0) {
    return 0;
  }
  return remaining;
};

export const calculateChangeSaleOnOrderContent = (
  items: CartSaleItem[],
  payments: PaymentItem[],
) => {
  const totalItems = calculateTotalCartItems(items);
  const totalPayments = calculateTotalPayments(payments);
  const change = totalPayments - totalItems;
  if (change < 0) {
    return 0;
  }
  return change;
};

export const calculateTotalPayments = (payments: PaymentItem[]) => {
  const total = payments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);
  return total;
};
