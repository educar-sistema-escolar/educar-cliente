import './institutional.css';

export function InstitutionalLoadingScreen() {
  // Keep the institutional structure without rendering cached identity or personal content.
  return <div className="institutional-shell" role="status" aria-label="Cargando portal" aria-live="polite" aria-busy="true">
    <span className="sr-only">Preparando tu portal…</span>
    <aside className="institutional-sidebar" aria-hidden="true"><div className="institutional-brand"><strong>Educar</strong></div><div className="space-y-5 p-6">{[1, 2, 3].map(item => <div key={item} className="h-4 rounded bg-white/20" />)}</div></aside>
    <div className="institutional-workspace" aria-hidden="true"><header className="institutional-header"><strong>Educar · Portal institucional</strong></header><div className="institutional-content space-y-5"><div className="h-32 rounded-2xl border border-edu-border bg-white" /><div className="grid gap-5 md:grid-cols-2"><div className="h-56 rounded-2xl border border-edu-border bg-white" /><div className="h-56 rounded-2xl border border-edu-border bg-white" /></div></div></div>
  </div>;
}
