import { useSalesStore } from "@/stores/sales.store";
import { message } from "antd";

export function useOrderProductItemController() {
  const { saleItems, setSaleItems } = useSalesStore();

  const removeSaleItem = (id: number) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const updateSaleItemQuantity = (id: number, quantitySold: number) => {
    const itemToUpdate = saleItems.find((si) => si.id === id);
    if (itemToUpdate) {
      if (
        itemToUpdate.productEspecification.isStockControlled &&
        itemToUpdate.productEspecification.stockQuantity < quantitySold
      ) {
        message.warning("Sem estoque suficiente!");
        return;
      }
    }
    setSaleItems(saleItems.map((item) => (item.id === id ? { ...item, quantitySold } : item)));
  };

  return {
    removeSaleItem,
    updateSaleItemQuantity,
  };
}
