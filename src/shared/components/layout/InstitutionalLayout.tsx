import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import './institutional.css';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

export interface InstitutionalNavItem { label: string; path: string; icon: LucideIcon; badge?: number; end?: boolean }
interface Props {
  role: string;
  title: string;
  user?: { name: string; email?: string } | null;
  items: InstitutionalNavItem[];
  community?: InstitutionalNavItem[];
  signingOut: boolean;
  logoutError?: string | null;
  onLogout: () => void;
  children: ReactNode;
}

export function InstitutionalLayout({ role, title, user, items, community, signingOut, logoutError, onLogout, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const drawer = useAccessibleDialog<HTMLDialogElement>(menuOpen, () => {
    setMenuOpen(false);
    trigger.current?.focus();
  });
  useEffect(() => { if (!menuOpen) drawer.current?.close(); }, [menuOpen, drawer]);
  const location = useLocation();
  const closeMenu = () => { drawer.current?.close(); trigger.current?.focus(); };
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => { if (query.matches) drawer.current?.close(); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, [drawer]);
  const links = (entries: InstitutionalNavItem[]) => entries.map(({ path, label, icon: Icon, badge, end }) => (
    <NavLink key={path} to={path} end={end} onClick={() => { if (drawer.current?.open) closeMenu(); }}>
      <Icon size={19} aria-hidden="true" /><span>{label}</span>{!!badge && <span className="institutional-badge">{badge}</span>}
    </NavLink>
  ));
  const navigation = <>
    <Link to={items[0]?.path || '/'} className="institutional-brand"><img src="/logo/logo%20(6).png" alt="" width="40" height="40" /><span><strong>Educar</strong><small>Para transformar · {role}</small></span></Link>
    <nav aria-label={`Navegación de ${role}`}>
      {links(items)}
      {!!community?.length && <details open={community.some(item => location.pathname.startsWith(item.path)) || undefined} className="institutional-community"><summary><ChevronDown size={18} aria-hidden="true" />Comunidad</summary>{links(community)}</details>}
      <Link to="/" onClick={() => { if (drawer.current?.open) closeMenu(); }}><ArrowLeft size={19} aria-hidden="true" /><span>Sitio institucional</span></Link>
    </nav>
    <div className="institutional-account"><strong>{user?.name || user?.email || role}</strong>{user?.email && user.name && user.email !== user.name && <span>{user.email}</span>}<small>{role} · Cuenta institucional</small>
      <button type="button" disabled={signingOut} aria-busy={signingOut} onClick={onLogout}><LogOut size={18} aria-hidden="true" />{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
    </div>
  </>;
  return <div className="institutional-shell">
    <a className="institutional-skip" href="#institutional-content">Saltar al contenido</a>
    <aside className="institutional-sidebar">{navigation}</aside>
    <dialog ref={drawer} id="institutional-menu" className="institutional-drawer" onToggle={event => setMenuOpen(event.currentTarget.open)} aria-label={`Menú de ${role}`} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="institutional-drawer-content"><button type="button" className="institutional-close" aria-label="Cerrar menú" onClick={closeMenu}><X size={22} aria-hidden="true" /></button>{navigation}</div>
    </dialog>
    <div className="institutional-workspace">
      <header className="institutional-header">
        <button ref={trigger} type="button" className="institutional-menu-trigger" aria-label={`Abrir menú de ${role}`} aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="institutional-menu" onClick={() => drawer.current?.showModal()}><Menu size={22} aria-hidden="true" /></button>
        <div className="institutional-section-title"><strong>{title}</strong><span>Panel institucional</span></div>
        <span className="institutional-role">{role}</span>
      </header>
      <main id="institutional-content" className="institutional-content" tabIndex={-1}>{logoutError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{logoutError}</p>}{children}</main>
    </div>
  </div>;
}
