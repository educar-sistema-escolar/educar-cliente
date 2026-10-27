import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, MessageSquareWarning, MessageSquare, Newspaper, PlusSquare, BookOpen, GraduationCap, School, UserRound, Users, ShieldCheck, ClipboardPenLine, Bus, BarChart3 } from 'lucide-react';
import { InstitutionalLayout } from '../../shared/components/layout/InstitutionalLayout';
import { getSupabaseAdminSession, signOutSupabase } from '../../features/auth/services/supabaseAuth';
import type { AuthSession } from '../../features/auth/types';
import { getEnrollmentStatusCount } from '../../features/inscripcion/services/enrollmentStore';

const NAV_ITEMS = [
  { label: 'Solicitudes', icon: ClipboardList, path: '/privado/solicitudes', badge: true },
  { label: 'Cuentas del Sistema', icon: Users, path: '/privado/cuentas' },
  { label: 'Permisos', icon: ShieldCheck, path: '/privado/permisos' },
  { label: 'Niveles', icon: School, path: '/privado/niveles' },
  { label: 'Cursos', icon: GraduationCap, path: '/privado/cursos' },
  { label: 'Materias', icon: BookOpen, path: '/privado/materias' },
  { label: 'Docentes', icon: UserRound, path: '/privado/docentes' },
  { label: 'Alumnos', icon: Users, path: '/privado/alumnos' },
  { label: 'Registros académicos', icon: ClipboardPenLine, path: '/privado/registros-academicos' },
  { label: 'Servicios', icon: Bus, path: '/privado/servicios' },
  { label: 'Reportes', icon: BarChart3, path: '/privado/reportes' },
  { label: 'Facturación', icon: BarChart3, path: '/privado/facturacion' },
];

const COMMUNITY_ITEMS = [
  { label: 'Opiniones', icon: MessageSquareWarning, path: '/privado/opiniones' },
  { label: 'Comentarios', icon: MessageSquare, path: '/privado/comentarios' },
  { label: 'Noticias', icon: Newspaper, path: '/privado/noticias' },
  { label: 'Crear Noticia', icon: PlusSquare, path: '/privado/crear-noticia' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => { void getSupabaseAdminSession().then(setSession); }, []);
  useEffect(() => {
    let mounted = true;
    const refresh = () => { void getEnrollmentStatusCount('pending').then(count => { if (mounted) setPendingRequests(count); }).catch(() => undefined); };
    refresh(); window.addEventListener('enrollment-updated', refresh);
    return () => { mounted = false; window.removeEventListener('enrollment-updated', refresh); };
  }, []);
  async function logout() {
    setIsSigningOut(true); setLogoutError('');
    try { await signOutSupabase(); navigate('/login', { replace: true }); }
    catch { setLogoutError('No se pudo cerrar la sesión. Verificá tu conexión e intentá nuevamente.'); }
    finally { setIsSigningOut(false); }
  }
  const title = [...NAV_ITEMS, ...COMMUNITY_ITEMS].find(item => location.pathname.startsWith(item.path))?.label
    || (location.pathname.startsWith('/privado/editar-noticia') ? 'Editar noticia' : 'Panel institucional');
  return <InstitutionalLayout role="Director / Administrador" title={title} user={session}
    items={NAV_ITEMS.map(item => ({ ...item, badge: item.badge ? pendingRequests : undefined }))} community={COMMUNITY_ITEMS}
    signingOut={isSigningOut} logoutError={logoutError} onLogout={() => void logout()}><Outlet /></InstitutionalLayout>;
}
