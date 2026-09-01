import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, User } from 'lucide-react';
import { listApprovedOpinions } from '../../../features/opiniones/services/opinionStore';
import { formatDate } from '../../../shared/utils/formatters';

const relationLabels = {
  familia: 'Familia',
  alumno: 'Alumno',
  egresado: 'Egresado',
  comunidad: 'Comunidad',
};

export const TestimonialsSection: React.FC = () => {
  const opinions = listApprovedOpinions(3);

  return (
    <section className="mx-auto max-w-6xl border-t border-slate-300/50 px-4 py-12">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-edu-primary md:text-xl">
            Opiniones de la comunidad
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Las voces aprobadas por el equipo institucional tambien viven en una
            ruta pública propia, para que la página muestre comunidad real sin
            exigir inicio de sesión.
          </p>
        </div>
        <Link
          to="/opiniones"
          className="inline-flex items-center gap-2 text-sm font-semibold text-edu-primary transition hover:text-edu-secondary-dark"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Ver todas y dejar la tuya</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {opinions.map((opinion) => (
          <article
            key={opinion.id}
            className="space-y-3 rounded-2xl border border-slate-200/60 bg-edu-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-edu-dark">
                <User size={12} className="text-slate-400" />
                <span>{opinion.displayName}</span>
              </div>
              <span className="rounded-full bg-edu-primary/10 px-2 py-1 font-bold uppercase tracking-[0.18em] text-edu-primary">
                {relationLabels[opinion.relation]}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {opinion.message}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
              <Calendar size={12} />
              <span>{formatDate(opinion.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
