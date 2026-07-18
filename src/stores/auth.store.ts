import { create } from "zustand";
import { getCookie, setCookie, removeCookie } from "@/lib/cookie";
import type { EmployeeLoginResponse } from "@/services/auth.service";

export const COMPANY_TOKEN_KEY = "company-token";
const COMPANY_NAME_KEY = "company-name";
const EMPLOYEE_USERNAME_KEY = "employee-username";
const EMPLOYEE_NAME_KEY = "employee-name";
export const EMPLOYEE_TOKEN_KEY = "employee-token";
const EMPLOYEE_PERMISSIONS_KEY = "employee-permissions";

function readCookies() {
  const companyToken = getCookie(COMPANY_TOKEN_KEY);
  const companyName = getCookie(COMPANY_NAME_KEY);
  const employeeToken = getCookie(EMPLOYEE_TOKEN_KEY);
  const employeeName = getCookie(EMPLOYEE_NAME_KEY);
  const permissionsRaw = getCookie(EMPLOYEE_PERMISSIONS_KEY);
  const permissions = permissionsRaw ? (JSON.parse(permissionsRaw) as string[]) : [];

  return { companyToken, companyName, employeeToken, employeeName, permissions };
}

const initial = readCookies();

interface AuthState {
  companyToken: string | null;
  employeeToken: string | null;
  permissions: string[];
  employeeName: string | null;
  companyName: string | null;
  isCompanyAuthenticated: boolean;
  isEmployeeAuthenticated: boolean;
  hasCredentials: boolean;
  login: (token: string, companyName: string) => void;
  setEmployee: (response: EmployeeLoginResponse) => void;
  logout: () => void;
  employeeLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  companyToken: initial.companyToken,
  employeeToken: initial.employeeToken,
  permissions: initial.permissions,
  employeeName: initial.employeeName,
  companyName: initial.companyName,
  isCompanyAuthenticated: !!initial.companyToken,
  isEmployeeAuthenticated: !!initial.employeeToken,
  hasCredentials: !!initial.companyToken && !!initial.employeeToken,

  login: (companyToken, companyName = "") => {
    setCookie(COMPANY_TOKEN_KEY, companyToken);
    setCookie(COMPANY_NAME_KEY, companyName);

    set({
      companyToken,
      companyName,
      employeeToken: null,
      employeeName: null,
      permissions: [],
      isCompanyAuthenticated: true,
      isEmployeeAuthenticated: false,
      hasCredentials: false,
    });
  },

  setEmployee: (response) => {
    setCookie(EMPLOYEE_NAME_KEY, response.name);
    setCookie(EMPLOYEE_TOKEN_KEY, response.accessToken);
    setCookie(EMPLOYEE_PERMISSIONS_KEY, JSON.stringify(response.permissions));

    removeCookie(EMPLOYEE_USERNAME_KEY);

    set({
      employeeName: response.name,
      employeeToken: response.accessToken,
      permissions: response.permissions,
      isEmployeeAuthenticated: true,
      hasCredentials: true,
    });
  },

  logout: () => {
    removeCookie(COMPANY_TOKEN_KEY);
    removeCookie(COMPANY_NAME_KEY);
    removeCookie(EMPLOYEE_PERMISSIONS_KEY);
    removeCookie(EMPLOYEE_NAME_KEY);
    removeCookie(EMPLOYEE_TOKEN_KEY);
    removeCookie(EMPLOYEE_USERNAME_KEY);

    set({
      companyToken: null,
      employeeToken: null,
      permissions: [],
      employeeName: null,
      companyName: null,
      isCompanyAuthenticated: false,
      isEmployeeAuthenticated: false,
      hasCredentials: false,
    });
  },

  employeeLogout: () => {
    removeCookie(EMPLOYEE_PERMISSIONS_KEY);
    removeCookie(EMPLOYEE_NAME_KEY);
    removeCookie(EMPLOYEE_TOKEN_KEY);
    removeCookie(EMPLOYEE_USERNAME_KEY);

    set({
      employeeToken: null,
      permissions: [],
      employeeName: null,
      isEmployeeAuthenticated: false,
      hasCredentials: false,
    });
  },
}));
