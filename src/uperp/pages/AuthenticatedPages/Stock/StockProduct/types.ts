export enum ProductUnitOfMeasure {
  GRAM = "Gramas",
  UNIT = "Unidade",
  METER = "Metro",
  LITER = "Litro",
}

export interface IProductCreateFields {
  name: string;
  unitOfMeasure: ProductUnitOfMeasure;
  productPicture: string;
  productCategoryId: number;
  variants: IProductVariantField[];
}

export interface IProductVariantField {
  id?: number;
  code: string;
  barcode?: string;
  salePrice: number;
  costPrice: number;
  isStockControlled: boolean;
  stockQuantity: number;
  size?: string;
  color?: string;
  brand?: string;
  productSupplierId?: number;
}
