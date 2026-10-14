import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, LogOut } from 'lucide-react';
import { getSupabaseAccountSession, signOutSupabase, type SupabaseAccountSession } from '../../features/auth/services/supabaseAuth';
import './teacher.css';

export function TeacherLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SupabaseAccountSession | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void getSupabaseAccountSession().then(account => { if (active) setSession(account); });
    return () => { active = false; };
  }, []);
  async function logout() {
    setSigningOut(true); setError('');
    try { await signOutSupabase(); navigate('/login', { replace: true }); }
    catch { setError('No se pudo cerrar la sesión. Intenta nuevamente.'); setSigningOut(false); }
  }
  return <div className="teacher-shell">
    <a href="#teacher-content" className="teacher-skip">Saltar al contenido</a>
    <aside className="teacher-sidebar">
      <Link to="/docentes" className="teacher-brand"><GraduationCap size={30} /><span>educar<span>ESPACIO DOCENTE</span></span></Link>
      <p className="teacher-nav-label">TU AULA, EN UN SOLO LUGAR</p>
      <nav aria-label="Navegación docente">
        <NavLink to="/docentes" end><BookOpen size={19} /> Mis materias</NavLink>
        <NavLink to="/docentes/agenda"><CalendarDays size={19} /> Agenda semanal</NavLink>
      </nav>
      <div className="teacher-sidebar-bottom">
        <Link to="/" className="teacher-web-link">Sitio institucional <ArrowUpRight size={16} /></Link>
        <div className="teacher-account"><span className="teacher-avatar">{session?.name.charAt(0) || 'D'}</span><div><strong>{session?.name || 'Docente'}</strong><small>Cuenta institucional</small></div></div>
        <button onClick={() => void logout()} disabled={signingOut} className="teacher-logout"><LogOut size={17} />{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
        {error && <p role="alert">{error}</p>}
      </div>
    </aside>
    <main id="teacher-content" className="teacher-main">
      <header className="teacher-topbar"><span><span className="teacher-live-dot" /> Portal docente</span><time>{new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</time></header>
      {session ? <Outlet context={session} /> : <p role="status" className="teacher-state">Preparando tu espacio docente…</p>}
    </main>
  </div>;
}
