import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  listPermissionCatalog,
  listRolePermissions,
  setRolePermission,
  type PermissionCatalogItem,
  type RolePermission,
} from '../../features/auth/services/adminAccountsRepository';
import { toUserFacingError } from '../../shared/utils/userFacingError';

function getErrorMessage(error: unknown, fallback: string) {
  return toUserFacingError(error, fallback);
}

const permissionLabels: Record<string, string> = {
  'identity:read:self': 'Consultar perfil propio',
  'identity:manage': 'Administrar accesos',
  'student:read:self': 'Consultar datos propios',
  'student:read:children': 'Consultar alumnos vinculados',
  'student:read:assigned': 'Consultar alumnos asignados',
  'guardian:link:manage': 'Administrar vínculos familiares',
  'permissions:manage': 'Administrar permisos',
  'reports:read': 'Consultar reportes',
  'academic:manage': 'Administrar información académica',
  'services:manage': 'Administrar servicios institucionales',
  'accounts:manage': 'Administrar cuentas y vínculos',
};

const roleLabels: Record<string, string> = {
  superadmin: 'Superadministrador',
  admin: 'Administrador',
  teacher: 'Docente',
  student: 'Alumno',
  guardian: 'Adulto responsable',
  parent: 'Familia',
};

export const PermisosPage: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialPermissions = async () => {
      setIsLoading(true);
      try {
        const [catalog, mappings] = await Promise.all([listPermissionCatalog(), listRolePermissions()]);
        setPermissions(catalog);
        setRolePermissions(mappings);
        setSelectedRole((current) => current || mappings[0]?.role_code || '');
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'No se pudieron cargar los permisos.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitialPermissions();
  }, []);

  const roles = useMemo(
    () => [...new Set(rolePermissions.map(({ role_code }) => role_code))].sort(),
    [rolePermissions],
  );
  const assignedCodes = useMemo(
    () => new Set(rolePermissions.filter(({ role_code }) => role_code === selectedRole).map(({ permission_code }) => permission_code)),
    [rolePermissions, selectedRole],
  );

  const handleToggle = async (permission: PermissionCatalogItem, enabled: boolean) => {
    if (!selectedRole) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingCode(permission.code);
    try {
      await setRolePermission(selectedRole, permission.code, enabled);
      setRolePermissions((current) => enabled
        ? [...current, { role_code: selectedRole, permission_code: permission.code }]
        : current.filter((mapping) => !(mapping.role_code === selectedRole && mapping.permission_code === permission.code)));
      setSuccessMessage(`Permiso ${enabled ? 'habilitado' : 'deshabilitado'} correctamente.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudo actualizar el permiso.'));
    } finally {
      setUpdatingCode(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span>
            <h1 className="mt-1 text-lg font-bold text-edu-primary">Permisos por rol</h1>
            <p className="mt-1 text-xs leading-relaxed text-edu-muted">Administrá las asignaciones existentes del catálogo de permisos.</p>
          </div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Rol
            <select
              aria-label="Rol para administrar permisos"
              value={selectedRole}
              onChange={(event) => { setSelectedRole(event.target.value); setSuccessMessage(null); }}
              disabled={isLoading || roles.length === 0}
              className="mt-1 block min-w-48 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-normal normal-case tracking-normal"
            >
              {roles.map((role) => <option key={role} value={role}>{roleLabels[role] ?? 'Rol institucional'}</option>)}
            </select>
          </label>
        </div>
      </section>

      {(errorMessage || successMessage) && (
        <div role="status" aria-live="polite" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${errorMessage ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {errorMessage ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          {errorMessage || successMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-edu-border/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <caption className="sr-only">Catálogo de permisos para el rol {selectedRole || 'seleccionado'}</caption>
            <thead className="border-b border-edu-border/70 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-edu-muted">
              <tr><th scope="col" className="px-5 py-3.5">Permiso</th><th scope="col" className="px-5 py-3.5">Descripción</th><th scope="col" className="px-5 py-3.5">Estado</th><th scope="col" className="px-5 py-3.5 text-right">Asignado</th></tr>
            </thead>
            <tbody className="divide-y divide-edu-border/60">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-edu-muted">Cargando permisos…</td></tr>
              ) : permissions.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-edu-muted">No hay permisos en el catálogo.</td></tr>
              ) : permissions.map((permission) => {
                const isAssigned = assignedCodes.has(permission.code);
                const isUpdating = updatingCode === permission.code;
                return (
                  <tr key={permission.code} className="hover:bg-slate-50/70">
                    <th scope="row" className="px-5 py-3.5 font-semibold text-slate-800">{permissionLabels[permission.code] ?? 'Permiso institucional'}</th>
                    <td className="px-5 py-3.5">{permissionLabels[permission.code] ?? 'Permiso configurado para este rol.'}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${permission.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{permission.is_active ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-5 py-3.5 text-right">
                      <label className="inline-flex items-center gap-2 font-semibold text-slate-700">
                        <span className="sr-only">{isAssigned ? 'Deshabilitar' : 'Habilitar'} {permission.code} para {selectedRole}</span>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          disabled={!selectedRole || isUpdating || (!permission.is_active && !isAssigned)}
                          onChange={(event) => void handleToggle(permission, event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-edu-secondary focus:ring-edu-secondary"
                        />
                        <span className="sr-only">{isUpdating ? 'Guardando…' : isAssigned ? 'Habilitado' : 'Deshabilitado'}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && permissions.length > 0 && (
          <p className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-[11px] text-edu-muted"><ShieldCheck size={14} />El servidor valida que solo un superadmin activo pueda modificar asignaciones.</p>
        )}
      </section>
    </div>
  );
};
