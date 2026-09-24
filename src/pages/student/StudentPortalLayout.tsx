import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, LogOut, Newspaper } from 'lucide-react';
import { signOutSupabase } from '../../features/auth/services/supabaseAuth';

export const StudentPortalLayout: React.FC<{ audience: 'student' | 'family' }> = ({ audience }) => {
  const navigate = useNavigate();
  const root = audience === 'student' ? '/alumnos' : '/familias';
  const title = audience === 'student' ? 'Portal del alumno' : 'Portal de familias';

  async function handleSignOut() {
    await signOutSupabase();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f6f4ec] text-[#172f46]">
      <header className="border-b border-[#d9ded8] bg-[#fffefa]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={root} className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176e68]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#173b54] text-[#f4cd6c]">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#607678]">Educar · Comunidad</span>
              <span className="block truncate text-base font-bold sm:text-lg">{title}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#47616c] hover:bg-[#f2f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sitio institucional</span>
              <span className="sm:hidden">Web</span>
            </Link>
            <button type="button" aria-label="Cerrar sesión" onClick={() => void handleSignOut()} className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-[#d8dfd8] px-3 text-sm font-semibold text-[#173b54] hover:bg-[#f2f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>

        <nav aria-label="Navegación del portal" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          <Link to={root} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[#e4eee9] px-4 text-sm font-bold text-[#145c58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{audience === 'student' ? 'Mi recorrido' : 'Alumnos vinculados'}</span>
          </Link>
          <Link to="/inscripcion" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#47616c] hover:bg-[#f2f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Solicitar inscripción</span>
          </Link>
          <Link to="/noticias" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#47616c] hover:bg-[#f2f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
            <Newspaper className="h-4 w-4" aria-hidden="true" />
            <span>Novedades</span>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
};
