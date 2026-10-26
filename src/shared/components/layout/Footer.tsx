import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  GraduationCap,
  KeyRound,
  Users,
} from 'lucide-react';
import { getConfiguredDemoAccessCards } from '../../utils/demoAccess';

const demoAccessCards = getConfiguredDemoAccessCards();

const demoRoleStyles = {
  superadmin: {
    icon: ShieldCheck,
    badge: 'border-blue-300/30 bg-blue-400/10 text-blue-200',
    iconWrap: 'bg-blue-400/15 text-blue-200',
    button: 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-300',
  },
  teacher: {
    icon: GraduationCap,
    badge: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
    iconWrap: 'bg-cyan-400/15 text-cyan-200',
    button: 'bg-cyan-700 hover:bg-cyan-600 focus-visible:outline-cyan-300',
  },
  family: {
    icon: Users,
    badge: 'border-violet-300/30 bg-violet-400/10 text-violet-200',
    iconWrap: 'bg-violet-400/15 text-violet-200',
    button: 'bg-violet-700 hover:bg-violet-600 focus-visible:outline-violet-300',
  },
  student: {
    icon: GraduationCap,
    badge: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
    iconWrap: 'bg-amber-400/15 text-amber-200',
    button: 'bg-amber-700 hover:bg-amber-600 focus-visible:outline-amber-300',
  },
} as const;

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Niveles', path: '/niveles' },
  { label: 'Noticias', path: '/noticias' },
  { label: 'Registro', path: '/registro' },
  { label: 'Empleo', path: '/empleo' },
];

const quickLinks = [
  { label: 'Quiénes Somos', path: '/quienes-somos' },
  { label: 'Bienestar', path: '/bienestar' },
  { label: 'Inscripción', path: '/inscripcion' },
  { label: 'Opiniones', path: '/opiniones' },
];

const institutionalData = {
  name: 'Educar para Transformar',
  description:
    'Centro educativo comprometido con el desarrollo integral y el futuro de nuestra comunidad.',
  location: 'Resistencia, Chaco',
  address: 'Av. Sarmiento 1250, Resistencia, Chaco',
  phone: '(0362) 445-1820',
  email: 'contacto@educarparatransformar.edu.ar',
  schedule: 'Lunes a Viernes de 7:00 a 18:00 hs.',
  year: '2026',
};

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/educarparatransformar',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/educarparatransformar',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@educarparatransformar',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    href: `mailto:${institutionalData.email}`,
    icon: <Mail size={14} />,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-edu-dark py-12 text-slate-400 border-t border-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 sm:grid-cols-2">
          {/* Column 1: Branding & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo/logo%20(6).png"
                alt="Logo Educar para Transformar"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
              />
              <h4 className="text-sm font-semibold text-white">
                {institutionalData.name}
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {institutionalData.description}
            </p>
            <p className="text-xs text-slate-400">{institutionalData.location}</p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2.5 text-xs">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Contacto
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 text-edu-accent shrink-0" />
                <span>{institutionalData.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-edu-accent shrink-0" />
                <span>{institutionalData.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-edu-accent shrink-0" />
                <span className="break-all">{institutionalData.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={14} className="mt-0.5 text-edu-accent shrink-0" />
                <span>{institutionalData.schedule}</span>
              </li>
            </ul>
          </div>
        </div>

          <section aria-labelledby="demo-access-title" className="mt-10 border-t border-slate-900/60 pt-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 id="demo-access-title" className="text-sm font-bold text-white">Credenciales de Acceso Demo</h3>
                <p className="mt-1 text-xs text-slate-400">Cuentas públicas de prueba para la demostración académica.</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Acceso manual · no inicia sesión automáticamente</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {demoAccessCards.map((account) => {
                const style = demoRoleStyles[account.id];
                const Icon = style.icon;

                return (
                  <article key={account.id} className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}>
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white">{account.role}</h4>
                        <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                          {account.available ? 'Demo activa' : 'No disponible'}
                        </span>
                      </div>
                    </div>

                    {account.available ? (
                      <dl className="mt-4 space-y-2 text-xs">
                        <div>
                          <dt className="font-semibold text-slate-400">Correo electrónico</dt>
                          <dd className="mt-0.5 break-all text-slate-100">{account.email}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-400">Contraseña demo</dt>
                          <dd className="mt-0.5 break-all font-mono text-slate-100">{account.password}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 min-h-12 text-xs leading-relaxed text-slate-300" role="note">{account.message}</p>
                    )}

                    {account.available ? (
                      <Link
                        to={`/login?demo=${account.id}`}
                        aria-label={`Usar credenciales de ${account.role}`}
                        className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${style.button}`}
                      >
                        <KeyRound size={14} aria-hidden="true" />
                        Usar credenciales
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-label={`Usar credenciales de ${account.role}: no disponible`}
                        className={`mt-4 inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-white opacity-50 ${style.button}`}
                      >
                        <KeyRound size={14} aria-hidden="true" />
                        Usar credenciales
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

        {/* Bottom copyright line */}
        <div className="mt-8 border-t border-slate-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>© {institutionalData.year} {institutionalData.name}</span>
            <span>•</span>
            <span>Política de privacidad</span>
            <span>•</span>
            <span>Términos y condiciones</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-500/80 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Sitio seguro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
