const ADMIN_PERMISSION = "admin_full_access";

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes(ADMIN_PERMISSION)) return true;
  return userPermissions.includes(requiredPermission);
}
