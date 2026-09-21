import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Users,
  LogIn,
} from 'lucide-react';
import { getSupabaseAdminSession, loginSuperadmin } from '../../features/auth/services/supabaseAuth';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void getSupabaseAdminSession().then((session) => {
      if (session) navigate('/privado', { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email || !password) {
      setError('Ingresa correo y contraseña para continuar.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await loginSuperadmin(email, password);
      setSuccessMessage('Acceso validado. Redirigiendo al espacio correspondiente...');

      window.setTimeout(() => {
        navigate('/privado', { replace: true });
      }, 700);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-edu-bg text-slate-800">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        {/* Left Visual Banner Section */}
        <section className="hidden bg-gradient-to-br from-edu-dark via-edu-primary to-edu-primary-light px-16 py-14 text-white lg:flex lg:flex-col lg:justify-between relative overflow-hidden">
          {/* Decorative glowing blobs */}
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-edu-secondary/10 blur-3xl" />

          {/* Decorative Dot Matrix Pattern */}
          <div className="absolute right-12 top-1/4 opacity-15 pointer-events-none">
            <svg width="120" height="200" viewBox="0 0 120 200" fill="none">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="2.5" fill="white" />
                </pattern>
              </defs>
              <rect width="120" height="200" fill="url(#dots)" />
            </svg>
          </div>

          {/* School Line Drawing SVG */}
          <svg
            className="absolute bottom-0 right-0 h-80 w-80 text-white/[0.08] pointer-events-none z-0"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            {/* Central Building */}
            <rect x="60" y="80" width="80" height="80" rx="1.5" />
            <rect x="25" y="100" width="35" height="60" rx="1.5" />
            <rect x="140" y="100" width="35" height="60" rx="1.5" />
            
            {/* Pitched Roof */}
            <path d="M 60 80 L 100 52 L 140 80 Z" />
            
            {/* Clock Tower & Clock */}
            <circle cx="100" cy="70" r="7" />
            <line x1="100" y1="66" x2="100" y2="70" />
            <line x1="100" y1="70" x2="103" y2="70" />
            
            {/* Flag Pole */}
            <line x1="100" y1="52" x2="100" y2="32" strokeWidth="1" />
            <path d="M 100 32 L 115 39 L 100 46 Z" fill="currentColor" opacity="0.15" />
            
            {/* Main Entrance Door */}
            <path d="M 92 160 L 92 138 C 92 134, 108 134, 108 138 L 108 160" />
            
            {/* Windows */}
            <rect x="33" y="115" width="18" height="15" rx="1" />
            <rect x="149" y="115" width="18" height="15" rx="1" />
            <rect x="74" y="95" width="15" height="22" rx="1" />
            <rect x="111" y="95" width="15" height="22" rx="1" />
            
            {/* Ground line */}
            <line x1="10" y1="160" x2="190" y2="160" strokeWidth="2" />
            
            {/* Muted decorative trees */}
            <path d="M 15 160 L 15 145 M 10 145 L 20 145 L 15 135 Z" opacity="0.4" />
            <path d="M 185 160 L 185 145 M 180 145 L 190 145 L 185 135 Z" opacity="0.4" />
          </svg>

          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-edu-secondary-light">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-edu-primary text-white">
                <GraduationCap className="h-3 w-3" />
              </span>
              PORTAL EDUCATIVO
            </span>
            <div className="max-w-lg space-y-4 text-left">
              <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
                Educar para <br /> Transformar
              </h1>
              {/* Green Accent Line */}
              <div className="h-[4px] w-14 bg-edu-accent rounded-full" />
              
              <p className="text-[14.5px] leading-relaxed text-edu-secondary-light/80 pt-2">
                Bienvenido al sistema de gestión académica. Desde aquí, familias, alumnos,
                docentes y directivos acceden a sus espacios de comunicación, seguimiento escolar y herramientas institucionales.
              </p>
            </div>
          </div>

          {/* Left panel card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl space-y-4 max-w-[460px] relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-edu-primary text-white shadow-md">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[14.5px] font-bold text-white leading-snug">Gestión Académica Integral</h3>
                <p className="text-[11px] text-edu-secondary-light/80 mt-0.5">Acceso administrativo para superadministradores</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-edu-secondary-light/70">
              El acceso administrativo usa Supabase Auth y valida tu perfil institucional antes de abrir el panel.
            </p>
          </div>

          {/* Left Panel Footer */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-[13.5px] text-edu-secondary-light/90">
              <ShieldCheck className="h-5 w-5 text-edu-accent shrink-0" />
              <span>Seguro, confiable y siempre disponible</span>
            </div>
            <div className="text-[11px] text-edu-secondary-light/40">
              © 2026 Educar para Transformar. Todos los derechos reservados.
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16 bg-edu-bg">
          <div className="w-full max-w-[480px] space-y-6">
            
            {/* Card 1: Login Form */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_15px_45px_rgba(15,45,89,0.04)] space-y-6">
              
              {/* Login Header inside the card */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-edu-secondary/10 text-edu-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-edu-primary">
                    PORTAL EDUCAR
                  </span>
                  <h2 className="text-2xl font-extrabold text-edu-dark leading-tight">
                    Ingresar al portal
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Ingresá con una cuenta institucional activa cuyo perfil tenga el rol superadmin.
                  </p>
                </div>
              </div>

              {/* Error and Success Alerts */}
              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in duration-200">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 animate-in fade-in duration-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    CORREO ELECTRÓNICO
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="usuario@educar.com"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[14.5px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-edu-primary focus:ring-4 focus:ring-edu-primary/5"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    CONTRASEÑA
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tu contraseña"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-[14.5px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-edu-primary focus:ring-4 focus:ring-edu-primary/5"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setError(
                          'Para recuperar tu contraseña, comunícate con la secretaría o el soporte técnico de la institución.'
                        );
                      }}
                      className="text-xs font-semibold text-edu-primary hover:text-edu-secondary-dark hover:underline transition-all duration-200"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative flex h-12 w-full items-center justify-center rounded-xl bg-edu-primary text-sm font-semibold text-white shadow-lg shadow-edu-primary/10 hover:bg-edu-secondary-dark hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Validando acceso...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        <span>Iniciar sesión</span>
                      </div>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card 2: Registration Card */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(15,45,89,0.02)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[14.5px] font-extrabold text-slate-800">
                    ¿Aún no tienes cuenta?
                  </p>
                  <p className="text-xs text-slate-500 leading-normal">
                    Si tu DNI ya existe en la institución, regístrate para ingresar.
                  </p>
                </div>
              </div>
              <Link
                to="/registro"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-edu-primary px-4 text-xs font-bold text-edu-primary hover:bg-edu-secondary/10 transition-all duration-200 shrink-0 cursor-pointer"
              >
                <span>Registro al sistema</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  return <LoginForm />;
};


