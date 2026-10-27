import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, ClipboardList, HeartHandshake } from 'lucide-react';

const steps = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: 'Completas la solicitud',
    text: 'Cargas los datos del alumno aspirante y del adulto responsable en una sola pagina.',
  },
  {
    icon: <BookOpenCheck className="h-5 w-5" />,
    title: 'Queda registrada',
    text: 'El formulario registra la solicitud en el sistema institucional y muestra el número cuando Supabase confirma el envío.',
  },
  {
    icon: <HeartHandshake className="h-5 w-5" />,
    title: 'Seguimos el contacto',
    text: 'Administración actualiza el estado desde su panel y el equipo puede continuar el seguimiento con la familia.',
  },
];

export const EnrollmentInviteSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-edu-primary px-6 py-8 text-white md:px-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <BookOpenCheck className="h-4 w-4" />
              Inscripción abierta
            </span>
            <h2 className="mt-4 max-w-lg text-2xl font-bold tracking-tight md:text-3xl">
              Solicitud de inscripción con una experiencia clara y cuidada.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82">
              Sumamos una ruta pública propia para iniciar el contacto con la
              institucion, manteniendo el estilo del sitio y un flujo ordenado
              para familias aspirantes.
            </p>
            <Link
              to="/inscripcion"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-edu-primary transition hover:bg-slate-100"
            >
              <span>Ir al formulario</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4 px-6 py-8 md:px-10">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-edu-primary/10 p-2 text-edu-primary">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {step.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
