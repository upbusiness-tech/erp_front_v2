import { api } from "@/config/axios.config";
import { BaseService } from "./common/base.service";

export interface SendInvoiceProofDto {
  paymentProofUrl: string;
}

export class InvoiceService extends BaseService {
  public BASE_PATH: string = "invoice";

  async sendProof(id: number, data: SendInvoiceProofDto) {
    return await api.post(`${this.BASE_PATH}/${id}/send-proof`, data);
  }
}
