import { api } from "@/config/axios.config";
import { BaseService } from "./common/base.service";

export interface SendSubscriptionProofDto {
  paymentProofUrl: string;
}

export class SubscriptionService extends BaseService {
  public BASE_PATH: string = "subscription";

  async sendProof(id: number, data: SendSubscriptionProofDto) {
    return await api.post(`${this.BASE_PATH}/${id}/send-proof`, data);
  }
}
