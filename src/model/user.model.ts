import { UserType } from "@/enums/user.enum";
import { DefaultUidModel } from "./base.model";
import { CompanyDetailModel } from "./company.model";
import { EmployeeModel } from "./employee.model";

export interface UserModel extends DefaultUidModel {
  email: string;
  username: string;
  password: string;
  type: UserType;
  companyUid: string;
  company: CompanyDetailModel;
  employeeUid: string;
  employee: EmployeeModel;
}
