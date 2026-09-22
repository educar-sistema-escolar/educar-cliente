import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Mail, ShieldCheck, User, UserPlus, X } from 'lucide-react';
import {
  inviteAdminAccount,
  linkGuardianToStudent,
  listAdminAccounts,
  updateAdminAccount,
  type AdminAccount,
  type AdminAccountRole,
} from '../../features/auth/services/adminAccountsRepository';
import { listStudents } from '../../features/admin/services/academicRepository';
import type { Student } from '../../features/admin/types';
import { toUserFacingError } from '../../shared/utils/userFacingError';

const roleLabels: Record<AdminAccountRole, string> = {
  student: 'Alumno',
  teacher: 'Docente',
  parent: 'Familia',
  guardian: 'Adulto responsable',
  superadmin: 'Superadministrador',
};

const roleOptions = Object.entries(roleLabels) as [AdminAccountRole, string][];

function getErrorMessage(error: unknown, fallback: string) {
  return toUserFacingError(error, fallback);
}

export const CuentasDelSistemaPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', role: '' as '' | AdminAccountRole });
  const [guardianForm, setGuardianForm] = useState({ guardianProfileId: '', studentId: '', relationshipType: '', isPrimary: false });
  const [isLinking, setIsLinking] = useState(false);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextAccounts, nextStudents] = await Promise.all([listAdminAccounts(), listStudents()]);
      setAccounts(nextAccounts);
      setStudents(nextStudents);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudieron cargar las cuentas.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialAccounts = async () => {
      setIsLoading(true);
      try {
        const [nextAccounts, nextStudents] = await Promise.all([listAdminAccounts(), listStudents()]);
        setAccounts(nextAccounts);
        setStudents(nextStudents);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'No se pudieron cargar las cuentas.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitialAccounts();
  }, []);

  const resetForm = () => {
    setFormData({ full_name: '', email: '', role: '' });
    setShowCreateModal(false);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.role) {
      setErrorMessage('Nombre, correo y rol son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await inviteAdminAccount({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      });
      resetForm();
      setSuccessMessage(result.invited ? 'Invitación enviada correctamente.' : 'La cuenta ya existía y quedó vinculada correctamente.');
      await loadAccounts();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudo crear la cuenta.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (account: AdminAccount, role: AdminAccountRole) => {
    if (role === account.role || !window.confirm(`¿Cambiar el rol de ${account.email}?`)) return;
    try {
      await updateAdminAccount(account.id, { role, is_active: account.is_active, account_status: account.account_status });
      setSuccessMessage('Rol actualizado correctamente.');
      await loadAccounts();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudo actualizar el rol.'));
    }
  };

  const handleActiveChange = async (account: AdminAccount) => {
    const nextState = !account.is_active;
    if (!window.confirm(`${nextState ? '¿Activar' : '¿Desactivar'} ${account.email}?`)) return;
    try {
      await updateAdminAccount(account.id, { role: account.role, is_active: nextState, account_status: nextState ? 'active' : 'inactive' });
      setSuccessMessage(nextState ? 'Cuenta activada.' : 'Cuenta desactivada.');
      await loadAccounts();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudo actualizar el estado.'));
    }
  };

  const handleGuardianLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!guardianForm.guardianProfileId || !guardianForm.studentId || guardianForm.relationshipType.trim().length < 2) {
      setErrorMessage('Adulto responsable, alumno y vínculo son obligatorios.');
      return;
    }

    setIsLinking(true);
    try {
      await linkGuardianToStudent({
        studentId: guardianForm.studentId,
        guardianProfileId: guardianForm.guardianProfileId,
        relationshipType: guardianForm.relationshipType.trim(),
        isPrimary: guardianForm.isPrimary,
      });
      setGuardianForm({ guardianProfileId: '', studentId: '', relationshipType: '', isPrimary: false });
      setSuccessMessage('Vínculo familiar guardado correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'No se pudo vincular el adulto responsable.'));
    } finally {
      setIsLinking(false);
    }
  };

  const activeCount = accounts.filter((account) => account.is_active).length;
  const inactiveCount = accounts.length - activeCount;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span>
            <h1 className="mt-1 text-lg font-bold text-edu-primary">Cuentas del sistema</h1>
            <p className="mt-1 text-xs leading-relaxed text-edu-muted">
              Invitá usuarios y asignales un rol. La contraseña se configura desde el correo de invitación.
            </p>
          </div>
          <button type="button" onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-edu-secondary px-4 py-2.5 text-xs font-bold text-white shadow-sm">
            <UserPlus size={15} />
            Crear usuario
          </button>
        </div>
        <div className="mt-4 flex gap-3 text-xs text-edu-muted">
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">Activas: {activeCount}</span>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">Inactivas: {inactiveCount}</span>
        </div>
      </section>

      {(errorMessage || successMessage) && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${errorMessage ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {errorMessage ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          {errorMessage || successMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-edu-border/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-edu-border/70 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-edu-muted">
              <tr><th className="px-5 py-3.5">Usuario</th><th className="px-5 py-3.5">Rol</th><th className="px-5 py-3.5">Estado</th><th className="px-5 py-3.5">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-edu-border/60">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-edu-muted">Cargando cuentas…</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-edu-muted">No hay cuentas registradas.</td></tr>
              ) : accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-edu-secondary/10 text-edu-secondary"><User size={14} /></div>
                      <div><div className="text-sm font-semibold text-slate-800">{account.full_name || 'Sin nombre'}</div><div className="flex items-center gap-1 text-[11px] text-edu-muted"><Mail size={10} />{account.email}</div></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><select aria-label={`Rol de ${account.email}`} value={account.role} onChange={(event) => void handleRoleChange(account, event.target.value as AdminAccountRole)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs">{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${account.is_active ? 'border border-emerald-200/50 bg-emerald-50 text-emerald-700' : 'border border-slate-200 bg-slate-100 text-slate-600'}`}>{account.is_active ? <ShieldCheck className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{account.is_active ? account.account_status === 'invited' ? 'Invitada' : 'Activa' : 'Inactiva'}</span></td>
                  <td className="px-5 py-3.5"><button type="button" onClick={() => void handleActiveChange(account)} className="text-[11px] font-semibold text-edu-secondary hover:underline">{account.is_active ? 'Desactivar' : 'Activar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Relaciones</span>
          <h2 className="mt-1 text-base font-bold text-edu-primary">Vincular adulto responsable y alumno</h2>
          <p className="mt-1 text-xs leading-relaxed text-edu-muted">El servidor valida que el perfil tenga rol de familia y que el alumno esté activo.</p>
        </div>
        <form onSubmit={handleGuardianLink} className="mt-4 grid gap-3 md:grid-cols-4 md:items-end">
          <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">Adulto responsable<select required value={guardianForm.guardianProfileId} onChange={(event) => setGuardianForm((current) => ({ ...current, guardianProfileId: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-normal normal-case tracking-normal"><option value="">Seleccionar</option>{accounts.filter((account) => account.role === 'guardian' || account.role === 'parent').map((account) => <option key={account.id} value={account.id}>{account.full_name || account.email}</option>)}</select></label>
          <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">Alumno<select required value={guardianForm.studentId} onChange={(event) => setGuardianForm((current) => ({ ...current, studentId: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-normal normal-case tracking-normal"><option value="">Seleccionar</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person.first_name} {student.person.last_name}</option>)}</select></label>
          <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">Vínculo<input required value={guardianForm.relationshipType} onChange={(event) => setGuardianForm((current) => ({ ...current, relationshipType: event.target.value }))} placeholder="Madre, padre…" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-normal normal-case tracking-normal" /></label>
          <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={guardianForm.isPrimary} onChange={(event) => setGuardianForm((current) => ({ ...current, isPrimary: event.target.checked }))} /> Principal</label><button type="submit" disabled={isLinking} className="rounded-xl bg-edu-secondary px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-60">{isLinking ? 'Guardando…' : 'Vincular'}</button></div>
        </form>
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-bold text-edu-primary">Invitar usuario</h2><p className="text-[10px] text-slate-500">La persona recibirá un enlace para configurar su contraseña.</p></div><button type="button" onClick={resetForm} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"><X size={16} /></button></div>
            <form onSubmit={handleCreate} className="space-y-4 p-5">
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">Nombre completo<input required value={formData.full_name} onChange={(event) => setFormData((current) => ({ ...current, full_name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-normal normal-case tracking-normal outline-none focus:border-edu-secondary" /></label>
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">Correo electrónico<input required type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-normal normal-case tracking-normal outline-none focus:border-edu-secondary" /></label>
              <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">Rol<select required value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as '' | AdminAccountRole }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-normal normal-case tracking-normal outline-none focus:border-edu-secondary"><option value="">Seleccionar rol</option>{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">Cancelar</button><button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-edu-secondary px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-60">{isSubmitting ? 'Enviando…' : <><CheckCircle2 size={14} />Enviar invitación</>}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
