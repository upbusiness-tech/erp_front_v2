import { BaseService } from "./common/base.service";

export class CashFlowTransactionService extends BaseService {
  constructor(subpath?: string) {
    super(`cash-flow-transaction${subpath ? `/${subpath}` : ""}`);
  }
}
