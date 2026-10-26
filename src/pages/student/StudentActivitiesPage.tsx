import React, { useEffect, useState } from 'react';
import { useAccessibleDialog } from '../../shared/hooks/useAccessibleDialog';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { getSession, getLocalDemoAccountByEmail } from '../../features/auth/services/demoAuth';
import { institutionalStudents } from '../../features/auth/data/institutionalStudents';
import { getRegisteredUserByEmail } from '../../features/auth/services/demoAuth';
import {
  listActivities,
  enrollStudentInActivity,
  unenrollStudentFromActivity,
  getStudentActivities,
} from '../../features/actividades/services/activitiesStore';
import { categoryLabels, categoryColors } from '../../features/actividades/types';

function getStudentDni(email: string): string | null {
  const institutional = institutionalStudents.find(s => s.email === email);
  if (institutional) return institutional.dni;
  const registered = getRegisteredUserByEmail(email);
  if (registered) return registered.dni;
  return null;
}

function getChildDniFromParent(email: string): string | null {
  const account = getLocalDemoAccountByEmail(email);
  if (!account || !account.childName) return null;
  for (const s of institutionalStudents) {
    const fullName = `${s.firstName} ${s.lastName}`;
    if (fullName.toLowerCase() === account.childName.toLowerCase()) {
      return s.dni;
    }
  }
  return null;
}

export const StudentActivitiesPage: React.FC = () => {
  const session = getSession();
  const [, setVersion] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ type: 'enroll' | 'unenroll'; activityId: string; activityName: string } | null>(null);
  const confirmDialogRef = useAccessibleDialog<HTMLDivElement>(Boolean(confirm), () => setConfirm(null));
    const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 1600);
      return () => clearTimeout(t);
    }
  }, [success]);

  const isParent = session?.role === 'parent';
  const dni: string | null = isParent
    ? (session?.email ? getChildDniFromParent(session.email) : null)
    : (session?.email ? getStudentDni(session.email) : null);

  const allActivities = listActivities().filter(a => a.isActive);
  const myActivities = dni ? getStudentActivities(dni) : [];

  const executeEnroll = (activityId: string) => {
    if (!dni) return;
    const fresh = listActivities().filter(a => a.isActive);
    const activity = fresh.find(a => a.id === activityId);
    if (!activity) return;
    if (activity.enrolledStudents.includes(dni)) {
      setFeedback('Ya estás inscrito en esta actividad.');
      return;
    }
    if (activity.enrolledStudents.length >= activity.maxStudents) {
      setFeedback('La actividad alcanzó su cupo máximo.');
      return;
    }
    enrollStudentInActivity(activityId, dni);
    setVersion(v => v + 1);
    setSuccess(true);
  };

  const executeUnenroll = (activityId: string) => {
    if (!dni) return;
    unenrollStudentFromActivity(activityId, dni);
    setVersion(v => v + 1);
    setFeedback('Te desinscribiste de la actividad.');
  };

  const startEnroll = (id: string, name: string) => setConfirm({ type: 'enroll', activityId: id, activityName: name });
  const startUnenroll = (id: string, name: string) => setConfirm({ type: 'unenroll', activityId: id, activityName: name });

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'enroll') executeEnroll(confirm.activityId);
    else executeUnenroll(confirm.activityId);
    setConfirm(null);
  };

  if (!session) return null;

  if (!dni) {
    const message = isParent
      ? 'No pudimos identificar a tu hijo en el sistema. Contactá al colegio.'
      : 'No pudimos identificar tu DNI en el sistema. Contactá al administrador.';
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
          <User className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-sm font-bold text-amber-800">
          {isParent ? 'Hijo no encontrado' : 'DNI no encontrado'}
        </h2>
        <p className="mt-1 text-xs text-amber-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
          <Activity className="h-3.5 w-3.5" />
          Actividades extracurriculares
        </span>
        <h1 className="mt-2 text-lg font-bold text-edu-primary">
          {isParent ? 'Actividades de mi hijo' : 'Mis actividades'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {isParent
            ? 'Inscribí a tu hijo o desinscribilo de las actividades extracurriculares.'
            : 'Inscribite en las actividades que más te interesen.'}
        </p>
      </div>

      {feedback && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 text-xs font-medium text-emerald-700 shadow-sm">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-200/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-auto text-emerald-500 hover:text-emerald-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {myActivities.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Inscripciones activas
          </h2>
          <div className="space-y-2">
            {myActivities.map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/50 to-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{activity.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{activity.schedule}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Todas las actividades
        </h2>
        {allActivities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Activity className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No hay actividades disponibles por el momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allActivities.map(activity => {
              const isEnrolled = activity.enrolledStudents.includes(dni);
              const isFull = activity.enrolledStudents.length >= activity.maxStudents;
              return (
                <div
                  key={activity.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${isEnrolled ? 'border-emerald-200/60' : 'border-slate-200/60'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800">{activity.name}</h3>
                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${categoryColors[activity.category]}`}>
                          {categoryLabels[activity.category]}
                        </span>
                        {isEnrolled && (
                          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                            Inscripto
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500 sm:grid-cols-3">
                        <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {activity.schedule}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activity.location}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {activity.instructor}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {activity.enrolledStudents.length}/{activity.maxStudents}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isEnrolled ? (
                        <button
                          type="button"
                          onClick={() => startUnenroll(activity.id, activity.name)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <XCircle size={14} />
                          Desinscribirme
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => startEnroll(activity.id, activity.name)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold shadow-sm transition-all cursor-pointer ${isFull ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-edu-secondary text-white hover:bg-edu-primary'}`}
                        >
                          <CheckCircle2 size={14} />
                          {isFull ? 'Cupo completo' : 'Inscribirme'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div ref={confirmDialogRef} className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl text-center space-y-4" role="dialog" aria-modal="true" aria-labelledby="activity-confirm-title">
            <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${confirm.type === 'enroll' ? 'bg-edu-secondary/10 text-edu-secondary' : 'bg-red-50 text-red-600'}`}>
              {confirm.type === 'enroll' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <h3 id="activity-confirm-title" className="text-sm font-bold text-slate-800">
              {confirm.type === 'enroll' ? 'Confirmar inscripción' : 'Confirmar desinscripción'}
            </h3>
            <p className="text-xs text-slate-500">
              {confirm.type === 'enroll'
                ? `¿Querés inscribirte en "${confirm.activityName}"?`
                : `¿Querés desinscribirte de "${confirm.activityName}"?`}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 h-10 rounded-xl text-xs font-semibold text-white hover:brightness-110 cursor-pointer shadow-sm ${confirm.type === 'enroll' ? 'bg-edu-secondary' : 'bg-red-600'}`}
              >
                {confirm.type === 'enroll' ? 'Inscribirme' : 'Desinscribirme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="animate-success-in">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.35)]">
              <svg
                className="h-14 w-14 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline
                  points="20 6 9 17 4 12"
                  className="animate-draw-check"
                  strokeDasharray="30"
                  strokeDashoffset="30"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes success-in {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-success-in {
          animation: success-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-check {
          animation: draw-check 0.35s ease-out 0.25s forwards;
        }
      `}</style>
    </div>
  );
};
