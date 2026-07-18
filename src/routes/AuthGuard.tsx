import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isCompanyAuthenticated, isEmployeeAuthenticated, employeeLogout } = useAuthStore();

  if (isEmployeeAuthenticated && !isCompanyAuthenticated) {
    employeeLogout();
    return <Navigate to="/" replace />;
  }

  if (!isCompanyAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isEmployeeAuthenticated) {
    return <Navigate to="/entrar/funcionario" replace />;
  }

  return children;
}

export function CompanyAuthGuard({ children }: { children: ReactNode }) {
  const { isCompanyAuthenticated } = useAuthStore();

  if (isCompanyAuthenticated) {
    return <Navigate to="/entrar/funcionario" replace />;
  }

  return children;
}

export function EmployeeLoginGuard({ children }: { children: ReactNode }) {
  const { isCompanyAuthenticated } = useAuthStore();

  if (!isCompanyAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
