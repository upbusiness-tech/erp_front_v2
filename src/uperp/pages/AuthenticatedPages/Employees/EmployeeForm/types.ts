export interface IEmployeeCreateForm {
  name: string;
  password: string;
  type: string;
  isActive: boolean;
  permissions: number[];
}
