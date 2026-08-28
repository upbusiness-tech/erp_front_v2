import { DefaultIdModel } from "./base.model";

export interface ProductCategoryModel extends DefaultIdModel {
  name: string;
  color?: string;
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
}
