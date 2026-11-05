export type VariationLike = {
  id?: number;
  code?: string | null;
  size?: string | null;
  color?: string | null;
  brand?: string | null;
  isStockControlled?: boolean;
  stockQuantity?: number;
};

export const getVariationParts = (spec: VariationLike) => {
  const parts: { size?: string; color?: string; brand?: string } = {};

  if (spec.size) parts.size = spec.size;
  if (spec.color) parts.color = spec.color;
  if (spec.brand) parts.brand = spec.brand;

  return parts;
};

export const getVariationLabel = (spec: VariationLike) => {
  const parts = getVariationParts(spec);
  const label = [parts.size, parts.color, parts.brand].filter(Boolean).join(" · ");

  return label || spec.code || (spec.id !== undefined ? `#${spec.id}` : "");
};

export const isVariationSellable = (spec: VariationLike) =>
  !spec.isStockControlled || (spec.stockQuantity ?? 0) > 0;
