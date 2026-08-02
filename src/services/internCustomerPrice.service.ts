import { BaseService } from "./common/base.service";

export class InternCustomerPriceService extends BaseService {
  constructor(subpath?: string) {
    super(`intern-customer-price${subpath ? `/${subpath}` : ""}`);
  }
}
