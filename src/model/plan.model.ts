import { PlanStatus } from "@/enums/plan.enum";
import { DefaultIdModel } from "./base.model";

export interface PlanModel extends DefaultIdModel {
  name: string;
  price: number;
  description: string;
  status: PlanStatus;
}
