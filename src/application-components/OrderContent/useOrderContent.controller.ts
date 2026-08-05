import { PaymentMethod } from "@/enums/payment.enum";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { InternCustomerService } from "@/services/internCustomer.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useSalesStore } from "@/stores/sales.store";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { PaginatedResponse } from "@/types/crud.types";
import {
  calculateChangeSaleOnOrderContent,
  calculateRemainingSaleOnOrderContent,
  calculateTotalCartItems,
  calculateTotalPayments,
} from "@/uperp/common/saleFormulas";
import { message } from "antd";
import { useMemo, useState } from "react";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: "PIX",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  DINHEIRO: "Dinheiro",
};

export type OrderSteps = "items" | "payment";

const internCustomerService = new InternCustomerService();
export function useOrderContentController() {
  const {
    saleItems,
    setSaleItems,
    payments,
    setPayments,
    saleStep,
    setSaleStep,
    selectedCustomer,
    setSelectedCustomer,
  } = useSalesStore();

  const { currentCashFlow } = useCashFlowStore();

  const removeSaleItem = (id: number) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const updateSaleItemQuantity = (id: number, quantitySold: number) => {
    setSaleItems(saleItems.map((item) => (item.id === id ? { ...item, quantitySold } : item)));
  };

  const { data: customers, isLoading: isLoadingCustomers } =
    useGetAllWithParams<PaginatedResponse<InternCustomerModel>>(internCustomerService);

  const specialPriceMap = useMemo(() => {
    const map = new Map<number, InternCustomerSpecialPriceModel>();
    if (selectedCustomer?.internCustomerPrices) {
      for (const price of selectedCustomer.internCustomerPrices) {
        map.set(price.productEspecificationId, price);
      }
    }
    return map;
  }, [selectedCustomer]);

  const getSpecialPriceForItem = (
    item: CartSaleItem,
  ): InternCustomerSpecialPriceModel | undefined => {
    return specialPriceMap.get(item.productEspecificationId);
  };

  const goToPayment = () => {
    if (currentCashFlow?.isClosed) {
      message.warning("Abra o caixa antes de finalizar uma venda.");
      return;
    }
    setSaleStep("payment");
  };

  const [pMethod, setpMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [pValue, setpValue] = useState<number>(0);

  const total = calculateTotalCartItems(saleItems);
  const paid = calculateTotalPayments(payments);
  const remaining = calculateRemainingSaleOnOrderContent(saleItems, payments);
  const change = calculateChangeSaleOnOrderContent(saleItems, payments);
  const isOverpaid = paid > total;
  const isCashPayment = pMethod === PaymentMethod.CASH;
  const changePreview =
    isCashPayment && remaining > 0 && pValue >= remaining ? pValue - remaining : 0;

  const addPayment = () => {
    if (!pMethod) {
      message.warning("Meio de pagamento é obrigatório.");
      return;
    }
    if (pValue === 0) {
      setpValue(remaining);
      payments.push({
        id: Math.random() * 1000,
        amount: remaining,
        type: pMethod,
      });
      setPayments(payments);
      return;
    }
    payments.push({
      id: Math.random() * 1000,
      amount: pValue,
      type: pMethod,
    });
    setPayments(payments);
  };

  const removePayment = (id: number) => {
    const updatesPayments = payments.filter((p) => p.id != id);
    setPayments(updatesPayments);
  };

  return {
    saleStep,
    setSaleStep,
    setSaleItems,
    saleItems,
    removeSaleItem,
    updateSaleItemQuantity,
    customers: customers?.data,
    isLoadingCustomers,
    selectedCustomer,
    setselectedCustomer: setSelectedCustomer,
    specialPriceMap,
    getSpecialPriceForItem,
    goToPayment,
    payments,
    addPayment,
    pMethod,
    setpMethod,
    pValue,
    setpValue,
    removePayment,
    total,
    paid,
    remaining,
    change,
    isOverpaid,
    isCashPayment,
    changePreview,
  };
}
