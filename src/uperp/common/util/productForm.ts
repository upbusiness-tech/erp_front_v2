import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";

export const priceSuffixMap: Partial<Record<ProductUnitOfMeasure, string>> = {
  [ProductUnitOfMeasure.GRAM]: "Por kg",
  [ProductUnitOfMeasure.METER]: "Por metro",
  [ProductUnitOfMeasure.LITER]: "Por litro",
};
export const priceSuffix = (unitOfMeasure: ProductUnitOfMeasure) => {
  return (unitOfMeasure && priceSuffixMap[unitOfMeasure]) || "Unidade";
};

export const stockFormatMap: Partial<
  Record<ProductUnitOfMeasure, { precision: number; suffix: string; placeholder: string }>
> = {
  [ProductUnitOfMeasure.GRAM]: { precision: 3, suffix: "g", placeholder: "0,000g" },
  [ProductUnitOfMeasure.METER]: { precision: 2, suffix: "cm", placeholder: "0,00cm" },
  [ProductUnitOfMeasure.LITER]: { precision: 2, suffix: "ml", placeholder: "0,00ml" },
};
export const productUnitFormat = (unitOfMeasure: ProductUnitOfMeasure) =>
  (unitOfMeasure && stockFormatMap[unitOfMeasure]) || null;
