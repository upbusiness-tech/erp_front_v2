import { DefaultIdModel } from "./base.model";
import { InternCustomerModel } from "./internCustomer.model";
import { ProductModel } from "./product.model";
import { ProductEspecificationModel } from "./productEspecification.model";

export interface InternCustomerSpecialPriceModel extends DefaultIdModel {
  specialPrice: number;
  internCustomerId: number;
  internCustomer: InternCustomerModel;
  productEspecificationId: number;
  productEspecification: ProductEspecificationModel & { product: ProductModel };
}
