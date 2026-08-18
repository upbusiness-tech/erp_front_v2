import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthSession } from "@/contexts/auth-session.context";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isCompanyAuthenticated, isEmployeeAuthenticated, employeeLogout } = useAuthStore();
  const { authLoading } = useAuthSession();

  if (authLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }

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
