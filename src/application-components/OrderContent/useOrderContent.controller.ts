import { PaymentMethod } from "@/enums/payment.enum";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { InternCustomerService } from "@/services/internCustomer.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useSalesStore } from "@/stores/sales.store";
import { PaginatedResponse } from "@/types/crud.types";
import {
  calculateChangeSaleOnOrderContent,
  calculateGrossSubtotal,
  calculateItemDiscountsTotal,
  calculateRemainingSaleOnOrderContent,
  calculateSpecialPriceSavings,
  calculateTotalCartItems,
  calculateTotalPayments,
} from "@/uperp/common/saleFormulas";
import { CartSaleItem, DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
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
    saleDiscount,
    setSaleDiscount,
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

  const applyItemDiscount = (item: CartSaleItem, discount: DiscountInfo) => {
    setSaleItems(saleItems.map((i) => (i.id === item.id ? { ...i, discountInfo: discount } : i)));
  };

  const removeItemDiscount = (item: CartSaleItem) => {
    setSaleItems(saleItems.map((i) => (i.id === item.id ? { ...i, discountInfo: undefined } : i)));
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

  const total = calculateTotalCartItems(saleItems, saleDiscount);
  const paid = calculateTotalPayments(payments);
  const remaining = calculateRemainingSaleOnOrderContent(total, payments);
  const change = calculateChangeSaleOnOrderContent(total, payments);
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

  const [specialPriceModalOpen, setSpecialPriceModalOpen] = useState(false);
  const [itemForSpecialPrice, setItemForSpecialPrice] = useState<CartSaleItem | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [itemForDiscount, setItemForDiscount] = useState<CartSaleItem | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [saleDiscountExpanded, setSaleDiscountExpanded] = useState(false);

  const grossSubtotal = calculateGrossSubtotal(saleItems);
  const specialPriceSavings = calculateSpecialPriceSavings(saleItems);
  const itemDiscountsTotal = calculateItemDiscountsTotal(saleItems);
  const saleDiscountValue = saleDiscount?.value ?? 0;

  const handleOpenSpecialPriceModal = (item: CartSaleItem) => {
    setItemForSpecialPrice(item);
    setSpecialPriceModalOpen(true);
  };

  const handleApplySpecialPrice = () => {
    if (!itemForSpecialPrice) return;
    const specialPrice = getSpecialPriceForItem(itemForSpecialPrice);
    if (!specialPrice) return;

    setSaleItems(
      saleItems.map((item) =>
        item.id === itemForSpecialPrice.id
          ? {
              ...item,
              isEspecialPrice: true,
              internCustomerPriceId: specialPrice.id,
              internCustomerPrice: specialPrice,
            }
          : item,
      ),
    );

    setSpecialPriceModalOpen(false);
    setItemForSpecialPrice(null);
  };

  const handleRemoveSpecialPrice = (item: CartSaleItem) => {
    setSaleItems(
      saleItems.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isEspecialPrice: false,
              internCustomerPriceId: undefined,
              internCustomerPrice: undefined,
            }
          : i,
      ),
    );
  };

  const handleOpenDiscountModal = (item: CartSaleItem) => {
    setItemForDiscount(item);
    setDiscountModalOpen(true);
  };

  const handleApplyItemDiscount = (item: CartSaleItem, discount: DiscountInfo) => {
    applyItemDiscount(item, discount);
    setDiscountModalOpen(false);
    setItemForDiscount(null);
  };

  const handleRemoveItemDiscount = (item: CartSaleItem) => {
    removeItemDiscount(item);
    setDiscountModalOpen(false);
    setItemForDiscount(null);
  };

  const handleSaleDiscountPercentChange = (percent: number | null) => {
    if (percent != null && (percent < 0 || percent > 100)) return;
    const itemsTotal = grossSubtotal - specialPriceSavings - itemDiscountsTotal;
    const value = percent != null ? Math.round((percent / 100) * itemsTotal * 100) / 100 : 0;
    setSaleDiscount({ value, percent: percent ?? undefined });
  };

  const handleSaleDiscountValueChange = (value: number | null) => {
    const itemsTotal = grossSubtotal - specialPriceSavings - itemDiscountsTotal;
    if (value != null && value > itemsTotal) return;
    const percent =
      value != null && itemsTotal > 0
        ? Math.round((value / itemsTotal) * 100 * 100) / 100
        : undefined;
    setSaleDiscount({
      value: value ?? 0,
      percent,
      reason: saleDiscount?.reason,
    });
  };

  const handleSaleDiscountReasonChange = (reason: string) => {
    setSaleDiscount({
      value: saleDiscountValue,
      percent: saleDiscount?.percent,
      reason: reason.trim() || undefined,
    });
  };

  const handleRemoveSaleDiscount = () => {
    setSaleDiscount(undefined);
    setSaleDiscountExpanded(false);
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
    applyItemDiscount,
    removeItemDiscount,
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
    saleDiscount,
    specialPriceModalOpen,
    discountModalOpen,
    itemForDiscount,
    customerDetailsOpen,
    setCustomerDetailsOpen,
    saleDiscountExpanded,
    handleOpenSpecialPriceModal,
    handleApplySpecialPrice,
    handleRemoveSpecialPrice,
    handleOpenDiscountModal,
    handleApplyItemDiscount,
    handleRemoveItemDiscount,
    handleSaleDiscountPercentChange,
    handleSaleDiscountValueChange,
    handleSaleDiscountReasonChange,
    handleRemoveSaleDiscount,
    grossSubtotal,
    specialPriceSavings,
    itemDiscountsTotal,
    setSaleDiscountExpanded,
    saleDiscountValue,
    itemForSpecialPrice,
    setSpecialPriceModalOpen,
    setItemForSpecialPrice,
    setDiscountModalOpen,
    setItemForDiscount,
  };
}
