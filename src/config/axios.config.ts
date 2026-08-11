import { getCookie } from "@/lib/cookie";
import { COMPANY_TOKEN_KEY, EMPLOYEE_TOKEN_KEY } from "@/stores/auth.store";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const companyToken = getCookie(COMPANY_TOKEN_KEY);
  const employeeToken = getCookie(EMPLOYEE_TOKEN_KEY);

  if (companyToken) {
    config.headers.set("x-company-token", companyToken);
  }
  if (employeeToken) {
    config.headers.Authorization = `Bearer ${employeeToken}`;
  }

  return config;
});

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout();
//       window.location.href = "/";
//     }
//     return Promise.reject(error);
//   },
// );
