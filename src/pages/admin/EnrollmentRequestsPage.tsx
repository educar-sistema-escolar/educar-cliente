import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FolderArchive,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  SearchCheck,
  ShieldCheck,
  Trash2,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import {
  approveEnrollmentRequest,
  deleteEnrollmentRequest,
  getEnrollmentStatusCount,
  listEnrollmentRequests,
  updateEnrollmentRequest,
  updateEnrollmentStatus,
} from '../../features/inscripcion/services/enrollmentStore';
import type { EnrollmentRequest, EnrollmentStatus } from '../../features/inscripcion/types';
import { formatDate } from '../../shared/utils/formatters';

const statusLabels: Record<EnrollmentStatus, string> = {
  pending: 'Nueva solicitud',
  reviewed: 'En analisis',
  approved_for_registration: 'Lista para crear cuenta',
  pending_admin_creation: 'Pendiente de carga interna',
  account_created: 'Cuenta creada',
  archived: 'Cerrada',
};

const statusClasses: Record<EnrollmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  reviewed: 'bg-sky-50 text-sky-700 border border-sky-200/50',
  approved_for_registration: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  pending_admin_creation: 'bg-violet-50 text-violet-700 border border-violet-200/50',
  account_created: 'bg-edu-secondary/10 text-edu-primary border border-edu-secondary/30',
  archived: 'bg-slate-100 text-slate-600 border border-slate-200/50',
};

const filters: Array<{ value: EnrollmentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Nuevas' },
  { value: 'approved_for_registration', label: 'Crear cuenta' },
  { value: 'account_created', label: 'Cuenta lista' },
  { value: 'pending_admin_creation', label: 'Carga interna' },
  { value: 'archived', label: 'Cerradas' },
];

type StepView = {
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaPath?: string;
  accent: string;
};

function getStepView(request: EnrollmentRequest): StepView {
  switch (request.status) {
    case 'approved_for_registration':
      return {
        eyebrow: 'Habilitado',
        headline: 'Listo para auto-registro',
        body: 'El alta institucional está completa. El alumno ya está habilitado para crear su cuenta ingresando su DNI en el portal de registro.',
        ctaLabel: 'Ir a registro',
        ctaPath: `/registro?role=student&dni=${request.studentDni}`,
        accent: 'border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-white',
      };
    case 'pending_admin_creation':
      return {
        eyebrow: 'Carga Pendiente',
        headline: 'Requiere registro previo en el sistema interno',
        body: 'Antes de permitir el registro del usuario, un administrador debe cargar formalmente los datos de este alumno en la base institucional.',
        accent: 'border-violet-100 bg-gradient-to-r from-violet-50/80 to-white',
      };
    case 'reviewed':
      return {
        eyebrow: 'En Revisión',
        headline: 'En proceso de evaluación',
        body: 'La solicitud está siendo evaluada para determinar si corresponde su aprobación directa o si requiere una revisión de datos internos.',
        accent: 'border-sky-100 bg-gradient-to-r from-sky-50/80 to-white',
      };
    case 'account_created':
      return {
        eyebrow: 'Cuenta Lista',
        headline: 'Acceso habilitado en el sistema',
        body: 'La cuenta se encuentra creada y activa. El estudiante ya puede ingresar al portal privado utilizando sus credenciales.',
        ctaLabel: 'Ir al Login',
        ctaPath: '/login',
        accent: 'border-edu-secondary/20 bg-gradient-to-r from-edu-secondary/10 to-white',
      };
    case 'archived':
      return {
        eyebrow: 'Cerrado',
        headline: 'Caso finalizado y archivado',
        body: 'Esta solicitud ha sido archivada. No requiere gestiones adicionales en el flujo actual de admisiones.',
        accent: 'border-slate-200 bg-gradient-to-r from-slate-50/50 to-white',
      };
    case 'pending':
    default:
      return {
        eyebrow: 'Acción Pendiente',
        headline: 'Evaluar y procesar solicitud',
        body: 'Revise los antecedentes del aspirante para decidir si se aprueba su alta directa o si requiere una verificación previa.',
        accent: 'border-amber-100 bg-gradient-to-r from-amber-50/80 to-white',
      };
  }
}

