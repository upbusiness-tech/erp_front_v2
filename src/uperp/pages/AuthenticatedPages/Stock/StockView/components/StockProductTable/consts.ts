import { ProductUnitOfMeasure } from "../../../StockProduct/types";

export const STOCK_STATUS_OPTIONS = [
  { value: "out_of_stock", label: "Sem estoque" },
  { value: "low_stock", label: "Estoque baixo" },
  { value: "in_stock", label: "Estoque disponível" },
];

export const UNIT_OF_MEASURE_OPTIONS = Object.values(ProductUnitOfMeasure).map((u) => ({
  value: u,
  label: u,
}));
