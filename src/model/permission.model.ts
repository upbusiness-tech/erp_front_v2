import { DefaultIdModel } from "./base.model";

export interface PermissionModel extends DefaultIdModel {
  key: string;
  title: string;
  description: string;
  module: string;
}
