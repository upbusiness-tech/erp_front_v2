import { DefaultIdModel } from "./base.model";

export interface CompanySettingModel extends DefaultIdModel {
  module: string;
  key: string;
  description: string;
  default: boolean;
  planId: number;
}
