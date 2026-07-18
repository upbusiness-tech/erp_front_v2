import { api } from "@/config/axios.config";
import { useAuthStore } from "@/stores/auth.store";
import { BaseService } from "./common/base.service";

export interface LoginCompanyRB {
  email: string;
  password: string;
}

export interface LoginEmployeeRB {
  username: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  accessToken: string;
  permissions: string[];
}

export interface EmployeeLoginResponse extends LoginResponse {
  username: string;
}

export interface AvaliableEmployee {
  username: string;
  employee: {
    name: string;
    type: string;
  };
}

export class AuthService extends BaseService {
  constructor() {
    super("auth");
  }

  async loginCompany(requestBody: LoginCompanyRB) {
    const response = await api.post<LoginResponse>(`${this.BASE_PATH}/login/company`, requestBody);

    const { accessToken, name } = response.data;
    useAuthStore.getState().login(accessToken, name);

    return response;
  }

  async loginEmployee(requestBody: LoginEmployeeRB) {
    const response = await api.post<EmployeeLoginResponse>(
      `${this.BASE_PATH}/login/employee`,
      requestBody,
    );

    useAuthStore.getState().setEmployee(response.data);

    return response;
  }

  async getAvaliableEmployees() {
    const data = (await api.get<AvaliableEmployee[]>(`${this.BASE_PATH}/avaliable-employees`)).data;
    return data;
  }
}
