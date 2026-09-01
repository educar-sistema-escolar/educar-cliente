import React, { useState } from 'react';
import type { PublicOpinion } from '../../features/opiniones/types';
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock3,
  MessageSquareWarning,
  XCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  listOpinions,
  updateOpinionStatus,
  deletePublicOpinion,
} from '../../features/opiniones/services/opinionStore';
import type { PublicOpinionStatus } from '../../features/opiniones/types';
import { formatDate } from '../../shared/utils/formatters';

const statusLabels: Record<PublicOpinionStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const statusClasses: Record<PublicOpinionStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  rejected: 'bg-red-50 text-red-700 border border-red-200/50',
};

const filters: Array<{ value: PublicOpinionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

export const OpinionModerationPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<PublicOpinionStatus | 'all'>('pending');
  const [opinions, setOpinions] = useState<PublicOpinion[]>(() => listOpinions());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'pending' | 'delete';
    opinionId: string;
    opinionName: string;
  } | null>(null);

  const visibleOpinions =
    activeFilter === 'all'
      ? opinions
      : opinions.filter((item) => item.status === activeFilter);

  const refreshOpinions = () => {
    setOpinions(listOpinions());
  };

  const handleStatusChange = (id: string, status: PublicOpinionStatus) => {
    const updated = updateOpinionStatus(id, status);
    refreshOpinions();
    setConfirmAction(null);

    if (!updated) {
      setFeedback('No se pudo actualizar la opinion seleccionada.');
      return;
    }

    const actionLabel =
      status === 'approved'
        ? 'aprobada y ya visible en la web publica'
        : status === 'rejected'
          ? 'rechazada'
          : 'devuelta a pendiente';

    setFeedback(`La opinion de ${updated.displayName} quedo ${actionLabel}.`);
  };

  const handleDeleteOpinion = (id: string, name: string) => {
    deletePublicOpinion(id);
    refreshOpinions();
    setFeedback(`La opinión de ${name} ha sido eliminada permanentemente.`);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
          <Sparkles className="h-3.5 w-3.5" />
          Moderación pública
        </span>
        <h1 className="mt-2 text-lg font-bold text-edu-primary">
          Revisión de opiniones
        </h1>
        <p className="mt-1 text-xs text-edu-muted max-w-3xl leading-relaxed">
          Las opiniones enviadas sin login llegan primero a este espacio. Cada cambio de estado actualiza la visibilidad del contenido.
        </p>
      </section>

      {feedback && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 text-xs font-medium text-emerald-700 shadow-sm">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-200/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span>{feedback}</span>
        </div>
      )}

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-edu-secondary text-white shadow-sm shadow-edu-secondary/20'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleOpinions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-edu-border bg-slate-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
              <MessageSquareWarning className="h-6 w-6 text-edu-secondary/60" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">No hay opiniones en este estado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleOpinions.map((opinion) => (
              <div
                key={opinion.id}
                className="group rounded-xl border border-edu-border/60 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-800">{opinion.displayName}</h2>
                      <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses[opinion.status]}`}>
                        {statusLabels[opinion.status]}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-edu-muted">
                      {opinion.relation}
                      <span className="mx-1.5 text-slate-300">·</span>
                      {formatDate(opinion.createdAt)}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{opinion.message}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    <button type="button" onClick={() => setConfirmAction({ type: 'approve', opinionId: opinion.id, opinionName: opinion.displayName })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm">
                      <CheckCheck className="h-3.5 w-3.5" /> Aprobar
                    </button>
                    <button type="button" onClick={() => setConfirmAction({ type: 'reject', opinionId: opinion.id, opinionName: opinion.displayName })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 transition-all hover:bg-red-100 hover:shadow-sm">
                      <XCircle className="h-3.5 w-3.5" /> Rechazar
                    </button>
                    <button type="button" onClick={() => setConfirmAction({ type: 'pending', opinionId: opinion.id, opinionName: opinion.displayName })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm">
                      <Clock3 className="h-3.5 w-3.5" /> Pendiente
                    </button>
                    <button type="button" onClick={() => setConfirmAction({ type: 'delete', opinionId: opinion.id, opinionName: opinion.displayName })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-all hover:bg-rose-100 hover:shadow-sm">
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmAction && (() => {
          const label = confirmAction.type === 'approve' ? 'aprobar' : confirmAction.type === 'reject' ? 'rechazar' : confirmAction.type === 'pending' ? 'devolver a pendiente' : 'eliminar';
          const title = confirmAction.type === 'delete' ? 'Eliminar opinión' : 'Cambiar estado de la opinión';
          const btnClass = confirmAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : confirmAction.type === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700';
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 shadow-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmAction.type === 'delete'
                    ? 'Esta acción no se puede deshacer. La opinión se eliminará permanentemente.'
                    : `La opinión de ${confirmAction.opinionName} pasará a estado "${label}".`}
                </p>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 h-10 cursor-pointer rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmAction.type === 'delete') {
                        handleDeleteOpinion(confirmAction.opinionId, confirmAction.opinionName);
                      } else {
                        const statusMap = { approve: 'approved' as const, reject: 'rejected' as const, pending: 'pending' as const };
                        handleStatusChange(confirmAction.opinionId, statusMap[confirmAction.type]);
                      }
                    }}
                    className={`flex-1 h-10 cursor-pointer rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${btnClass}`}
                  >
                    {confirmAction.type === 'approve' ? 'Aprobar' : confirmAction.type === 'reject' ? 'Rechazar' : confirmAction.type === 'pending' ? 'Pendiente' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
};
