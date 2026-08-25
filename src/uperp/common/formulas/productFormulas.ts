import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";

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
) => {
  const total = calculeStockTotalByProductEspecification(variants);

  switch (product.unitOfMeasure) {
    case ProductUnitOfMeasure.GRAM:
      return `${total} kg`;
    case ProductUnitOfMeasure.LITER:
      return `${total} l`;
    case ProductUnitOfMeasure.METER:
      return `${total} m`;
    case ProductUnitOfMeasure.UNIT:
      return `${total} un.`;
    default:
      return "";
  }
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

export const calculateOrderItem = (item: CartSaleItem) => {
  const itemPrice = item.isEspecialPrice
    ? item.internCustomerPrice?.specialPrice
    : item.productEspecification.salePrice;

  const itemUnitSold = item.unitSold;

  const itemQuantitySold = item.quantitySold;

  return (itemPrice ?? 0) * itemUnitSold * itemQuantitySold;
};
