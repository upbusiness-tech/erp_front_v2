import { CsosnEnum, OriginEnum, PisCofinsCstEnum } from "@/enums/productFiscal.enum";
import { DefaultIdModel } from "./base.model";

export interface ProductFiscalClassification extends DefaultIdModel {
  ncm: string;
  cfop: string;
  origin: OriginEnum;
  csosn: CsosnEnum;
  cest?: string;
  pis: PisCofinsCstEnum;
  cofins: PisCofinsCstEnum;
}
