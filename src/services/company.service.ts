import { ICompanyUpdateForm } from "@/uperp/pages/AuthenticatedPages/Company/CompanyView/types";
import { BaseService } from "./common/base.service";
import { api } from "@/config/axios.config";

export class CompanyService extends BaseService {
  constructor(subpath?: string) {
    super(`company${subpath ? `/${subpath}` : ""}`);
  }

  async updateMe(data: ICompanyUpdateForm) {
    return await api.patch(this.BASE_PATH, data);
  }
}
