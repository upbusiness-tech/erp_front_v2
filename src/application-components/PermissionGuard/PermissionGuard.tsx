import { useHasPermission } from "@/hooks/useHasPermission";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
}

export function PermissionGuard({ children, permission }: PermissionGuardProps) {
  const hasAccess = useHasPermission(permission);

  if (!hasAccess) return <Navigate to="/acesso-bloqueado" replace />;

  return <>{children}</>;
}
