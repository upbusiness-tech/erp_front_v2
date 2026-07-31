import { api } from "@/config/axios.config";
import { BaseService } from "./common/base.service";
import { CashFlowModel } from "@/model/cashFlow.model";
import { ICloseCashFlowForm } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CloseCashFlowModal/types";

export class CashFlowService extends BaseService {
  constructor(subpath?: string) {
    super(`cash-flow${subpath ? `/${subpath}` : ""}`);
  }

  async getCashFlowOpen() {
    return await api.get<CashFlowModel>(`${this.BASE_PATH}/open`);
  }

  async closeCashFlow(data: ICloseCashFlowForm) {
    return await api.post<CashFlowModel>(`${this.BASE_PATH}/close`, data);
  }

  async openCashFlow(data: { initialBalance: number }) {
    return await api.post<CashFlowModel>(`${this.BASE_PATH}/open`, data);
  }
}
