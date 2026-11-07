export type UnitPriceItem = {
  specialPrice?: number | null;
  internCustomerPrice?: { specialPrice?: number | null } | null;
  specialPriceSnapshot?: number | null;
  productEspecification?: { salePrice?: string | number | null } | null;
  productSnapshot?: { salePrice?: string | number | null } | null;
  quantitySold?: number | null;
  unitSold?: number | null;
};

const toPositiveNumber = (value: string | number | null | undefined) => {
  if (value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const getItemCatalogPrice = (item: UnitPriceItem): number => {
  const specification = item.productSnapshot ?? item.productEspecification;
  return Number(specification?.salePrice ?? 0);
};

export const getItemSpecialPrice = (item: UnitPriceItem): number | undefined =>
  toPositiveNumber(item.specialPrice) ??
  toPositiveNumber(item.internCustomerPrice?.specialPrice) ??
  toPositiveNumber(item.specialPriceSnapshot);

export const resolveItemUnitPrice = (item: UnitPriceItem): number =>
  getItemSpecialPrice(item) ?? getItemCatalogPrice(item);

export const calculateOrderItem = (item: UnitPriceItem): number =>
  resolveItemUnitPrice(item) * Number(item.unitSold ?? 0) * Number(item.quantitySold ?? 0);

export const calculateItemSpecialPriceSavings = (item: UnitPriceItem): number => {
  const specialPrice = getItemSpecialPrice(item);
  if (specialPrice == null) return 0;

  const difference = getItemCatalogPrice(item) - specialPrice;
  return difference * Number(item.unitSold ?? 0) * Number(item.quantitySold ?? 0);
};

export const calculateSpecialPriceSavings = (items: UnitPriceItem[]): number =>
  items.reduce((total, item) => total + calculateItemSpecialPriceSavings(item), 0);
