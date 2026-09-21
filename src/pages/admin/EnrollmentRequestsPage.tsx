import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FolderArchive,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { listCourses } from '../../features/admin/services/academicRepository';
import type { Course } from '../../features/admin/types';
import {
  approveEnrollmentRequest,
  archiveEnrollmentRequest,
  listEnrollmentRequests,
  rejectEnrollmentRequest,
} from '../../features/inscripcion/services/enrollmentStore';
import type { EnrollmentRequest, EnrollmentStatus } from '../../features/inscripcion/types';

const statusLabels: Record<EnrollmentStatus, string> = {
  pending: 'Nueva solicitud',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  archived: 'Archivada',
};

const statusClasses: Record<EnrollmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  rejected: 'bg-red-50 text-red-700 border border-red-200/50',
  archived: 'bg-slate-100 text-slate-600 border border-slate-200/50',
};

const filters: Array<{ value: EnrollmentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'archived', label: 'Archivadas' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function courseLabel(course: Course) {
  return `${course.level?.name ?? 'Nivel'} · ${course.name} · ${course.academic_year}`;
}

export const EnrollmentRequestsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<EnrollmentRequest | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reject' | 'archive';
    request: EnrollmentRequest;
  } | null>(null);

  const fetchData = useCallback(() => Promise.all([
    listEnrollmentRequests(),
    listCourses(),
  ]), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRequests, nextCourses] = await fetchData();
      setRequests(nextRequests);
      setCourses(nextCourses);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    let mounted = true;
    void fetchData()
      .then(([nextRequests, nextCourses]) => {
        if (!mounted) return;
        setRequests(nextRequests);
        setCourses(nextCourses);
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las solicitudes.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const visibleRequests = useMemo(
    () => activeFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === activeFilter),
    [activeFilter, requests],
  );

  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const approvedCount = requests.filter((request) => request.status === 'approved').length;
  const archivedCount = requests.filter((request) => request.status === 'archived').length;

  const openApproval = (request: EnrollmentRequest) => {
    const firstCourse = courses.find(
      (course) => course.is_active && course.academic_year === request.academicYear,
    );
    setSelectedCourseId(request.approvedCourseId ?? firstCourse?.id ?? '');
    setApprovalRequest(request);
    setError(null);
  };

  const runMutation = async (
    request: EnrollmentRequest,
    mutation: () => Promise<unknown>,
    message: string,
  ) => {
    setActionId(request.id);
    setError(null);
    setFeedback(null);
    try {
      await mutation();
      await loadData();
      setFeedback(message);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'No se pudo actualizar la solicitud.');
    } finally {
      setActionId(null);
    }
  };

  const confirmPendingAction = async () => {
    if (!confirmAction) return;
    const { request, type } = confirmAction;
    setConfirmAction(null);
    await runMutation(
      request,
      () => type === 'reject'
        ? rejectEnrollmentRequest(request.id)
        : archiveEnrollmentRequest(request.id),
      type === 'reject'
        ? `Se rechazó la solicitud de ${request.studentFirstName} ${request.studentLastName}.`
        : `Se archivó la solicitud de ${request.studentFirstName} ${request.studentLastName}.`,
    );
  };

  const confirmApproval = async () => {
    if (!approvalRequest || !selectedCourseId) return;
    const request = approvalRequest;
    setApprovalRequest(null);
    await runMutation(
      request,
      () => approveEnrollmentRequest(request.id, selectedCourseId),
      `Se aprobó la inscripción de ${request.studentFirstName} ${request.studentLastName}.`,
    );
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
              <ClipboardList className="h-3.5 w-3.5" />
              Flujo de inscripción
            </span>
            <h1 className="mt-2 text-lg font-bold text-edu-primary">Solicitudes persistidas en Supabase</h1>
            <p className="mt-0.5 text-xs text-edu-muted">Aprobá, rechazá o archivá solicitudes desde el flujo institucional.</p>
          </div>
          <div className="grid w-full shrink-0 gap-2 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                <ClipboardList size={12} /> Pendientes
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-amber-800">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 size={12} /> Aprobadas
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-emerald-800">{approvedCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <FolderArchive size={12} /> Archivadas
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-slate-700">{archivedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-3 text-xs font-medium text-red-700 shadow-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-1 font-bold underline">
            <RefreshCw className="h-3 w-3" /> Reintentar
          </button>
        </div>
      )}

      {feedback && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 text-xs font-medium text-emerald-700 shadow-sm">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-edu-border pb-4">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${
                  activeFilter === filter.value
                    ? 'bg-edu-secondary text-white shadow-sm shadow-edu-secondary/20'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-edu-border px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-edu-muted">
            <RefreshCw className="h-4 w-4 animate-spin" /> Cargando solicitudes...
          </div>
        ) : visibleRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-edu-border bg-slate-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
              <SearchCheck className="h-6 w-6 text-edu-secondary/60" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">No hay solicitudes en este filtro.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleRequests.map((request) => {
              const approvedCourse = request.approvedCourseId
                ? courses.find((course) => course.id === request.approvedCourseId)
                : null;
              const isBusy = actionId === request.id;

              return (
                <article key={request.id} className="overflow-hidden rounded-xl border border-edu-border/60 bg-white shadow-sm">
                  <div className="border-b border-edu-border bg-gradient-to-r from-slate-50 to-white px-5 py-3.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-800">{request.studentFirstName} {request.studentLastName}</h2>
                          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses[request.status]}`}>
                            {statusLabels[request.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-edu-muted">
                          DNI: <span className="font-mono font-semibold">{request.studentDni}</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <Calendar className="mr-0.5 inline h-3 w-3 align-text-top" /> {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-edu-border/60 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        <GraduationCap className="h-3.5 w-3.5 text-edu-secondary" />
                        <span>{request.educationalLevel}</span><span className="text-slate-300">·</span><span>{request.schoolYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 text-sm md:grid-cols-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-edu-muted"><User size={12} /> Responsable</div>
                      <p className="text-sm font-semibold text-slate-800">{request.responsibleFullName}</p>
                      <p className="text-xs text-edu-muted">{request.responsibleRelation} · DNI {request.responsibleDni}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-edu-muted"><Mail size={12} /> Contacto</div>
                      <p className="truncate text-sm font-semibold text-slate-800">{request.email}</p>
                      <p className="flex items-center gap-1 text-xs text-edu-muted"><Phone size={10} /> {request.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">Datos académicos</div>
                      <p className="text-xs text-slate-600">Año lectivo: <strong>{request.academicYear}</strong></p>
                      <p className="text-xs text-slate-600">Turno: <strong>{request.turn}</strong></p>
                      {approvedCourse && <p className="truncate text-xs text-emerald-700">Curso: <strong>{courseLabel(approvedCourse)}</strong></p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-edu-border bg-slate-50/60 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-3xl text-[11px] leading-relaxed text-slate-600">{request.notes || 'Sin observaciones adicionales.'}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {request.status === 'pending' && (
                        <>
                          <button type="button" disabled={isBusy} onClick={() => openApproval(request)} className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary px-3.5 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-edu-secondary-dark disabled:cursor-not-allowed disabled:opacity-50">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                          </button>
                          <button type="button" disabled={isBusy} onClick={() => setConfirmAction({ type: 'reject', request })} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                            <XCircle className="h-3.5 w-3.5" /> Rechazar
                          </button>
                        </>
                      )}
                      {request.status !== 'archived' && (
                        <button type="button" disabled={isBusy} onClick={() => setConfirmAction({ type: 'archive', request })} className="inline-flex items-center gap-1.5 rounded-lg border border-edu-border bg-white px-3.5 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                          <FolderArchive className="h-3.5 w-3.5" /> Archivar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {approvalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-edu-border bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Aprobar inscripción</h3>
                <p className="mt-1 text-xs text-edu-muted">Elegí el curso activo del año {approvalRequest.academicYear}.</p>
              </div>
              <button type="button" onClick={() => setApprovalRequest(null)} className="rounded-lg p-1.5 text-edu-muted hover:bg-slate-100"><X size={16} /></button>
            </div>
            <label className="mt-5 block text-xs font-semibold text-slate-700">
              Curso de destino
              <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10">
                <option value="">Seleccioná un curso</option>
                {courses
                  .filter((course) => course.is_active && course.academic_year === approvalRequest.academicYear)
                  .map((course) => <option key={course.id} value={course.id}>{courseLabel(course)}</option>)}
              </select>
            </label>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setApprovalRequest(null)} className="flex-1 rounded-xl border border-edu-border px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="button" disabled={!selectedCourseId || actionId === approvalRequest.id} onClick={() => void confirmApproval()} className="flex-1 rounded-xl bg-edu-secondary px-3 py-2.5 text-xs font-semibold text-white hover:bg-edu-secondary-dark disabled:cursor-not-allowed disabled:opacity-50">Confirmar aprobación</button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-edu-border bg-white p-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={20} /></div>
            <div className="mt-4 space-y-1.5 text-center">
              <h3 className="text-sm font-bold text-slate-800">{confirmAction.type === 'reject' ? '¿Rechazar solicitud?' : '¿Archivar solicitud?'}</h3>
              <p className="text-xs leading-relaxed text-edu-muted">{confirmAction.request.studentFirstName} {confirmAction.request.studentLastName} cambiará a estado {confirmAction.type === 'reject' ? 'rechazada' : 'archivada'}.</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 rounded-xl border border-edu-border px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={() => void confirmPendingAction()} className="flex-1 rounded-xl bg-slate-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
