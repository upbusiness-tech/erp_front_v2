import { SubscriptionStatus } from "@/enums/subscription.enum";
import { DefaultIdModel } from "./base.model";

export interface SubscriptionModel extends DefaultIdModel {
  dueDate: string;
  status: SubscriptionStatus;
  referenceMonth: string;
  paidAt: string;
  internalReference: string;
  externalId: string;
  externalLink: string;
}
