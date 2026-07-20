import { DefaultUidModel } from "./base.model";
import { PermissionModel } from "./permission.model";

export interface EmployeeModel extends DefaultUidModel {
  name: string;
  type: string;
  isActive: boolean;
  isPrimaryEmployee: boolean;
  user: {
    username: string;
    permissions: Pick<PermissionModel, "id" | "key" | "title">[];
  };
}
