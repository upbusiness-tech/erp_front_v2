import { api } from "@/config/axios.config";
import { BaseService } from "./common/base.service";
import { PlanModel } from "@/model/plan.model";

export class PlanService extends BaseService {
  public BASE_PATH: string = "plan";

  async getMyPlan() {
    const plan = await api.get<PlanModel>(`${this.BASE_PATH}/me`);
    return plan.data;
  }
}
