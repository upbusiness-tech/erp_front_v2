import { DefaultIdModel } from "./base.model";

export interface ProductCategoryModel extends DefaultIdModel {
  name: string;
  color?: string;
}
