import { DefaultIdModel } from "./base.model";

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
