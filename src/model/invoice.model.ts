import { InvoiceStatus } from "@/enums/invoice.enum";
import { DefaultIdModel } from "./base.model";

export interface InvoiceModel extends DefaultIdModel {
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string;
  paymentProofUrl: string;
}
