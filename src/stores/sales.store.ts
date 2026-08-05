import { InternCustomerModel } from "@/model/internCustomer.model";
import { CartSaleItem, PaymentItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { create } from "zustand";

export enum EProductView {
  CARDS = 1,
  LIST = 2,
}

export const PRODUCT_VIEW_STORAGE_NAME = "productView";

export type OrderSteps = "items" | "payment";

interface SalesState {
  productsView: EProductView;
  setProductsView: (v: EProductView) => void;
  saleItems: CartSaleItem[];
  setSaleItems: (items: CartSaleItem[]) => void;
  payments: PaymentItem[];
  setPayments: (p: PaymentItem[]) => void;
  saleStep: OrderSteps;
  setSaleStep: (step: OrderSteps) => void;
  selectedCustomer: InternCustomerModel | undefined;
  setSelectedCustomer: (customer: InternCustomerModel | undefined) => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  productsView: localStorage.getItem(PRODUCT_VIEW_STORAGE_NAME)
    ? (localStorage.getItem(PRODUCT_VIEW_STORAGE_NAME) as unknown as EProductView)
    : EProductView.CARDS,
  saleItems: [],
  setProductsView: (v: EProductView) => {
    localStorage.setItem(PRODUCT_VIEW_STORAGE_NAME, v.toString());
    set({ productsView: v });
  },
  setSaleItems: (items) => {
    set({ saleItems: items });
  },
  payments: [],
  setPayments: (p: PaymentItem[]) => {
    set({ payments: p });
  },
  saleStep: "items",
  setSaleStep: (step) => {
    set({ saleStep: step });
  },
  selectedCustomer: undefined,
  setSelectedCustomer: (customer) => {
    const currentItems = get().saleItems;
    const hasSpecialPrices = currentItems.some((item) => item.isEspecialPrice);
    if (hasSpecialPrices && !customer) {
      set({
        selectedCustomer: customer,
        saleItems: currentItems.map((item) => ({
          ...item,
          isEspecialPrice: false,
          internCustomerPriceId: undefined,
          internCustomerPrice: undefined,
        })),
      });
    } else {
      set({ selectedCustomer: customer });
    }
  },
}));
