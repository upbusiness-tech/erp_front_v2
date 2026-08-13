import { BaseService } from "./common/base.service";

export class StatsDashboardService extends BaseService {
  constructor(subpath?: string) {
    super(`report${subpath ? `/${subpath}` : ""}`);
  }
}
