import { PaymentMethod } from "@/enums/payment.enum";
import { SaleStatus, SaleType } from "@/enums/sale.enum";
import { DefaultIdModel } from "./base.model";
import { InternCustomerSpecialPriceModel } from "./internCustomerPrice.model";
import { ProductEspecificationModel } from "./productEspecification.model";
import { ProductModel } from "./product.model";
import { UserModel } from "./user.model";

export type ApiMoney = string | number | null;

export type SaleProductModel = Pick<ProductModel, "id" | "name" | "unitOfMeasure"> & {
  productPicture?: string | null;
};

export type SaleProductSpecificationModel = Omit<
  ProductEspecificationModel,
  "salePrice" | "costPrice" | "stockQuantity"
> & {
  salePrice: ApiMoney;
  costPrice: ApiMoney;
  stockQuantity: number;
};

export type SaleSpecialPriceModel = Pick<
  InternCustomerSpecialPriceModel,
  "id" | "internCustomerId" | "productEspecificationId"
> & {
  specialPrice: ApiMoney;
};

export interface SaleItemModel extends DefaultIdModel {
  note: string;
  quantitySold: number;
  isEspecialPrice: boolean;
  discountPrice?: ApiMoney;
  internCustomerPriceId?: number | null;
  internCustomerPrice?: SaleSpecialPriceModel | null;
  productId: number;
  product: SaleProductModel;
  productEspecificationId: number;
  productEspecification: SaleProductSpecificationModel;
}

export interface SalePaymentModel extends DefaultIdModel {
  type: PaymentMethod;
  amount: ApiMoney;
}

export type SaleCustomerModel = Pick<
  NonNullable<import("./internCustomer.model").InternCustomerModel>,
  "id" | "name" | "phoneNumber"
>;

export type SaleUserModel = Pick<UserModel, "uid" | "username">;

export interface SaleModel extends DefaultIdModel {
  code: string;
  type: SaleType;
  status: SaleStatus;
  canceledAt?: string | null;
  internCustomerId?: number | null;
  internCustomer?: SaleCustomerModel | null;
  soldByUserUid?: string | null;
  soldByUser?: SaleUserModel | null;
  cashFlowId: number;
  companyUid: string;
  items: SaleItemModel[];
  payments: SalePaymentModel[];
  services?: unknown[];
}

export interface SaleReceiptItemModel {
  id: number;
  name: string;
  quantity: number;
  originalUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
  hasSpecialPrice: boolean;
  size?: string;
  color?: string;
  brand?: string;
  unitOfMeasure?: string;
  note?: string;
}

export interface SaleReceiptPaymentModel {
  id: number;
  type: PaymentMethod;
  amount: number;
}

export interface SaleReceiptModel {
  sale: SaleModel;
  code: string;
  date: string;
  customerName: string;
  items: SaleReceiptItemModel[];
  payments: SaleReceiptPaymentModel[];
  subtotal: number;
  specialPriceTotal: number;
  paid: number;
  change: number;
}
