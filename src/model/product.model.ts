import { DefaultIdModel } from "./base.model";
import { ProductCategoryModel } from "./productCategory.model";
import { ProductEspecificationModel } from "./productEspecification.model";
import { ProductFiscalClassification } from "./productFiscalClassification.model";
import { SaleModel } from "./sale.model";
import { UserModel } from "./user.model";

export interface ProductExpandedViewModel {
  companyUid: string;
  productId: number;
  productName: string;
  productEspecificationId: number;
  unitOfMeasure: string;
  productCategoryId: number;
  productCategoryName: string;
  code: string;
  size: string;
  color: string;
  barcode: string;
  brand: string;
  salePrice: number;
  costPrice: number;
  stockQuantity: number;
  isStockControlled: boolean;
  productPicture: string;
  createdAt: string;
  createdByUserEmployeeName: string;
  supplierName: string;
  productCategoryColor: string;
  productSupplierId: number;
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

export interface GalleryModel extends DefaultIdModel {
  productPicture: string;
  companyUid: string;
  createdAt?: string;
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
