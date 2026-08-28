import { api } from "@/config/axios.config";
import { BaseService } from "./common/base.service";

export class SaleService extends BaseService {
  constructor(subpath?: string) {
    super(`sale${subpath ? `/${subpath}` : ""}`);
  }

  async cancelSale(id: number) {
    return await api.patch(`${this.BASE_PATH}/cancel/${id}`);
  }
}
