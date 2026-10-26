import React, { useMemo, useState } from 'react';
import { useAccessibleDialog } from '../../shared/hooks/useAccessibleDialog';
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Trash2,
  XCircle,
  Newspaper,
  Sparkles,
} from 'lucide-react';
import {
  listAllCommentsForModeration,
  updateCommentStatus,
  deleteComment,
} from '../../features/comentarios/services/commentsStore';
import type { CommentStatus, NewsComment } from '../../features/comentarios/types';
import { newsStore } from '../../features/noticias/services/newsStore';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusLabels: Record<CommentStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const statusClasses: Record<CommentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  rejected: 'bg-red-50 text-red-700 border border-red-200/50',
};

const filters: Array<{ value: CommentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
];

export const CommentsModerationPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CommentStatus | 'all'>('pending');
  const [comments, setComments] = useState<NewsComment[]>(() => listAllCommentsForModeration());
  const [feedback, setFeedback] = useState<string | null>(null);

  const articles = useMemo(() => newsStore.getArticles(), []);

  const visible = activeFilter === 'all'
    ? comments
    : comments.filter(c => c.status === activeFilter);

  const getNewsTitle = (newsId: number) =>
    articles.find(a => a.id === newsId)?.title ?? `Noticia #${newsId}`;

  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'pending' | 'delete';
    commentId: string;
    commentContent: string;
  } | null>(null);
  const confirmDialogRef = useAccessibleDialog<HTMLDivElement>(Boolean(confirmAction), () => setConfirmAction(null));

  const refreshComments = () => {
    setComments(listAllCommentsForModeration());
  };

  const handleStatus = (id: string, status: CommentStatus) => {
    updateCommentStatus(id, status);
    refreshComments();
    setFeedback(`Comentario ${status === 'approved' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'devuelto a pendiente'}.`);
    setConfirmAction(null);
  };

  const handleDelete = (id: string) => {
    deleteComment(id);
    refreshComments();
    setFeedback('Comentario eliminado permanentemente.');
    setConfirmAction(null);
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
          <Sparkles className="h-3.5 w-3.5" />
          Moderación de comentarios
        </span>
        <h1 className="mt-2 text-lg font-bold text-edu-primary">
          Comentarios en noticias
        </h1>
        <p className="mt-1 text-xs text-edu-muted max-w-3xl leading-relaxed">
          Visitantes no registrados pueden comentar en las noticias. Todos los comentarios nuevos requieren aprobación.
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
          {filters.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-lg px-3.5 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === f.value
                  ? 'bg-edu-secondary text-white shadow-sm shadow-edu-secondary/20'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-edu-border bg-slate-50/50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
              <MessageSquare className="h-6 w-6 text-edu-secondary/60" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">No hay comentarios en este estado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(comment => (
              <div
                key={comment.id}
                className="group rounded-xl border border-edu-border/60 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{comment.authorName}</h3>
                      <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses[comment.status]}`}>
                        {statusLabels[comment.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-edu-muted flex-wrap">
                      <Newspaper className="h-3 w-3 shrink-0 text-edu-secondary/60" />
                      <span className="font-medium">En: {getNewsTitle(comment.newsId)}</span>
                      <span className="text-slate-300">·</span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 lg:justify-end">
                    {comment.status !== 'approved' && (
                      <button type="button" onClick={() => setConfirmAction({ type: 'approve', commentId: comment.id, commentContent: comment.content })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm">
                        <CheckCheck className="h-3.5 w-3.5" /> Aprobar
                      </button>
                    )}
                    {comment.status !== 'rejected' && (
                      <button type="button" onClick={() => setConfirmAction({ type: 'reject', commentId: comment.id, commentContent: comment.content })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 transition-all hover:bg-red-100 hover:shadow-sm">
                        <XCircle className="h-3.5 w-3.5" /> Rechazar
                      </button>
                    )}
                    {comment.status !== 'pending' && (
                      <button type="button" onClick={() => setConfirmAction({ type: 'pending', commentId: comment.id, commentContent: comment.content })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm">
                        <Clock3 className="h-3.5 w-3.5" /> Pendiente
                      </button>
                    )}
                    <button type="button" onClick={() => setConfirmAction({ type: 'delete', commentId: comment.id, commentContent: comment.content })} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-all hover:bg-rose-100 hover:shadow-sm">
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {confirmAction && (() => {
        const label = confirmAction.type === 'approve' ? 'aprobar' : confirmAction.type === 'reject' ? 'rechazar' : confirmAction.type === 'pending' ? 'devolver a pendiente' : 'eliminar';
        const title = confirmAction.type === 'delete' ? 'Eliminar comentario' : 'Cambiar estado del comentario';
        const btnClass = confirmAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : confirmAction.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : confirmAction.type === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div ref={confirmDialogRef} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl text-center space-y-4" role="dialog" aria-modal="true" aria-labelledby="comment-confirm-title">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 id="comment-confirm-title" className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {confirmAction.type === 'delete'
                  ? 'Esta acción no se puede deshacer. El comentario se eliminará permanentemente.'
                  : `El comentario pasará a estado "${label}".`}
              </p>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-left">
                <p className="text-[11px] text-slate-600 line-clamp-3 italic">"{confirmAction.commentContent}"</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 h-10 cursor-pointer rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmAction.type === 'delete') {
                      handleDelete(confirmAction.commentId);
                    } else {
                      const statusMap = { approve: 'approved' as const, reject: 'rejected' as const, pending: 'pending' as const };
                      handleStatus(confirmAction.commentId, statusMap[confirmAction.type]);
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
    </div>
  );
};
