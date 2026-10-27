import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays } from 'lucide-react';
import { getSupabaseAccountSession, signOutSupabase, type SupabaseAccountSession } from '../../features/auth/services/supabaseAuth';
import './teacher.css';
import { InstitutionalLayout } from '../../shared/components/layout/InstitutionalLayout';
import { loadTeacherDisplayName } from '../../features/teacher/services/teacherRepository';

export function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<SupabaseAccountSession | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void getSupabaseAccountSession().then(async account => {
      if (!account) { if (active) navigate('/login', { replace: true }); return; }
      const name = await loadTeacherDisplayName(account.profileId).catch(() => null);
      if (active) setSession({ ...account, name: name || (account.name.includes('@') ? 'Docente' : account.name) });
    });
    return () => { active = false; };
  }, [navigate]);
  async function logout() {
    setSigningOut(true); setError('');
    try { await signOutSupabase(); navigate('/login', { replace: true }); }
    catch { setError('No se pudo cerrar la sesión. Intenta nuevamente.'); setSigningOut(false); }
  }
  return <InstitutionalLayout role="Docente" title={location.pathname.endsWith('/agenda') ? 'Agenda semanal' : 'Mis materias'} user={session}
    items={[{ label: 'Mis materias', path: '/docentes', icon: BookOpen, end: true }, { label: 'Agenda semanal', path: '/docentes/agenda', icon: CalendarDays }]}
    signingOut={signingOut} logoutError={error} onLogout={() => void logout()}>
    <div className="teacher-content">{session ? <Outlet context={session} /> : <p role="status" className="teacher-state">Preparando tu espacio docente…</p>}</div>
  </InstitutionalLayout>;
}
