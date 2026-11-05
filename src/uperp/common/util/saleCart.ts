import type { ProductModel } from "@/model/product.model";
import type { ProductEspecificationModel } from "@/model/productEspecification.model";
import type { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";

export const getCartQuantityBySpecification = (
  saleItems: CartSaleItem[],
  productEspecificationId: number,
): number =>
  saleItems
    .filter((item) => item.productEspecificationId === productEspecificationId)
    .reduce((total, item) => total + item.quantitySold * item.unitSold, 0);

export const isQuantityAvailableForSale = (
  specification: ProductEspecificationModel,
  saleItems: CartSaleItem[],
  requestedQuantity: number,
): boolean =>
  !specification.isStockControlled ||
  getCartQuantityBySpecification(saleItems, specification.id) + requestedQuantity <=
    specification.stockQuantity;

export const buildScannedCartItem = (
  product: ProductModel,
  specification: ProductEspecificationModel,
): CartSaleItem => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  isEspecialPrice: false,
  productEspecificationId: specification.id,
  productId: product.id,
  quantitySold: 1,
  product,
  productEspecification: specification,
  unitSold: 1,
  unitOfMeasure: product.unitOfMeasure,
});
