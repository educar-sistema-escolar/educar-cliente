import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { MainLayout } from './shared/components/layout/MainLayout';
import { ScrollToTop } from './shared/components/ScrollToTop';
import { AdminLayout } from './pages/admin/AdminLayout';
import { TeacherLayout } from './pages/teacher/TeacherLayout';
import { getRoleHomePath } from './features/auth/services/demoAuth';

import {
  getSupabaseAccountSession,
  subscribeToSupabaseAuth,
  type SupabaseAccountSession,
} from './features/auth/services/supabaseAuth';
import { StudentPortalLayout } from './pages/student/StudentPortalLayout';
import { ForoLayout } from './pages/foro/ForoLayout';

const HomePage = lazy(() => import('./pages/home/HomePage').then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('./pages/about/AboutPage').then((module) => ({ default: module.AboutPage })));
const LevelsPage = lazy(() => import('./pages/levels/LevelsPage').then((module) => ({ default: module.LevelsPage })));
const BienestarPage = lazy(() => import('./pages/BienestarPage').then((module) => ({ default: module.BienestarPage })));
const NewsPage = lazy(() => import('./pages/news/NewsPage').then((module) => ({ default: module.NewsPage })));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage').then((module) => ({ default: module.JobsPage })));
const LoginPage = lazy(() => import('./pages/login/LoginPage').then((module) => ({ default: module.LoginPage })));
const EnrollmentPage = lazy(() => import('./pages/enrollment/EnrollmentPage').then((module) => ({ default: module.EnrollmentPage })));
const OpinionsPage = lazy(() => import('./pages/opiniones/OpinionsPage').then((module) => ({ default: module.OpinionsPage })));
const RegistrationPage = lazy(() => import('./pages/registration/RegistrationPage').then((module) => ({ default: module.RegistrationPage })));
const CommentsModerationPage = lazy(() => import('./pages/admin/CommentsModerationPage').then((module) => ({ default: module.CommentsModerationPage })));
const GestionNoticiasPage = lazy(() => import('./pages/admin/GestionNoticiasPage').then((module) => ({ default: module.GestionNoticiasPage })));
const CrearNoticiaPage = lazy(() => import('./pages/admin/CrearNoticiaPage').then((module) => ({ default: module.CrearNoticiaPage })));
const EnrollmentRequestsPage = lazy(() => import('./pages/admin/EnrollmentRequestsPage').then((module) => ({ default: module.EnrollmentRequestsPage })));
const OpinionModerationPage = lazy(() => import('./pages/admin/OpinionModerationPage').then((module) => ({ default: module.OpinionModerationPage })));
const CuentasDelSistemaPage = lazy(() => import('./pages/admin/CuentasDelSistemaPage').then((module) => ({ default: module.CuentasDelSistemaPage })));
const TeacherAgendaPage = lazy(() => import('./pages/teacher/TeacherAgendaPage').then((module) => ({ default: module.TeacherAgendaPage })));
const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage').then((module) => ({ default: module.TeacherDashboardPage })));
const AcademicMasterDataPage = lazy(() => import('./pages/admin/AcademicMasterDataPage').then((module) => ({ default: module.AcademicMasterDataPage })));
const PermisosPage = lazy(() => import('./pages/admin/PermisosPage').then((module) => ({ default: module.PermisosPage })));
const AcademicRecordsPage = lazy(() => import('./pages/admin/AcademicRecordsPage').then((module) => ({ default: module.AcademicRecordsPage })));
const ServiciosPage = lazy(() => import('./pages/admin/ServiciosPage').then((module) => ({ default: module.ServiciosPage })));
const BillingPage = lazy(() => import('./pages/admin/BillingPage').then((module) => ({ default: module.BillingPage })));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const StudentPortalPage = lazy(() => import('./pages/student/StudentPortalPage').then((module) => ({ default: module.StudentPortalPage })));
const ForoFeedPage = lazy(() => import('./pages/foro/ForoFeedPage').then((module) => ({ default: module.ForoFeedPage })));
const ForoThreadPage = lazy(() => import('./pages/foro/ForoThreadPage').then((module) => ({ default: module.ForoThreadPage })));

const PublicLayout = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const SupabaseAdminRoute = ({ children }: { children: ReactNode }) => {
  const [sessionState, setSessionState] = useState<{
    loading: boolean;
    session: SupabaseAccountSession | null;
  }>({ loading: true, session: null });

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const session = await getSupabaseAccountSession();
      if (mounted) {
        setSessionState({ loading: false, session });
      }
    };

    void refresh();
    const unsubscribe = subscribeToSupabaseAuth(() => void refresh());
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (sessionState.loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Validando sesión...</div>;
  }

  if (!sessionState.session) return <Navigate to="/login" replace />;
  if (sessionState.session.role !== 'superadmin') return <Navigate to={getRoleHomePath(sessionState.session.role)} replace />;
  return <>{children}</>;
};

const SupabasePortalRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<SupabaseAccountSession['role']>;
  children: ReactNode;
}) => {
  const [session, setSession] = useState<SupabaseAccountSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const account = await getSupabaseAccountSession();
      if (mounted) {
        setSession(account);
        setLoading(false);
      }
    };

    void refresh();
    const unsubscribe = subscribeToSupabaseAuth(() => void refresh());
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500" role="status">Validando sesión institucional...</div>;
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(session.role)) return <Navigate to={getRoleHomePath(session.role)} replace />;

  return <>{children}</>;
};

const LegacyForumRedirect = () => {
  const location = useLocation();
  const [session, setSession] = useState<SupabaseAccountSession | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    void getSupabaseAccountSession().then((account) => {
      if (mounted) {
        setSession(account);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (loading) return <div className="p-8 text-sm text-slate-600" role="status">Abriendo el portal institucional...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'student') return <Navigate to={getRoleHomePath(session.role)} replace />;
  const canonicalPath = location.pathname.replace(/^\/privado\/foro(?=\/|$)/, '/alumnos/foro');
  return <Navigate to={`${canonicalPath}${location.search}${location.hash}`} replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600" role="status" aria-live="polite">Cargando pantalla…</div>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
          <Route path="/niveles" element={<LevelsPage />} />
          <Route path="/bienestar" element={<BienestarPage />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/empleo" element={<JobsPage />} />
          <Route path="/inscripcion" element={<EnrollmentPage />} />
          <Route path="/registro" element={<RegistrationPage />} />
          <Route path="/opiniones" element={<OpinionsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          path="/privado"
          element={
            <SupabaseAdminRoute>
              <AdminLayout />
            </SupabaseAdminRoute>
          }
        >
          <Route index element={<Navigate to="niveles" replace />} />
          <Route path="solicitudes" element={<EnrollmentRequestsPage />} />
          <Route path="opiniones" element={<OpinionModerationPage />} />
          <Route path="noticias" element={<GestionNoticiasPage />} />
          <Route path="crear-noticia" element={<CrearNoticiaPage />} />
          <Route path="editar-noticia/:id" element={<CrearNoticiaPage />} />
          <Route path="cuentas" element={<CuentasDelSistemaPage />} />
          <Route path="crear-usuario" element={<Navigate to="../cuentas" replace />} />
          <Route path="permisos" element={<PermisosPage />} />
          <Route path="registros-academicos" element={<AcademicRecordsPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="facturacion" element={<BillingPage />} />
          <Route path="actividades" element={<Navigate to="servicios" replace />} />
          <Route path="comentarios" element={<CommentsModerationPage />} />
          <Route path="niveles" element={<AcademicMasterDataPage key="levels" resource="levels" />} />
          <Route path="cursos" element={<AcademicMasterDataPage key="courses" resource="courses" />} />
          <Route path="materias" element={<AcademicMasterDataPage key="subjects" resource="subjects" />} />
          <Route path="docentes" element={<AcademicMasterDataPage key="teachers" resource="teachers" />} />
          <Route path="alumnos" element={<AcademicMasterDataPage key="students" resource="students" />} />
        </Route>

        <Route path="/privado/foro/*" element={
          <SupabasePortalRoute allowedRoles={['student', 'parent']}>
            <LegacyForumRedirect />
          </SupabasePortalRoute>
        } />

        <Route path="/alumnos" element={
          <SupabasePortalRoute allowedRoles={['student']}>
            <StudentPortalLayout audience="student" />
          </SupabasePortalRoute>
        }>
          <Route index element={<StudentPortalPage audience="student" />} />
          <Route path="foro" element={<ForoLayout />}>
            <Route index element={<ForoFeedPage />} />
            <Route path="discusion/:id" element={<ForoThreadPage />} />
            <Route path="*" element={<Navigate to="/alumnos/foro" replace />} />
          </Route>
        </Route>

        <Route
          path="/docentes"
          element={
            <SupabasePortalRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </SupabasePortalRoute>
          }
        >
          <Route index element={<TeacherDashboardPage />} />
          <Route path="agenda" element={<TeacherAgendaPage />} />
          <Route path="*" element={<Navigate to="/docentes" replace />} />
        </Route>

        <Route path="/familias" element={
          <SupabasePortalRoute allowedRoles={['parent']}>
            <StudentPortalLayout audience="family" />
          </SupabasePortalRoute>
        }>
          <Route index element={<StudentPortalPage audience="family" />} />
        </Route>
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
