import { BaseService } from "./common/base.service";

export class InternCustomerService extends BaseService {
  constructor(subpath?: string) {
    super(`intern-customer${subpath ? `/${subpath}` : ""}`);
  }
}
