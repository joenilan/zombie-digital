import { UserLevel } from "@/types/database";

export type UserRole = "user" | "moderator" | "admin" | "owner";

const roleHierarchy: { [key in UserRole]: number } = {
  user: 1,
  moderator: 2,
  admin: 3,
  owner: 4,
};

export function hasPermission(
  userRole: string,
  requiredRole: UserRole
): boolean {
  // If no user role is provided, they have no permissions
  if (!userRole) return false;

  // Convert to lowercase for comparison
  const normalizedUserRole = userRole.toLowerCase() as UserRole;

  // If the role doesn't exist in our hierarchy, they don't have permission
  if (!roleHierarchy[normalizedUserRole]) return false;

  return roleHierarchy[normalizedUserRole] >= roleHierarchy[requiredRole];
}

export function canManageUsers(level: UserLevel): boolean {
  return hasPermission(level, "admin");
}

export function canModerateContent(level: UserLevel): boolean {
  return hasPermission(level, "moderator");
}

export function isOwner(level: UserLevel): boolean {
  return level === "owner";
}
