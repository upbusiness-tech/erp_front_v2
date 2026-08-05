import { useSalesStore } from "@/stores/sales.store";

export function useOrderProductItemController() {
  const { saleItems, setSaleItems } = useSalesStore();

  const removeSaleItem = (id: number) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const updateSaleItemQuantity = (id: number, quantitySold: number) => {
    setSaleItems(saleItems.map((item) => (item.id === id ? { ...item, quantitySold } : item)));
  };

  return {
    removeSaleItem,
    updateSaleItemQuantity,
  };
}
