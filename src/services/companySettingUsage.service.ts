import { BaseService } from "./common/base.service";

export class CompanySettingUsageService extends BaseService {
  constructor(subpath?: string) {
    super(`company-setting-usage${subpath ? `/${subpath}` : ""}`);
  }
}
