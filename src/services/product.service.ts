import { BaseService } from "./common/base.service";

export class ProductService extends BaseService {
  constructor(subpath?: string) {
    super(`product${subpath ? `/${subpath}` : ""}`);
  }
}
