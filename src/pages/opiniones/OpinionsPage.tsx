import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { createPublicOpinion, listApprovedOpinions } from '../../features/opiniones/services/opinionStore';
import type { OpinionRelation } from '../../features/opiniones/types';
import { formatDate } from '../../shared/utils/formatters';

const relationLabels: Record<OpinionRelation, string> = {
  familia: 'Familia',
  alumno: 'Alumno',
  egresado: 'Egresado',
  comunidad: 'Comunidad',
};

export const OpinionsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    relation: 'familia' as OpinionRelation,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const approvedOpinions = useMemo(() => listApprovedOpinions(), [version]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.displayName.trim()) {
      setError('Ingresa un nombre para identificar la opinion.');
      return;
    }

    const trimmedMessage = formData.message.trim();

    if (!trimmedMessage) {
      setError('Escribe un mensaje antes de enviarlo.');
      return;
    }

    if (trimmedMessage.length < 12 || trimmedMessage.length > 280) {
      setError('La opinion debe tener entre 12 y 280 caracteres.');
      return;
    }

    createPublicOpinion({
      displayName: formData.displayName.trim(),
      relation: formData.relation,
      message: trimmedMessage,
    });

    setSuccess(
      'Gracias por compartir tu experiencia. La opinion quedo pendiente de revision institucional.',
    );
    setFormData({
      displayName: '',
      relation: 'familia',
      message: '',
    });
    setVersion((current) => current + 1);
  };

  return (
    <div className="animate-fadeIn bg-[#f5efe5]">
      <section className="bg-gradient-to-br from-edu-primary to-edu-secondary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <MessageSquare className="h-4 w-4" />
            Opiniones abiertas
          </span>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            La comunidad puede compartir su mirada sin iniciar sesión.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/82 md:text-base">
            En este MVP las opiniones se reciben desde una pagina publica y se
            moderan localmente desde el panel institucional antes de publicarse.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-edu-dark">Dejanos tu opinion</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              El envio es publico, pero la publicacion final queda sujeta a una
              revision simple desde el area de autoridades.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Nombre
              </span>
              <input
                type="text"
                value={formData.displayName}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-edu-primary focus:bg-white focus:ring-2 focus:ring-edu-primary/15"
              />
            </label>

            <label className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Tu relacion con la institucion
              </span>
              <select
                value={formData.relation}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    relation: event.target.value as OpinionRelation,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-edu-primary focus:bg-white focus:ring-2 focus:ring-edu-primary/15"
              >
                {Object.entries(relationLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Mensaje
              </span>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-edu-primary focus:bg-white focus:ring-2 focus:ring-edu-primary/15"
                placeholder="Contanos como vivis la propuesta educativa, el acompanamiento o el clima institucional."
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-edu-primary px-6 text-sm font-semibold text-white transition hover:bg-edu-secondary-dark"
            >
              <Send className="h-4 w-4" />
              <span>Enviar opinion</span>
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Las opiniones nuevas no se publican automaticamente. Primero
                quedan pendientes y luego se aprueban o rechazan desde el panel
                institucional.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-edu-dark">
                Opiniones publicadas
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Solo se muestran las experiencias ya aprobadas.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-edu-primary" />
              <span>Moderacion activa</span>
            </div>
          </div>

          {approvedOpinions.map((opinion) => (
            <article
              key={opinion.id}
              className="rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {opinion.displayName}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-edu-primary">
                    {relationLabels[opinion.relation]}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {formatDate(opinion.createdAt)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {opinion.message}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
