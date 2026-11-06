import { InternCustomerModel } from "@/model/internCustomer.model";
import {
  CartSaleItem,
  DiscountInfo,
  ISaleServiceForm,
  IsolatedCustomerForm,
  PaymentItem,
} from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
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
  saleServices: ISaleServiceForm[];
  setSaleServices: (services: ISaleServiceForm[]) => void;
  addSaleService: (service: ISaleServiceForm) => void;
  removeSaleService: (index: number) => void;
  payments: PaymentItem[];
  setPayments: (p: PaymentItem[]) => void;
  resetSale: () => void;
  saleStep: OrderSteps;
  setSaleStep: (step: OrderSteps) => void;
  selectedCustomer: InternCustomerModel | undefined;
  setSelectedCustomer: (customer: InternCustomerModel | undefined) => void;
  isolatedCustomer?: IsolatedCustomerForm;
  setIsolatedCustomer: (customer: IsolatedCustomerForm | undefined) => void;
  saleDiscount?: DiscountInfo;
  setSaleDiscount: (d: DiscountInfo | undefined) => void;
}

const clearCustomerTablePrice = (item: CartSaleItem): CartSaleItem => ({
  ...item,
  isEspecialPrice: false,
  internCustomerPriceId: undefined,
  internCustomerPrice: undefined,
});

const clearNegotiatedPrice = (item: CartSaleItem): CartSaleItem => ({
  ...item,
  specialPrice: undefined,
});

export const useSalesStore = create<SalesState>((set, get) => ({
  productsView: localStorage.getItem(PRODUCT_VIEW_STORAGE_NAME)
    ? (localStorage.getItem(PRODUCT_VIEW_STORAGE_NAME) as unknown as EProductView)
    : EProductView.CARDS,
  saleItems: [],
  saleServices: [],
  setProductsView: (v: EProductView) => {
    localStorage.setItem(PRODUCT_VIEW_STORAGE_NAME, v.toString());
    set({ productsView: v });
  },
  setSaleItems: (items) => {
    set({ saleItems: items });
  },
  setSaleServices: (services) => set({ saleServices: services }),
  addSaleService: (service) => set((state) => ({ saleServices: [...state.saleServices, service] })),
  removeSaleService: (index) =>
    set((state) => ({
      saleServices: state.saleServices.filter((_, i) => i !== index),
    })),
  payments: [],
  setPayments: (p: PaymentItem[]) => {
    set({ payments: p });
  },
  resetSale: () => {
    set({
      saleItems: [],
      saleServices: [],
      payments: [],
      selectedCustomer: undefined,
      isolatedCustomer: undefined,
      saleStep: "items",
      saleDiscount: undefined,
    });
  },
  saleStep: "items",
  setSaleStep: (step) => {
    set({ saleStep: step });
  },
  selectedCustomer: undefined,
  setSelectedCustomer: (customer) => {
    const currentItems = get().saleItems;
    if (customer) {
      set({
        selectedCustomer: customer,
        isolatedCustomer: undefined,
        saleItems: currentItems.map(clearNegotiatedPrice),
      });
      return;
    }

    set({
      selectedCustomer: undefined,
      saleItems: currentItems.map(clearCustomerTablePrice),
    });
  },
  isolatedCustomer: undefined,
  setIsolatedCustomer: (customer) => {
    const currentItems = get().saleItems;
    set({
      isolatedCustomer: customer,
      selectedCustomer: undefined,
      saleItems: currentItems.map(clearCustomerTablePrice),
    });
  },
  saleDiscount: undefined,
  setSaleDiscount: (d) => {
    set({ saleDiscount: d });
  },
}));
