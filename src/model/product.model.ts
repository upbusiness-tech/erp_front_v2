import { DefaultIdModel } from "./base.model";
import { ProductCategoryModel } from "./productCategory.model";
import { ProductEspecificationModel } from "./productEspecification.model";
import { ProductFiscalClassification } from "./productFiscalClassification.model";
import { SaleModel } from "./sale.model";
import { UserModel } from "./user.model";

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
  productEspecifications: ProductEspecificationModel[];
  productFiscalClassification: ProductFiscalClassification;
  createByUser: UserModel;
}

export interface ProductTransactionRecord extends DefaultIdModel {
  type: ProductTransactionType;
  value: number;
  saleId: number;
  sale: SaleModel;
  productEspecificationId: number;
  productEspecification: ProductEspecificationModel;
  createdByUserUid: string;
  createdByUser: UserModel;
}

export enum ProductTransactionType {
  PLUS = "Adição",
  SUBTRACTION = "Subtração",
}
