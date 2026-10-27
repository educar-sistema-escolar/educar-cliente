import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';

export const RegistrationPage: React.FC = () => (
  <section aria-labelledby="account-registration-title" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Acceso institucional
      </span>
      <h1 id="account-registration-title" className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Las cuentas las habilita la institución
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Para proteger los datos de estudiantes y familias, esta pantalla no crea usuarios ni almacena contraseñas en este navegador. Administración gestiona las cuentas desde Supabase Auth y comunica el acceso de forma privada.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Iniciar sesión
        </Link>
        <Link to="/inscripcion" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
          Solicitar inscripción de alumno
        </Link>
      </div>
      <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-900" role="note">
        Si ya recibiste una invitación, usá el correo asociado a tu cuenta y la contraseña provista por administración. Si no tenés acceso, comunicate con la institución.
      </p>
    </div>
  </section>
);
