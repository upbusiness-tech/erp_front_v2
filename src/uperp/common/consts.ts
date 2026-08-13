import { PaymentMethod } from "@/enums/payment.enum";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: "PIX",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  DINHEIRO: "Dinheiro",
};
