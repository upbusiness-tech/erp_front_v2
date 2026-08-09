import { DefaultIdModel } from "./base.model";
import { CompanySettingModel } from "./companySetting.model";

export interface CompanySettingUsageModel extends DefaultIdModel {
  isActive: boolean;
  companyUid: string;
  companySetting: CompanySettingModel;
}
