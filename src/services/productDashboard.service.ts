import { BaseService } from "./common/base.service";

export class ProductDashboardService extends BaseService {
  constructor(subpath?: string) {
    super(`report${subpath ? `/${subpath}` : ""}`);
  }
}
