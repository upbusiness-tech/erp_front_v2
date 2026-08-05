import { BaseService } from "./common/base.service";

export class SaleService extends BaseService {
  constructor(subpath?: string) {
    super(`sale${subpath ? `/${subpath}` : ""}`);
  }
}
