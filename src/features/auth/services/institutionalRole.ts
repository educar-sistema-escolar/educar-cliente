export function resolveInstitutionalRole(role: string): 'superadmin' | 'student' | 'parent' | 'teacher' | null {
  if (role === 'guardian') return 'parent';
  if (role === 'superadmin' || role === 'student' || role === 'parent' || role === 'teacher') return role;
  return null;
}
