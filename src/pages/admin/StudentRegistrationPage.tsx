import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  createStudentAccount,
  getDefaultStudentPayload,
  getInstitutionalStudentByDni,
  getSession,
} from '../../features/auth/services/demoAuth';
import { markEnrollmentAccountCreatedByDni } from '../../features/inscripcion/services/enrollmentStore';

export const StudentRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialDni = searchParams.get('dni')?.replace(/\D/g, '') || '46463269';
  const [dni, setDni] = useState(initialDni);
  const [searchedDni, setSearchedDni] = useState(initialDni);
  const [accountVersion, setAccountVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = useMemo(
    () => getInstitutionalStudentByDni(searchedDni.trim()),
    [accountVersion, searchedDni],
  );

  React.useEffect(() => {
    setDni(initialDni);
    setSearchedDni(initialDni);
  }, [initialDni]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);

    if (!dni.trim()) {
      setError('Ingresa un DNI para consultar el padron institucional.');
      return;
    }

    setError(null);
    setSearchedDni(dni.trim());
  }

  async function handleCreateAccount() {
    if (!student) {
      setError('El DNI ingresado no pertenece a un alumno habilitado para esta demo.');
      return;
    }

    if (student.hasAccount) {
      setError('Este alumno ya tiene cuenta registrada en la demo.');
      return;
    }

    const session = getSession();

    if (!session || session.role !== 'superadmin') {
      setError('Necesitás iniciar sesión como superadministrador para crear la cuenta.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await createStudentAccount(session.token, getDefaultStudentPayload(student));
      markEnrollmentAccountCreatedByDni(student.dni);
      setAccountVersion((current) => current + 1);
      setSuccessMessage(
        'Cuenta creada con éxito. El alumno ya puede iniciar sesión con juan@educar.com y la contraseña programacion2026.',
      );
      setSearchedDni(student.dni);
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : 'No se pudo crear la cuenta del alumno.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            Crear cuenta de alumno
          </span>
          <h1 className="text-lg font-bold text-edu-primary">
            Desde el padrón institucional
          </h1>
          <p className="text-xs leading-relaxed text-edu-muted">
            Validá el DNI en el padrón y creá la cuenta. Las credenciales quedan listas para el login.
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-edu-muted">
                DNI del alumno
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-edu-muted" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={dni}
                  onChange={(event) => setDni(event.target.value.replace(/\D/g, ''))}
                  placeholder="46463269"
                  className="h-10 w-full rounded-xl border border-edu-border bg-slate-50 pl-9 pr-4 text-xs text-slate-800 outline-none transition focus:border-edu-secondary focus:bg-white focus:ring-2 focus:ring-edu-secondary/15"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-edu-secondary px-4 text-xs font-semibold text-white shadow-sm shadow-edu-secondary/20 transition hover:bg-edu-secondary-dark cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Consultar padrón
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-3 text-xs text-red-700">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-red-200/50">
                <AlertTriangle className="h-3 w-3" />
              </div>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-white px-4 py-3 text-xs text-green-700">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-green-200/50">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
          {!student ? (
            <div className="flex min-h-[240px] h-full flex-col items-center justify-center rounded-xl border border-dashed border-edu-border bg-slate-50/80 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
                <BadgeCheck className="h-6 w-6 text-edu-secondary/60" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                No encontramos el DNI en el padrón demo.
              </p>
              <p className="mt-1.5 max-w-sm text-xs text-edu-muted">
                Probá con: <strong className="text-slate-700">46463269</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">Alumno encontrado</p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-800">
                    {student.firstName} {student.lastName}
                  </h2>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  student.hasAccount
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                }`}>
                  {student.hasAccount ? 'Con cuenta' : 'Sin cuenta'}
                </span>
              </div>

              <dl className="grid gap-3 rounded-xl bg-gradient-to-br from-slate-50 to-white p-4 sm:grid-cols-2 border border-edu-border/40">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-edu-muted">DNI</dt>
                  <dd className="mt-0.5 text-xs font-medium text-slate-700">{student.dni}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-edu-muted">Correo</dt>
                  <dd className="mt-0.5 text-xs font-medium text-slate-700">{student.email}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-edu-muted">Curso</dt>
                  <dd className="mt-0.5 text-xs font-medium text-slate-700">{student.schoolYear} {student.division}</dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-edu-muted">Nivel</dt>
                  <dd className="mt-0.5 text-xs font-medium text-slate-700">{student.educationalLevel}</dd>
                </div>
              </dl>

              <div className="rounded-xl border border-edu-border bg-gradient-to-br from-edu-secondary/[0.02] to-white p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-edu-muted">Credenciales</p>
                <div className="mt-2 flex items-start gap-2.5">
                  <KeyRound className="mt-0.5 h-4 w-4 text-edu-secondary" />
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><strong className="text-slate-800">Correo:</strong> {student.email}</p>
                    <p><strong className="text-slate-800">Contraseña:</strong> programacion2026</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={student.hasAccount || isSubmitting}
                onClick={handleCreateAccount}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-edu-secondary px-4 text-xs font-semibold text-white shadow-sm shadow-edu-secondary/20 transition hover:bg-edu-secondary-dark disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Creando cuenta...
                  </>
                ) : student.hasAccount ? (
                  'Cuenta ya registrada'
                ) : (
                  'Crear cuenta del alumno'
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
