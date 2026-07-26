import { ProductEspecificationModel } from "@/model/productEspecification.model";

export const calculeStockTotalByProductEspecification = (
  variants: ProductEspecificationModel[],
) => {
  const total = variants.reduce((acc, value) => {
    if (value.isStockControlled) return acc + value.stockQuantity;
    return acc + 0;
  }, 0);
  return total || 0;
};

export const calculeSalePriceRange = (variants: ProductEspecificationModel[]): string => {
  if (!variants || variants.length === 0) return "R$ 0,00";

  const prices = variants.map((v) => v.salePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
};
