import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";

export { calculateOrderItem } from "./unitPrice.ts";

export const calculeStockTotalByProductEspecification = (
  variants: ProductEspecificationModel[],
) => {
  const total = variants.reduce((acc, value) => {
    if (value.isStockControlled) return acc + value.stockQuantity;
    return acc + 0;
  }, 0);
  return total || 0;
};

export const showStockTotalByProductEspecification = (
  product: ProductModel,
  variants: ProductEspecificationModel[],
  stock?: number,
) => {
  if (stock !== undefined) return extractStockFormatByProduct(product, stock);
  const total = calculeStockTotalByProductEspecification(variants);

  return extractStockFormatByProduct(product, total);
};

export const formatNumberWithBrasilianFormat = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const extractStockFormatByUnit = (unitOfMeasure: string, value: number) => {
  switch (unitOfMeasure) {
    case ProductUnitOfMeasure.GRAM:
      return `${formatNumberWithBrasilianFormat(value)} kg`;
    case ProductUnitOfMeasure.LITER:
      return `${value.toFixed(3)} l`;
    case ProductUnitOfMeasure.METER:
      return `${value.toFixed(3)} m`;
    case ProductUnitOfMeasure.UNIT:
      return `${value} un.`;
    default:
      return "";
  }
};

export const extractStockFormatByProduct = (product: ProductModel, value: number) => {
  return extractStockFormatByUnit(product.unitOfMeasure, value);
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

export const formatPrice = (v: string | number) => {
  return `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
};
