import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Bell,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  MessageSquare,
  Newspaper,
  PlusSquare,
  BookOpen,
  GraduationCap,
  School,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { getSupabaseAdminSession, signOutSupabase } from '../../features/auth/services/supabaseAuth';
import type { AuthSession } from '../../features/auth/types';
import { getEnrollmentStatusCount } from '../../features/inscripcion/services/enrollmentStore';

const NAV_ITEMS = [
  { label: 'Solicitudes', icon: ClipboardList, path: '/privado/solicitudes', badge: true },
  { label: 'Actividades', icon: Activity, path: '/privado/actividades' },
  { label: 'Cuentas del Sistema', icon: Users, path: '/privado/cuentas' },
  { label: 'Niveles', icon: School, path: '/privado/niveles' },
  { label: 'Cursos', icon: GraduationCap, path: '/privado/cursos' },
  { label: 'Materias', icon: BookOpen, path: '/privado/materias' },
  { label: 'Docentes', icon: UserRound, path: '/privado/docentes' },
  { label: 'Alumnos', icon: Users, path: '/privado/alumnos' },
];

const COMMUNITY_ITEMS = [
  { label: 'Opiniones', icon: MessageSquareWarning, path: '/privado/opiniones' },
  { label: 'Comentarios', icon: MessageSquare, path: '/privado/comentarios' },
  { label: 'Noticias', icon: Newspaper, path: '/privado/noticias' },
  { label: 'Crear Noticia', icon: PlusSquare, path: '/privado/crear-noticia' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  useEffect(() => {
    void getSupabaseAdminSession().then(setSession);
  }, []);

  useEffect(() => {
    let mounted = true;
    const refreshPendingRequests = () => {
      void getEnrollmentStatusCount('pending')
      .then((count) => {
        if (mounted) setPendingRequests(count);
      })
      .catch(() => undefined);
    };

    refreshPendingRequests();
    window.addEventListener('enrollment-updated', refreshPendingRequests);
    return () => {
      mounted = false;
      window.removeEventListener('enrollment-updated', refreshPendingRequests);
    };
  }, []);

  const handleLogout = () => {
    void signOutSupabase();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/privado/solicitudes') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isCommunityActive = COMMUNITY_ITEMS.some((item) => isActive(item.path));
  const isCommunityExpanded = isCommunityOpen || isCommunityActive;

  const getPageTitle = () => {
    if (location.pathname === '/privado/solicitudes') return 'Solicitudes de Inscripción';
    if (location.pathname === '/privado/opiniones') return 'Moderación de Opiniones';
    if (location.pathname === '/privado/comentarios') return 'Moderación de Comentarios';
    if (location.pathname === '/privado/noticias') return 'Gestión de Noticias';
    if (location.pathname.startsWith('/privado/crear-noticia')) return 'Nueva Noticia';
    if (location.pathname.startsWith('/privado/editar-noticia')) return 'Editar Noticia';
    if (location.pathname === '/privado/crear-usuario') return 'Crear Cuenta de Alumno';
    if (location.pathname === '/privado/cuentas') return 'Cuentas del Sistema';
    if (location.pathname === '/privado/actividades') return 'Actividades Extracurriculares';
    return 'Panel Institucional';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 font-sans text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="fixed z-30 hidden h-screen w-64 flex-col bg-gradient-to-b from-edu-primary via-edu-primary-light to-edu-primary shadow-2xl border-r border-white/10 md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="relative shrink-0">
            <img
              src="/logo/logo%20(6).png"
              alt="Educar"
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/20"
            />
            <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-edu-primary bg-emerald-500" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight text-white">Educar</h1>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/50">Panel de gestión</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white/10 text-white shadow-lg shadow-black/5'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-edu-accent" />
                  )}
                  <div className={`flex items-center justify-center ${active ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && pendingRequests > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-edu-accent/20 px-1.5 text-[9px] font-bold text-edu-accent">
                      {pendingRequests}
                    </span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
          <div className="mt-2 border-t border-white/10 pt-2">
            <button
              type="button"
              aria-expanded={isCommunityExpanded}
              aria-controls="admin-community-menu"
              onClick={() => setIsCommunityOpen((current) => !current)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isCommunityActive
                  ? 'bg-white/10 text-white shadow-lg shadow-black/5'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <div className={`flex items-center justify-center ${isCommunityActive ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'}`}>
                <Users size={18} />
              </div>
              <span className="flex-1 text-left">Comunidad</span>
              {isCommunityExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
            {isCommunityExpanded && (
              <div id="admin-community-menu" className="mt-1 space-y-0.5 pl-3">
                {COMMUNITY_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-edu-accent/30 to-edu-accent/10 text-xs font-bold text-white">
              {getInitials(session?.name || 'Admin')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-white/80">{session?.name || 'Admin'}</p>
              <p className="truncate text-[9px] text-white/40">{session?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={15} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-edu-primary via-edu-primary-light to-edu-primary shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo/logo%20(6).png"
                  alt="Educar"
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div>
                  <h1 className="text-sm font-bold leading-tight tracking-tight text-white">Educar</h1>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/50">Panel de gestión</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer rounded-xl p-1.5 text-white/50 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-white/10 text-white shadow-lg'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-edu-accent" />
                      )}
                      <div className={`flex items-center justify-center ${active ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && pendingRequests > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-edu-accent/20 px-1.5 text-[9px] font-bold text-edu-accent">
                          {pendingRequests}
                        </span>
                      )}
                    </Link>
                  </React.Fragment>
                );
              })}
              <div className="mt-2 border-t border-white/10 pt-2">
                <button
                  type="button"
                  aria-expanded={isCommunityExpanded}
                  aria-controls="admin-community-menu-mobile"
                  onClick={() => setIsCommunityOpen((current) => !current)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isCommunityActive
                      ? 'bg-white/10 text-white shadow-lg shadow-black/5'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <div className={`flex items-center justify-center ${isCommunityActive ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'}`}>
                    <Users size={18} />
                  </div>
                  <span className="flex-1 text-left">Comunidad</span>
                  {isCommunityExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {isCommunityExpanded && (
                  <div id="admin-community-menu-mobile" className="mt-1 space-y-0.5 pl-3">
                    {COMMUNITY_ITEMS.map((item) => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                            active
                              ? 'bg-white/10 text-white'
                              : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                          }`}
                        >
                          <Icon size={16} className={active ? 'text-edu-accent' : 'text-white/40 group-hover:text-white/60'} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={15} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-edu-accent/15 bg-edu-primary px-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="cursor-pointer rounded-xl p-2 text-white/50 hover:bg-white/10 md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link
              to="/"
              className="hidden md:inline-flex items-center justify-center rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white transition-all"
              title="Volver a la web"
            >
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 shadow-sm">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-bold tracking-tight text-white">
                {getPageTitle()}
              </h2>
              <p className="text-[10px] font-semibold text-white/60">
                {pendingRequests > 0
                  ? `${pendingRequests} solicitud(es) pendiente(s)`
                  : 'Panel institucional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white/80">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {session?.name || 'Admin'}
            </div>
            <button className="relative cursor-pointer rounded-xl p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white">
              <Bell size={16} />
              {pendingRequests > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-edu-primary" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
