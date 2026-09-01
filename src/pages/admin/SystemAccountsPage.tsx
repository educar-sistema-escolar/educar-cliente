import React, { useCallback, useMemo, useState } from 'react';
import { ShieldCheck, UserCheck, Clock3, Sparkles, ChevronDown, ChevronRight, Mail, User, UserPlus, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { createAdminUser, getRegisteredUsers } from '../../features/auth/services/demoAuth';
import { institutionalStudents } from '../../features/auth/data/institutionalStudents';
import { listDynamicInstitutionalStudents } from '../../features/inscripcion/services/dynamicInstitutionalStore';
import { localDemoAccounts } from '../../features/auth/data/localDemoAccounts';
import type { DemoUserRole } from '../../features/auth/types';

type AccountStatus = 'registered' | 'pending_registration';

interface SystemAccount {
  id: string;
  name: string;
  email: string;
  role: DemoUserRole | 'authority';
  dni?: string;
  status: AccountStatus;
}

const roleLabels: Record<string, string> = {
  student: 'Alumno',
  teacher: 'Docente',
  parent: 'Familia',
  authority: 'Autoridad',
};

const roleColors: Record<string, string> = {
  student: 'bg-edu-secondary/10 text-edu-primary border border-edu-secondary/30',
  teacher: 'bg-purple-50 text-purple-700 border border-purple-200/50',
  parent: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  authority: 'bg-violet-50 text-violet-700 border border-violet-200/50',
};

export const SystemAccountsPage: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as '' | DemoUserRole,
    dni: '',
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', role: '', dni: '' });
    setCreateError(null);
    setCreateSuccess(null);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!formData.name.trim()) { setCreateError('El nombre es obligatorio.'); return; }
    if (!formData.email.trim()) { setCreateError('El correo electrónico es obligatorio.'); return; }
    if (!formData.role) { setCreateError('El rol es obligatorio.'); return; }
    if (!formData.dni.trim()) { setCreateError('El DNI es obligatorio.'); return; }
    if (!/^\d{6,8}$/.test(formData.dni.trim())) { setCreateError('El DNI debe tener entre 6 y 8 dígitos numéricos.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setCreateError('El correo electrónico no tiene un formato válido.'); return; }

    setIsSubmitting(true);
    try {
      createAdminUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role as DemoUserRole,
        dni: formData.dni.trim(),
      });
      setCreateSuccess(`Usuario "${formData.name.trim()}" creado correctamente.`);
      resetForm();
      setRefreshKey((k) => k + 1);
      setTimeout(() => { setCreateSuccess(null); }, 3000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDniChange = (dni: string) => {
    const digits = dni.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, dni: digits }));
  };

  const accounts = useMemo(() => {
    const list: SystemAccount[] = [];
    const registeredRaw = getRegisteredUsers();
    const registered = Array.isArray(registeredRaw) ? registeredRaw : [];

    institutionalStudents.forEach((student) => {
      const isRegistered = registered.some((r) => r.dni === student.dni);
      list.push({
        id: `static-${student.dni}`,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        role: 'student',
        dni: student.dni,
        status: isRegistered ? 'registered' : 'pending_registration',
      });
    });

    const dynamicRaw = listDynamicInstitutionalStudents();
    const dynamicStudents = Array.isArray(dynamicRaw) ? dynamicRaw : [];
    
    dynamicStudents.forEach((student) => {
      const isRegistered = registered.some((r) => r.dni === student.dni);
      if (!list.some((l) => l.dni === student.dni)) {
        list.push({
          id: `dynamic-${student.dni}`,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          role: 'student',
          dni: student.dni,
          status: isRegistered ? 'registered' : 'pending_registration',
        });
      }
    });

    localDemoAccounts.forEach((account) => {
      list.push({
        id: `demo-${account.email}`,
        name: account.name,
        email: account.email,
        role: account.role,
        status: 'registered',
      });
    });

    registered.forEach((r) => {
      if (!r || !r.email) return;
      if (!list.some((l) => l.email === r.email || (r.dni && l.dni === r.dni))) {
        list.push({
          id: `reg-${r.email}`,
          name: r.email.split('@')[0],
          email: r.email,
          role: r.role,
          dni: r.dni,
          status: 'registered',
        });
      }
    });

    return list;
  }, [refreshKey]);

  const totalRegistered = accounts.filter((a) => a.status === 'registered').length;
  const totalPending = accounts.filter((a) => a.status === 'pending_registration').length;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Directorio Institucional
            </span>
            <h1 className="mt-2 text-lg font-bold text-edu-primary">
              Cuentas del Sistema
            </h1>
            <p className="mt-1 text-xs text-edu-muted leading-relaxed">
              Cuentas registradas y alumnado con alta institucional pendiente de registro.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 px-4 py-3 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-200/50 text-emerald-700">
                  <UserCheck size={12} />
                </div>
                Activas
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-emerald-700">{totalRegistered}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 px-4 py-3 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-200/50 text-amber-700">
                  <Clock3 size={12} />
                </div>
                Pendientes
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-amber-700">{totalPending}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {createSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700 animate-in fade-in duration-200">
              <CheckCircle2 size={14} />
              {createSuccess}
            </div>
          )}
          {createError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 animate-in fade-in duration-200">
              <AlertTriangle size={14} />
              {createError}
            </div>
          )}
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-edu-secondary to-edu-secondary-light px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-edu-secondary/20 transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <UserPlus size={15} />
          Crear usuario
        </button>
      </div>

      <section className="rounded-2xl border border-edu-border/60 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-white text-[10px] font-bold uppercase tracking-wider text-edu-muted border-b border-edu-border/70">
                <th className="px-5 py-3.5 w-8"></th>
                <th className="px-5 py-3.5">Usuario</th>
                <th className="px-5 py-3.5">Rol</th>
                <th className="px-5 py-3.5">DNI</th>
                <th className="px-5 py-3.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edu-border/60">
              {accounts.map((account) => (
                <React.Fragment key={account.id}>
                  <tr
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => toggleRow(account.id)}
                  >
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRow(account.id); }}
                        className="cursor-pointer text-edu-muted hover:text-edu-secondary transition-colors"
                      >
                        {expandedRows.has(account.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5 text-edu-secondary">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{account.name}</div>
                          <div className="flex items-center gap-1 text-[11px] text-edu-muted">
                            <Mail size={10} />
                            {account.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${roleColors[account.role] || 'bg-slate-100 text-slate-600'}`}>
                        {roleLabels[account.role] || account.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-edu-muted">{account.dni || '-'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {account.status === 'registered' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/50">
                          <ShieldCheck className="h-3 w-3" />
                          Registrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200/50">
                          <Clock3 className="h-3 w-3" />
                          Sin cuenta
                        </span>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(account.id) && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="px-5 py-3">
                        <div className="flex items-center gap-3 text-[11px] text-edu-muted">
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={12} className="text-edu-secondary" />
                            {account.status === 'registered' ? 'Cuenta activa en el sistema' : 'Pendiente de registro'}
                          </span>
                          {account.dni && (
                            <span className="flex items-center gap-1">DNI: {account.dni}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div className="p-8 text-center text-sm text-edu-muted">
              No hay cuentas registradas en el sistema.
            </div>
          )}
        </div>
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-edu-secondary to-edu-secondary-light text-white shadow-sm">
                  <UserPlus size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-edu-primary">Crear usuario</h2>
                  <p className="text-[10px] text-slate-500">Ingrese los datos del nuevo usuario</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Nombre completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ej. María López"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-edu-secondary focus:ring-3 focus:ring-edu-secondary/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Correo electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@educar.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-edu-secondary focus:ring-3 focus:ring-edu-secondary/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as typeof formData.role }))}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all focus:border-edu-secondary focus:ring-3 focus:ring-edu-secondary/10 appearance-none bg-no-repeat bg-[right_12px_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                >
                  <option value="">Seleccionar rol</option>
                  <option value="authority">Autoridad</option>
                  <option value="teacher">Docente</option>
                  <option value="parent">Familia</option>
                  <option value="student">Alumno</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">DNI</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.dni}
                    onChange={(e) => handleDniChange(e.target.value)}
                    placeholder="12345678"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-edu-secondary focus:ring-3 focus:ring-edu-secondary/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Contraseña</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.dni || 'Se usará el DNI'}
                      readOnly
                      className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2.5 pr-8 text-xs text-slate-600 outline-none"
                    />
                    <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <p className="text-[9px] text-slate-500">La contraseña inicial es el DNI. Deberá cambiarla al primer inicio de sesión.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-edu-secondary to-edu-secondary-light px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-edu-secondary/20 transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Crear usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
