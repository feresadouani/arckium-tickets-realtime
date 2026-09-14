import { UserRole } from 'src/users/users.entity';

const CREATABLE_BY_ADMIN = [
  UserRole.admin,
  UserRole.responsable,
  UserRole.technicien,
];

/** Admin ou responsable : équipements, etc. */
export function canCreateUsers(role?: UserRole): boolean {
  return role === UserRole.admin || role === UserRole.responsable;
}

/** Gestion des comptes utilisateurs : admin uniquement */
export function canManageUsers(role?: UserRole): boolean {
  return role === UserRole.admin;
}

export function canAssignRole(
  creatorRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (creatorRole === UserRole.admin) {
    return CREATABLE_BY_ADMIN.includes(targetRole);
  }
  return false;
}
