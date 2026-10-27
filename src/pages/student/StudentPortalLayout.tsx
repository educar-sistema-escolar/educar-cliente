import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, Newspaper } from 'lucide-react';
import { getStudentDisplayName, signOutSupabase } from '../../features/auth/services/supabaseAuth';

import { usePortalSession } from '../../features/auth/services/portalSessionContext';
import { StudentChatbot } from '../../features/chatbot/StudentChatbot';
import { ChatbotRepositoryError, lookupStudentChatbotServices } from '../../features/chatbot/chatbotRepository';
import { studentPortalDestination } from '../../features/student/services/studentPortalNavigation';
import { InstitutionalLayout } from '../../shared/components/layout/InstitutionalLayout';

export const StudentPortalLayout: React.FC<{ audience: 'student' | 'family' }> = ({ audience }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const root = audience === 'student' ? '/alumnos' : '/familias';
  const title = audience === 'student' ? 'Portal del alumno' : 'Portal de familias';
  const portal = usePortalSession();
  const session = portal?.account ?? null;
  const [displayName, setDisplayName] = useState<{ profileId: string; name: string } | null>(null);
  useEffect(() => {
    if (!session || audience !== 'student') return;
    const controller = new AbortController();
    void getStudentDisplayName(session, controller.signal).then(name => {
      if (!controller.signal.aborted) setDisplayName({ profileId: session.profileId, name });
    }).catch(() => { /* Cancellation must not restore a previous account's display name. */ });
    return () => controller.abort();
  }, [session, audience]);
  const name = displayName?.profileId === session?.profileId ? displayName?.name : session?.name;
  const user = session ? { ...session, name: name ?? '' } : null;
  const isForumPage = audience === 'student' && location.pathname.startsWith('/alumnos/foro');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setLogoutError(null);
    try {
      await signOutSupabase();
      portal?.invalidate();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('No se pudo cerrar la sesión. Verificá tu conexión e intentá nuevamente.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return <InstitutionalLayout role={audience === 'student' ? 'Alumno' : 'Familia'} title={isForumPage ? 'Foro estudiantil' : title} user={user}
    items={[
      { label: audience === 'student' ? 'Mi recorrido' : 'Alumnos vinculados', path: root, icon: BookOpen, end: true },
      ...(audience === 'student' ? [{ label: 'Foro estudiantil', path: '/alumnos/foro', icon: MessageSquare }] : []),
      { label: 'Novedades', path: '/noticias', icon: Newspaper },
    ]} signingOut={isSigningOut} logoutError={logoutError} onLogout={() => void handleSignOut()}><Outlet /><p id="student-navigation-status" role="status" aria-live="polite" className="sr-only" />
      {audience === 'student' && !isSigningOut && portal?.account.role === 'student' && portal.account.authSource === 'supabase' && <StudentChatbot
        accountId={portal.account.profileId} studentName={name ?? ''}
        getErrorMessage={error => error instanceof ChatbotRepositoryError && (error.code === 'LINKAGE_REQUIRED' || error.code === 'LINKAGE_AMBIGUOUS') ? error.message : undefined}
        onLookup={async (topic, signal) => {
          try { return await lookupStudentChatbotServices(topic, signal); }
          catch (error) {
            if (!signal.aborted && error instanceof ChatbotRepositoryError && ['SESSION_REQUIRED', 'STUDENT_REQUIRED', 'SESSION_CHANGED'].includes(error.code)) portal.revalidate();
            throw error;
          }
        }}
        onNavigate={target => { const destination = studentPortalDestination(target); if (destination) navigate(destination); }}
      />}
    </InstitutionalLayout>;
};
