import { CsosnEnum, OriginEnum, PisCofinsCstEnum } from "@/enums/productFiscal.enum";

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
  productFiscalClassification?: IProductFiscalClassificationFields;
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

export interface IProductFiscalClassificationFields {
  id?: number;
  ncm: string;
  cfop: string;
  origin: OriginEnum;
  csosn: CsosnEnum;
  cest?: string;
  pis: PisCofinsCstEnum;
  cofins: PisCofinsCstEnum;
}
