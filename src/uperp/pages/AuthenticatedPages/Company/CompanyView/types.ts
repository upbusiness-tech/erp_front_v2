import { CompanyDetailModel } from "@/model/company.model";

export type ICompanyUpdateForm = Pick<
  CompanyDetailModel,
  "name" | "profilePicture" | "contactPhoneNumber" | "contactEmail" | "description" | "address"
>;
