import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpenCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  School,
  Users,
} from 'lucide-react';
import {
  clearSession,
  getRoleAreaLabel,
  getRoleHomePath,
  getRoleLabel,
  getSession,
} from '../../../features/auth/services/demoAuth';
import type { DemoUserRole } from '../../../features/auth/types';

const navigationLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Quiénes Somos', path: '/quienes-somos' },
  { label: 'Niveles', path: '/niveles' },
  { label: 'Bienestar', path: '/bienestar' },
  { label: 'Noticias', path: '/noticias' },
  { label: 'Inscripción', path: '/inscripcion' },
  { label: 'Opiniones', path: '/opiniones' },
];

function getRoleIcon(role: DemoUserRole) {
  switch (role) {
    case 'superadmin':
      return <LayoutDashboard size={14} />;
    case 'teacher':
      return <School size={14} />;
    case 'parent':
      return <Users size={14} />;
    case 'student':
    default:
      return <MessageSquare size={14} />;
  }
}

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<DemoUserRole | null>(null);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      setRole(null);
      setUserName('');
      return;
    }

    setRole(session.role);
    setUserName(session.name);
  }, [location.pathname]);

  const handleLogout = () => {
    clearSession();
    setRole(null);
    setUserName('');
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-edu-primary text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <img
            src="/logo/logo%20(6).png"
            alt="Logo Educar para Transformar"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white via-white to-edu-secondary-light bg-clip-text text-transparent">
            Educar para Transformar
          </span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {navigationLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3.5 py-1.5 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden hover:bg-white/10 hover:text-white ${
                  isActive
                    ? 'text-white bg-white/15 font-semibold'
                    : 'text-white/85'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-edu-magenta rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div>
          {role ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((current) => !current)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-edu-secondary/20 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-edu-secondary/35"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold uppercase text-edu-primary shadow-sm">
                  {userName.charAt(0)}
                </div>
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {userName}
                </span>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-2 text-left text-slate-800 shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-2">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {userName}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        {role ? getRoleLabel(role) : ''}
                      </p>
                    </div>
                    <Link
                      to={getRoleHomePath(role)}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-edu-primary"
                    >
                      {getRoleIcon(role)}
                      <span>{getRoleAreaLabel(role)}</span>
                    </Link>
                    <Link
                      to="/inscripcion"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-edu-primary"
                    >
                      <BookOpenCheck size={14} />
                      <span>Inscripción pública</span>
                    </Link>

                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded bg-edu-secondary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-edu-secondary/90"
            >
              <LogIn size={16} />
              <span>Acceso Privado</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
