import { getCookie } from "@/lib/cookie";
import { LoginPaths } from "@/routes/UnauthenticatedRoutes/Login/routes";
import { COMPANY_TOKEN_KEY, EMPLOYEE_TOKEN_KEY, useAuthStore } from "@/stores/auth.store";
import axios from "axios";
import { auth } from "./firebase.config";

// type RetriableConfig = InternalAxiosRequestConfig & { _retriedCompanyToken?: boolean };

const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const companyToken = (await auth.currentUser?.getIdToken()) ?? getCookie(COMPANY_TOKEN_KEY);
  const employeeToken = getCookie(EMPLOYEE_TOKEN_KEY);

  if (companyToken) {
    config.headers.set("x-company-token", companyToken);
  }
  if (employeeToken) {
    config.headers.Authorization = `Bearer ${employeeToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    // const originalConfig = error?.config as RetriableConfig | undefined;

    if (status === 401 && message === "Token funcionário inválido") {
      useAuthStore.getState().employeeLogout();

      if (window.location.pathname !== LoginPaths.EMPLOYEE_LOGIN) {
        window.location.assign(LoginPaths.EMPLOYEE_LOGIN);
      }

      return Promise.reject(error);
    }

    // if (status === 401 && originalConfig && !originalConfig._retriedCompanyToken) {
    //   try {
    //     const freshToken = auth.currentUser ? await auth.currentUser.getIdToken(true) : null;

    //     if (freshToken) {
    //       useAuthStore.getState().setCompanyToken(freshToken);
    //       originalConfig._retriedCompanyToken = true;
    //       originalConfig.headers.set("x-company-token", freshToken);

    //       return api(originalConfig);
    //     }
    //   } catch {
    //     // refresh falhou: sessão do Firebase morta, cai no logout abaixo
    //   }

    //   await useAuthStore.getState().logout();

    //   if (window.location.pathname !== "/") {
    //     window.location.assign("/");
    //   }
    // }

    return Promise.reject(error);
  },
);
