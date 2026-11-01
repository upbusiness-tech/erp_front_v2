import { DefaultIdModel } from "./base.model";
import { ProductSupplierModel } from "./productSupplier.model";
export interface ProductEspecificationModel extends DefaultIdModel {
  code: string;
  barcode: string;
  salePrice: number;
  costPrice: number;
  isStockControlled: boolean;
  stockQuantity: number;
  size: string | null;
  color: string | null;
  brand: string | null;
  productSupplierId?: number;
  productSupplier?: ProductSupplierModel;
}
