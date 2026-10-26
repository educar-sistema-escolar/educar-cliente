import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, MessageSquare, Newspaper } from 'lucide-react';
import { getSupabaseAccountSession, type SupabaseAccountSession, signOutSupabase } from '../../features/auth/services/supabaseAuth';

import { InstitutionalLayout } from '../../shared/components/layout/InstitutionalLayout';

export const StudentPortalLayout: React.FC<{ audience: 'student' | 'family' }> = ({ audience }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const root = audience === 'student' ? '/alumnos' : '/familias';
  const title = audience === 'student' ? 'Portal del alumno' : 'Portal de familias';
  const [session, setSession] = useState<SupabaseAccountSession | null>(null);
  useEffect(() => { let active = true; void getSupabaseAccountSession().then(value => { if (active) setSession(value); }); return () => { active = false; }; }, []);
  const isForumPage = audience === 'student' && location.pathname.startsWith('/alumnos/foro');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setLogoutError(null);
    try {
      await signOutSupabase();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('No se pudo cerrar la sesión. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return <InstitutionalLayout role={audience === 'student' ? 'Alumno' : 'Familia'} title={isForumPage ? 'Foro estudiantil' : title} user={session}
    items={[
      { label: audience === 'student' ? 'Mi recorrido' : 'Alumnos vinculados', path: root, icon: BookOpen, end: true },
      ...(audience === 'student' ? [{ label: 'Foro estudiantil', path: '/alumnos/foro', icon: MessageSquare }] : []),
      { label: 'Solicitar inscripción', path: '/inscripcion', icon: GraduationCap },
      { label: 'Novedades', path: '/noticias', icon: Newspaper },
    ]} signingOut={isSigningOut} logoutError={logoutError} onLogout={() => void handleSignOut()}><Outlet /></InstitutionalLayout>;
};
