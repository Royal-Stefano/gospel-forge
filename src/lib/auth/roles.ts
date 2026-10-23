import type { UserRole, ArtistStatus } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  listener: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

export function canAccessStudio(
  role: UserRole | undefined | null,
  artistStatus?: ArtistStatus
): boolean {
  if (!role) return false;
  if (["admin", "super_admin", "editor"].includes(role)) return true;
  if (artistStatus === "approved") return true;
  return false;
}

export function canCreateDrafts(
  role: UserRole | undefined | null,
  artistStatus?: ArtistStatus
): boolean {
  if (!role) return false;
  if (["admin", "super_admin", "editor"].includes(role)) return true;
  if (artistStatus === "approved") return true;
  return false;
}

export function canPublishEpisodes(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return ["admin", "super_admin"].includes(role);
}

export function canManageUsers(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return ["admin", "super_admin"].includes(role);
}

export function canManageRoles(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return role === "super_admin";
}

export function canModerateCommunity(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return ["editor", "admin", "super_admin"].includes(role);
}
