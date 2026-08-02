import { DefaultIdModel } from "./base.model";
import { ProductModel } from "./product.model";

export interface ProductEspecificationModel extends DefaultIdModel {
  code: string;
  salePrice: number;
  costPrice: number;
  isStockControlled: boolean;
  stockQuantity: number;
  size: string;
  color: string;
  brand: string;
}
