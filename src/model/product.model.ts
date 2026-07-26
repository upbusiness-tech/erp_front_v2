import { DefaultIdModel } from "./base.model";
import { ProductCategoryModel } from "./productCategory.model";
import { ProductEspecificationModel } from "./productEspecification.model";

export interface ProductExpandedViewModel extends DefaultIdModel {
  name: string;
  productCategoryId: number;
  productCategoryName: string;
  unitOfMeasure: string;
  code: string;
  size: string;
  color: string;
  salePrice: number;
  costPrice: number;
  stockQuantity: number;
}

export interface ProductModel extends DefaultIdModel {
  name: string;
  productCategoryId: number;
  productCategory: ProductCategoryModel;
  unitOfMeasure: string;
  createByUserUid: string;
  productPicture: string;
  supplierName: string;
  productEspecifications: ProductEspecificationModel[];
}
