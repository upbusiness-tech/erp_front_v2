import { useAuthStore } from "@/stores/auth.store";
import { hasPermission } from "@/utils/permissions";

export function useHasPermission(permission: string): boolean {
  const { permissions } = useAuthStore();
  return hasPermission(permissions, permission);
}