export const EnrollmentRequestsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    studentName: string;
    studentDni: string;
    email: string;
    level: string;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'resolve' | 'archive' | 'delete';
    request: EnrollmentRequest;
  } | null>(null);
  const [editingRequest, setEditingRequest] = useState<EnrollmentRequest | null>(null);
  const [editForm, setEditForm] = useState({
    studentFirstName: '',
    studentLastName: '',
    studentDni: '',
    birthDate: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [requests, setRequests] = useState(() => listEnrollmentRequests());

  useEffect(() => {
    const handleUpdate = () => {
      setRequests(listEnrollmentRequests());
    };

    window.addEventListener('enrollment-updated', handleUpdate);
    return () => {
      window.removeEventListener('enrollment-updated', handleUpdate);
    };
  }, []);

  const visibleRequests =
    activeFilter === 'all'
      ? requests
      : requests.filter((item) => item.status === activeFilter);

  const resolveRequest = (request: EnrollmentRequest) => {
    const updated = approveEnrollmentRequest(request.id);

    if (!updated) {
      setFeedback('No se pudo actualizar la solicitud seleccionada.');
      return;
    }

    if (updated.status === 'approved_for_registration') {
      setActiveFilter('approved_for_registration');
      setSuccessModalData({
        studentName: `${request.studentFirstName} ${request.studentLastName}`,
        studentDni: request.studentDni,
        email: request.email,
        level: `${request.educationalLevel} · ${request.schoolYear}`,
      });
      return;
    }

    setFeedback(
      `Solicitud procesada: Se determinó que ${request.studentFirstName} ${request.studentLastName} requiere primero ser registrado en la base escolar interna.`,
    );
  };

  const archiveRequest = (request: EnrollmentRequest) => {
    updateEnrollmentStatus(request.id, 'archived');
    setActiveFilter('archived');
    setFeedback(
      `Solicitud archivada: Se cerró la solicitud de inscripción para ${request.studentFirstName} ${request.studentLastName}.`,
    );
  };

  const deleteRequest = (request: EnrollmentRequest) => {
    deleteEnrollmentRequest(request.id);
    setRequests(listEnrollmentRequests());
    setFeedback(
      `Solicitud eliminada permanentemente: Se eliminó la solicitud de ${request.studentFirstName} ${request.studentLastName}.`,
    );
  };

  const openEditModal = (request: EnrollmentRequest) => {
    setEditingRequest(request);
    setEditForm({
      studentFirstName: request.studentFirstName,
      studentLastName: request.studentLastName,
      studentDni: request.studentDni,
      birthDate: request.birthDate,
      email: request.email,
      phone: request.phone,
      notes: request.notes,
    });
  };

  const saveEdit = () => {
    if (!editingRequest) return;
    updateEnrollmentRequest(editingRequest.id, editForm);
    setRequests(listEnrollmentRequests());
    setEditingRequest(null);
    setFeedback(`Solicitud modificada: Se actualizaron los datos de ${editForm.studentFirstName} ${editForm.studentLastName}.`);
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Flujo de inscripción
            </span>
            <h1 className="mt-2 text-lg font-bold text-edu-primary">
              Desde la solicitud hasta la cuenta lista
            </h1>
            <p className="mt-0.5 text-xs text-edu-muted">Gestioná cada etapa del proceso de admisión</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 w-full lg:w-auto shrink-0">
            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-4 py-3 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-200/50 text-amber-700">
                  <ClipboardList size={12} />
                </div>
                Pendientes
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-amber-800">
                {getEnrollmentStatusCount('pending')}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-200/50 text-emerald-700">
                  <CheckCircle2 size={12} />
                </div>
                Habilitados
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-emerald-800">
                {getEnrollmentStatusCount('approved_for_registration')}
              </p>
            </div>
            <div className="rounded-xl border border-edu-secondary/20 bg-gradient-to-br from-edu-secondary/10 to-white px-4 py-3 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-edu-primary">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-edu-secondary/20 text-edu-primary">
                  <GraduationCap size={12} />
                </div>
                Con Cuenta
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-edu-dark">
                {getEnrollmentStatusCount('account_created')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {feedback && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 text-xs font-medium text-emerald-700 shadow-sm">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-200/50">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span>{feedback}</span>
        </div>
      )}

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-edu-border pb-4">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-edu-secondary text-white shadow-sm shadow-edu-secondary/20'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-edu-border bg-slate-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
              <SearchCheck className="h-6 w-6 text-edu-secondary/60" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">
              No hay solicitudes en este filtro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleRequests.map((request) => {
              const stepView = getStepView(request);
              const canResolve =
                request.status === 'pending' || request.status === 'reviewed';
              const canArchive =
                request.status !== 'archived' && request.status !== 'account_created';

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-xl border border-edu-border/60 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <div className="border-b border-edu-border bg-gradient-to-r from-slate-50 to-white px-5 py-3.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-800">
                            {request.studentFirstName} {request.studentLastName}
                          </h2>
                          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses[request.status]}`}>
                            {statusLabels[request.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-edu-muted">
                          DNI: <span className="font-mono font-semibold">{request.studentDni}</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <Calendar className="mr-0.5 inline h-3 w-3 align-text-top text-edu-muted" />
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-white border border-edu-border/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        <GraduationCap className="h-3.5 w-3.5 text-edu-secondary" />
                        <span>{request.educationalLevel}</span>
                        <span className="text-slate-300">·</span>
                        <span>{request.schoolYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-edu-muted">
                        <User size={12} /> Responsable tutor
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{request.responsibleFullName}</p>
                      <p className="text-xs text-edu-muted">Relación: {request.responsibleRelation}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-edu-muted">
                        <Mail size={12} /> Contacto
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate">{request.email}</p>
                      <p className="flex items-center gap-1 text-xs text-edu-muted">
                        <Phone size={10} /> {request.phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">Observaciones</div>
                      <p className="text-xs italic text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-edu-border max-h-16 overflow-y-auto">
                        "{request.notes || 'Sin observaciones adicionales.'}"
                      </p>
                    </div>
                  </div>

                  <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-3.5 border-t ${stepView.accent}`}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-edu-muted border border-edu-border/40">
                          {stepView.eyebrow}
                        </span>
                        <h3 className="text-xs font-bold text-slate-800">{stepView.headline}</h3>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">{stepView.body}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {canResolve && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: 'resolve', request })}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-edu-secondary px-3.5 py-2 text-[11px] font-bold text-white shadow-sm shadow-edu-secondary/20 hover:bg-edu-secondary-dark transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Procesar
                        </button>
                      )}
                      {!canResolve && stepView.ctaPath && stepView.ctaLabel && (
                        <Link
                          to={stepView.ctaPath}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary px-3.5 py-2 text-[11px] font-bold text-white shadow-sm shadow-edu-secondary/20 hover:bg-edu-secondary-dark transition-all"
                        >
                          {stepView.ctaLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(request)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white border border-edu-border px-3.5 py-2 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      {canArchive && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: 'archive', request })}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white border border-edu-border px-3.5 py-2 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                        >
                          <FolderArchive className="h-3.5 w-3.5" /> Archivar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: 'delete', request })}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3.5 py-2 text-[11px] font-bold text-red-600 shadow-sm hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-edu-border bg-white p-5 shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-sm">
              {confirmAction.type === 'delete' ? <Trash2 size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div className="space-y-1.5 text-center">
              <h3 className="text-sm font-bold text-slate-800">
                {confirmAction.type === 'resolve'
                  ? '¿Aprobar solicitud?'
                  : confirmAction.type === 'delete'
                    ? '¿Eliminar permanentemente?'
                    : '¿Cerrar caso?'}
              </h3>
              <p className="text-xs text-edu-muted leading-relaxed">
                {confirmAction.type === 'resolve'
                  ? `${confirmAction.request.studentFirstName} ${confirmAction.request.studentLastName} quedará habilitado para auto-registrarse.`
                  : confirmAction.type === 'delete'
                    ? `Se eliminará la solicitud de ${confirmAction.request.studentFirstName} ${confirmAction.request.studentLastName}. Esta acción no se puede deshacer.`
                    : `Se archivará la solicitud de ${confirmAction.request.studentFirstName} ${confirmAction.request.studentLastName}.`}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 h-10 cursor-pointer rounded-xl border border-edu-border bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const req = confirmAction.request;
                  const actionType = confirmAction.type;
                  setConfirmAction(null);
                  if (actionType === 'resolve') resolveRequest(req);
                  else if (actionType === 'delete') deleteRequest(req);
                  else archiveRequest(req);
                }}
                className={`flex-1 h-10 cursor-pointer rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
                  confirmAction.type === 'resolve'
                    ? 'bg-edu-secondary hover:bg-edu-secondary-dark'
                    : confirmAction.type === 'delete'
                      ? 'bg-edu-danger hover:bg-red-700'
                      : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {confirmAction.type === 'resolve' ? 'Sí, habilitar' : confirmAction.type === 'delete' ? 'Sí, eliminar' : 'Sí, archivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-edu-border bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-edu-secondary/10 to-edu-secondary/5 text-edu-secondary">
                  <Pencil size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Editar solicitud</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                className="cursor-pointer rounded-lg p-1.5 text-edu-muted hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Nombre</span>
                  <input type="text" value={editForm.studentFirstName} onChange={(e) => setEditForm(f => ({ ...f, studentFirstName: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Apellido</span>
                  <input type="text" value={editForm.studentLastName} onChange={(e) => setEditForm(f => ({ ...f, studentLastName: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">DNI</span>
                  <input type="text" value={editForm.studentDni} onChange={(e) => setEditForm(f => ({ ...f, studentDni: e.target.value.replace(/\D/g, '') }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Fecha nacimiento</span>
                  <input type="date" value={editForm.birthDate} onChange={(e) => setEditForm(f => ({ ...f, birthDate: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Email</span>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Teléfono</span>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Observaciones</span>
                <textarea value={editForm.notes} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full rounded-lg border border-edu-border bg-white px-3 py-2 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setEditingRequest(null)} className="flex-1 h-10 cursor-pointer rounded-xl border border-edu-border bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={saveEdit} className="flex-1 h-10 cursor-pointer rounded-xl bg-edu-secondary text-xs font-semibold text-white shadow-sm shadow-edu-secondary/20 transition-all hover:bg-edu-secondary-dark">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-edu-border bg-white p-5 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">¡Alta completada!</h3>
              <p className="text-xs text-edu-muted">Alumno dado de alta institucional correctamente.</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-3.5 text-left space-y-2 border border-edu-border/50">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-edu-muted">Alumno</span>
                <p className="text-sm font-bold text-slate-800">{successModalData.studentName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-edu-border/80 pt-2">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-edu-muted">DNI</span>
                  <p className="text-xs font-semibold text-slate-700">{successModalData.studentDni}</p>
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-edu-muted">Nivel</span>
                  <p className="text-xs font-semibold text-slate-700">{successModalData.level}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-edu-muted leading-relaxed bg-gradient-to-r from-edu-secondary/10 to-white px-4 py-3 rounded-xl border border-edu-secondary/20">
              Se enviará el correo de aceptación al tutor con la información.
            </p>
            <button
              type="button"
              onClick={() => setSuccessModalData(null)}
              className="w-full h-10 cursor-pointer rounded-xl bg-edu-secondary text-xs font-semibold text-white shadow-sm shadow-edu-secondary/20 transition-all hover:bg-edu-secondary-dark"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
