import type { DemoUserRole } from '../types';

export type Permission =
  | 'enrollment:view'
  | 'enrollment:create'
  | 'enrollment:edit'
  | 'enrollment:delete'
  | 'enrollment:approve'
  | 'activities:view'
  | 'activities:create'
  | 'activities:edit'
  | 'activities:delete'
  | 'activities:enroll'
  | 'news:view'
  | 'news:create'
  | 'news:edit'
  | 'news:delete'
  | 'opinions:moderate'
  | 'opinions:delete'
  | 'opinions:submit'
  | 'comments:view'
  | 'comments:moderate'
  | 'forum:read'
  | 'forum:write'
  | 'users:view'
  | 'users:create'
  | 'dashboard:view';

const rolePermissions: Record<DemoUserRole, Permission[]> = {
  superadmin: [
    'enrollment:view',
    'enrollment:create',
    'enrollment:edit',
    'enrollment:delete',
    'enrollment:approve',
    'activities:view',
    'activities:create',
    'activities:edit',
    'activities:delete',
    'news:view',
    'news:create',
    'news:edit',
    'news:delete',
    'opinions:moderate',
    'opinions:delete',
    'comments:view',
    'comments:moderate',
    'forum:read',
    'users:view',
    'users:create',
    'dashboard:view',
  ],
  teacher: [
    'enrollment:view',
    'activities:view',
    'activities:enroll',
    'news:view',
    'opinions:submit',
    'comments:view',
    'forum:read',
    'forum:write',
    'dashboard:view',
  ],
  parent: [
    'enrollment:view',
    'activities:view',
    'news:view',
    'opinions:submit',
    'comments:view',
    'forum:read',
    'dashboard:view',
  ],
  student: [
    'activities:view',
    'activities:enroll',
    'news:view',
    'opinions:submit',
    'comments:view',
    'forum:read',
    'forum:write',
    'dashboard:view',
  ],
};

export function hasPermission(role: DemoUserRole | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function can(permission: Permission, role?: DemoUserRole | null): boolean {
  if (!role) return false;
  return hasPermission(role, permission);
}

export function getRolePermissions(role: DemoUserRole | null): Permission[] {
  if (!role) return [];
  return rolePermissions[role] ?? [];
}
