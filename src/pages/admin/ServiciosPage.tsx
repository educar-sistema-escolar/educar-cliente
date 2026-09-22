import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Plus, RefreshCw, UserMinus } from 'lucide-react';
import {
  createDiningService,
  createSport,
  createTransportRoute,
  deactivateStudentServiceEnrollment,
  enrollStudentInDining,
  enrollStudentInSportGroup,
  enrollStudentInTransport,
  listDiningServices,
  listDiningUsage,
  listSportGroups,
  listSports,
  listStudentDiningEnrollments,
  listStudentSportEnrollments,
  listStudentTransportEnrollments,
  listTransportRoutes,
  recordDiningUsage,
  updateDiningService,
  updateSport,
  updateTransportRoute,
} from '../../features/admin/services/servicesRepository';
import { listStudents } from '../../features/admin/services/academicRepository';
import type {
  DiningService,
  DiningUsage,
  Sport,
  SportGroup,
  Student,
  StudentDiningEnrollment,
  StudentSportEnrollment,
  StudentTransportEnrollment,
  TransportRoute,
} from '../../features/admin/types';

type Tab = 'sports' | 'transport' | 'dining';

const field = 'mt-1 h-9 w-full rounded-lg border border-edu-border bg-white px-2.5 text-xs outline-none focus:border-edu-secondary';
const currentYear = new Date().getFullYear();
const errorText = (error: unknown) => error instanceof Error ? error.message : 'No se pudo completar la operación.';
const studentName = (student?: { person?: { first_name: string; last_name: string } | null } | null) => student?.person ? `${student.person.first_name} ${student.person.last_name}` : 'Alumno';

export function ServiciosPage() {
  const [tab, setTab] = useState<Tab>('sports');
  const [students, setStudents] = useState<Student[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportGroups, setSportGroups] = useState<SportGroup[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [diningServices, setDiningServices] = useState<DiningService[]>([]);
  const [sportEnrollments, setSportEnrollments] = useState<StudentSportEnrollment[]>([]);
  const [transportEnrollments, setTransportEnrollments] = useState<StudentTransportEnrollment[]>([]);
  const [diningEnrollments, setDiningEnrollments] = useState<StudentDiningEnrollment[]>([]);
  const [usage, setUsage] = useState<DiningUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sportForm, setSportForm] = useState({ code: '', name: '' });
  const [routeForm, setRouteForm] = useState({ route_number: '', name: '', capacity: '30' });
  const [diningForm, setDiningForm] = useState({ code: '', name: '', capacity: '100' });
  const [sportEnrollmentForm, setSportEnrollmentForm] = useState({ student: '', group: '' });
  const [transportEnrollmentForm, setTransportEnrollmentForm] = useState({ student: '', route: '', stop: '' });
  const [diningEnrollmentForm, setDiningEnrollmentForm] = useState({ student: '', service: '', year: String(currentYear) });
  const [usageForm, setUsageForm] = useState({ enrollment: '', date: new Date().toISOString().slice(0, 10), used: 'true' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentRows, sportRows, groupRows, routeRows, diningRows, sportEnrollmentRows, transportEnrollmentRows, diningEnrollmentRows, usageRows] = await Promise.all([
        listStudents(), listSports(), listSportGroups(), listTransportRoutes(), listDiningServices(),
        listStudentSportEnrollments(), listStudentTransportEnrollments(), listStudentDiningEnrollments(), listDiningUsage(),
      ]);
      setStudents(studentRows); setSports(sportRows); setSportGroups(groupRows); setRoutes(routeRows); setDiningServices(diningRows);
      setSportEnrollments(sportEnrollmentRows); setTransportEnrollments(transportEnrollmentRows); setDiningEnrollments(diningEnrollmentRows); setUsage(usageRows);
    } catch (loadError) {
      setError(errorText(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const save = async (action: () => Promise<unknown>, text: string) => {
    setSaving(true); setError(null); setSuccess(null);
    try { await action(); await load(); setSuccess(text); } catch (saveError) { setError(errorText(saveError)); } finally { setSaving(false); }
  };

  const activeStudents = useMemo(() => students.filter((student) => student.is_active), [students]);
  const selectedRoute = routes.find((route) => route.id === transportEnrollmentForm.route);
  const activeSportGroups = sportGroups.filter((group) => group.is_active);
  const activeDiningEnrollments = diningEnrollments.filter((enrollment) => enrollment.is_active);

  const submitSport = (event: FormEvent) => {
    event.preventDefault();
    if (!sportForm.code.trim() || !sportForm.name.trim()) return setError('Completá código y nombre del deporte.');
    void save(() => createSport({ code: sportForm.code.trim(), name: sportForm.name.trim() }), 'Deporte creado correctamente.');
    setSportForm({ code: '', name: '' });
  };

  const submitRoute = (event: FormEvent) => {
    event.preventDefault();
    const routeNumber = Number(routeForm.route_number); const capacity = Number(routeForm.capacity);
    if (!Number.isInteger(routeNumber) || routeNumber < 1 || routeNumber > 4 || !routeForm.name.trim() || !Number.isInteger(capacity) || capacity < 1) return setError('Completá ruta (1 a 4), nombre y capacidad válida.');
    void save(() => createTransportRoute({ route_number: routeNumber, name: routeForm.name.trim(), capacity }), 'Ruta creada correctamente.');
    setRouteForm({ route_number: '', name: '', capacity: '30' });
  };

  const submitDining = (event: FormEvent) => {
    event.preventDefault();
    const capacity = Number(diningForm.capacity);
    if (!diningForm.code.trim() || !diningForm.name.trim() || !Number.isInteger(capacity) || capacity < 1) return setError('Completá código, nombre y capacidad válida.');
    void save(() => createDiningService({ code: diningForm.code.trim(), name: diningForm.name.trim(), capacity }), 'Servicio de comedor creado correctamente.');
    setDiningForm({ code: '', name: '', capacity: '100' });
  };

  const submitSportEnrollment = (event: FormEvent) => {
    event.preventDefault();
    if (!sportEnrollmentForm.student || !sportEnrollmentForm.group) return setError('Seleccioná alumno y grupo deportivo.');
    void save(() => enrollStudentInSportGroup(sportEnrollmentForm.student, sportEnrollmentForm.group), 'Inscripción deportiva creada.');
  };

  const submitTransportEnrollment = (event: FormEvent) => {
    event.preventDefault();
    if (!transportEnrollmentForm.student || !transportEnrollmentForm.route) return setError('Seleccioná alumno y recorrido.');
    void save(() => enrollStudentInTransport(transportEnrollmentForm.student, transportEnrollmentForm.route, transportEnrollmentForm.stop || null), 'Inscripción de transporte creada.');
  };

  const submitDiningEnrollment = (event: FormEvent) => {
    event.preventDefault();
    const year = Number(diningEnrollmentForm.year);
    if (!diningEnrollmentForm.student || !diningEnrollmentForm.service || !Number.isInteger(year) || year < 1) return setError('Seleccioná alumno, servicio y un año válido.');
    void save(() => enrollStudentInDining(diningEnrollmentForm.student, diningEnrollmentForm.service, year), 'Inscripción al comedor creada.');
  };

  const submitUsage = (event: FormEvent) => {
    event.preventDefault();
    if (!usageForm.enrollment || !usageForm.date) return setError('Seleccioná una inscripción y fecha de uso.');
    void save(() => recordDiningUsage({ dining_enrollment_id: usageForm.enrollment, service_date: usageForm.date, used: usageForm.used === 'true' }), 'Uso de comedor registrado.');
  };

  const deactivate = (table: 'sport' | 'transport' | 'dining', id: string) => void save(() => deactivateStudentServiceEnrollment(table, id), 'Inscripción desactivada.');
  const toggleSport = (sport: Sport) => void save(() => updateSport(sport.id, { is_active: !sport.is_active }), `Deporte ${sport.is_active ? 'desactivado' : 'activado'}.`);
  const toggleRoute = (route: TransportRoute) => void save(() => updateTransportRoute(route.id, { is_active: !route.is_active }), `Ruta ${route.is_active ? 'desactivada' : 'activada'}.`);
  const toggleDining = (service: DiningService) => void save(() => updateDiningService(service.id, { is_active: !service.is_active }), `Servicio ${service.is_active ? 'desactivado' : 'activado'}.`);

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-edu-muted"><RefreshCw className="animate-spin" size={16} />Cargando servicios...</div>;

  return <div className="space-y-5">
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span>
      <h1 className="mt-1 text-lg font-bold text-edu-primary">Servicios institucionales</h1>
      <p className="mt-1 text-xs leading-relaxed text-edu-muted">Catálogos, inscripciones deportivas, transporte y comedor conectados a Supabase.</p>
    </section>
    {(error || success) && <div role="status" aria-live="polite" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}><span>{error ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}</span><span>{error || success}</span>{error && <button className="ml-auto font-bold underline" onClick={() => void load()}>Reintentar</button>}</div>}
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Servicios">
      {([['sports', 'Deportes'], ['transport', 'Transporte'], ['dining', 'Comedor']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} type="button" onClick={() => { setTab(value); setError(null); }} className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === value ? 'bg-edu-primary text-white' : 'border border-edu-border bg-white text-edu-muted'}`}>{label}</button>)}
    </div>

    {tab === 'sports' && <>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Catálogo de deportes</h2><form onSubmit={submitSport} className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-semibold">Código<input className={field} value={sportForm.code} onChange={(event) => setSportForm({ ...sportForm, code: event.target.value })} /></label><label className="text-[11px] font-semibold">Nombre<input className={field} value={sportForm.name} onChange={(event) => setSportForm({ ...sportForm, name: event.target.value })} /></label><button disabled={saving} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50 sm:col-span-2"><Plus size={14} />Agregar deporte</button></form><CatalogList items={sports} onToggle={toggleSport} /></div>
        <div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-edu-primary">Grupos deportivos</h2><span className="text-[11px] text-edu-muted">{sportGroups.length} grupos</span></div><div className="mt-3 space-y-2">{sportGroups.length === 0 ? <Empty text="No hay grupos deportivos." /> : sportGroups.map((group) => <article key={group.id} className="rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><div className="flex flex-wrap justify-between gap-2"><strong>{group.sport?.name ?? 'Deporte'} · {group.name}</strong><span>{group.academic_year} · {group.capacity} cupos</span></div><p className="mt-1 text-[11px] text-edu-muted">{group.level?.name ?? 'Todos los niveles'}{group.teacher?.person ? ` · ${group.teacher.person.first_name} ${group.teacher.person.last_name}` : ''} · {group.is_active ? 'Activo' : 'Inactivo'}</p></article>)}</div></div>
      </section>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en deporte</h2><form onSubmit={submitSportEnrollment} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><StudentSelect value={sportEnrollmentForm.student} students={activeStudents} onChange={(student) => setSportEnrollmentForm({ ...sportEnrollmentForm, student })} /><label className="text-[11px] font-semibold">Grupo<select className={field} value={sportEnrollmentForm.group} onChange={(event) => setSportEnrollmentForm({ ...sportEnrollmentForm, group: event.target.value })}><option value="">Seleccioná</option>{activeSportGroups.map((group) => <option key={group.id} value={group.id}>{group.sport?.name ?? 'Deporte'} · {group.name} · {group.academic_year}</option>)}</select></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones deportivas." items={sportEnrollments} onDeactivate={(id) => deactivate('sport', id)} render={(item) => <>{studentName(item.student)} · {item.sport_group?.sport?.name ?? 'Deporte'} / {item.sport_group?.name ?? 'Grupo'} · {item.academic_year}</>} /></section>
    </>}

    {tab === 'transport' && <>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Recorridos de transporte</h2><form onSubmit={submitRoute} className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Ruta (1–4)<input className={field} type="number" min="1" max="4" value={routeForm.route_number} onChange={(event) => setRouteForm({ ...routeForm, route_number: event.target.value })} /></label><label className="text-[11px] font-semibold">Nombre<input className={field} value={routeForm.name} onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })} /></label><label className="text-[11px] font-semibold">Capacidad<input className={field} type="number" min="1" value={routeForm.capacity} onChange={(event) => setRouteForm({ ...routeForm, capacity: event.target.value })} /></label><Submit disabled={saving}>Agregar recorrido</Submit></form><div className="mt-4 grid gap-2 md:grid-cols-2">{routes.length === 0 ? <Empty text="No hay recorridos configurados." /> : routes.map((route) => <article key={route.id} className="rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><strong>Ruta {route.route_number} · {route.name}</strong><button type="button" disabled={saving} onClick={() => toggleRoute(route)} className="text-[11px] font-semibold text-edu-secondary">{route.is_active ? 'Desactivar' : 'Activar'}</button></div><p className="mt-1 text-[11px] text-edu-muted">{route.capacity} cupos · {route.stops.length} paradas · {route.is_active ? 'Activo' : 'Inactivo'}</p><p className="mt-1 text-[11px] text-edu-muted">{route.stops.sort((a, b) => a.stop_order - b.stop_order).map((stop) => stop.name).join(' · ') || 'Sin paradas'}</p></article>)}</div></section>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en transporte</h2><form onSubmit={submitTransportEnrollment} className="mt-3 grid gap-3 md:grid-cols-3 md:items-end"><StudentSelect value={transportEnrollmentForm.student} students={activeStudents} onChange={(student) => setTransportEnrollmentForm({ ...transportEnrollmentForm, student })} /><label className="text-[11px] font-semibold">Recorrido<select className={field} value={transportEnrollmentForm.route} onChange={(event) => setTransportEnrollmentForm({ ...transportEnrollmentForm, route: event.target.value, stop: '' })}><option value="">Seleccioná</option>{routes.filter((route) => route.is_active).map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select></label><label className="text-[11px] font-semibold">Parada<select className={field} value={transportEnrollmentForm.stop} onChange={(event) => setTransportEnrollmentForm({ ...transportEnrollmentForm, stop: event.target.value })}><option value="">Sin parada</option>{selectedRoute?.stops.filter((stop) => stop.is_active).sort((a, b) => a.stop_order - b.stop_order).map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}</select></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones de transporte." items={transportEnrollments} onDeactivate={(id) => deactivate('transport', id)} render={(item) => <>{studentName(item.student)} · Ruta {item.route?.route_number ?? '—'} {item.route?.name ?? ''} · {item.stop?.name ?? 'Sin parada'} · {item.academic_year}</>} /></section>
    </>}

    {tab === 'dining' && <>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Servicios de comedor</h2><form onSubmit={submitDining} className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Código<input className={field} value={diningForm.code} onChange={(event) => setDiningForm({ ...diningForm, code: event.target.value })} /></label><label className="text-[11px] font-semibold">Nombre<input className={field} value={diningForm.name} onChange={(event) => setDiningForm({ ...diningForm, name: event.target.value })} /></label><label className="text-[11px] font-semibold">Capacidad<input className={field} type="number" min="1" value={diningForm.capacity} onChange={(event) => setDiningForm({ ...diningForm, capacity: event.target.value })} /></label><Submit disabled={saving}>Agregar servicio</Submit></form><CatalogList items={diningServices} onToggle={toggleDining} showCapacity /></section>
      <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en comedor</h2><form onSubmit={submitDiningEnrollment} className="mt-3 grid gap-3"><StudentSelect value={diningEnrollmentForm.student} students={activeStudents} onChange={(student) => setDiningEnrollmentForm({ ...diningEnrollmentForm, student })} /><label className="text-[11px] font-semibold">Servicio<select className={field} value={diningEnrollmentForm.service} onChange={(event) => setDiningEnrollmentForm({ ...diningEnrollmentForm, service: event.target.value })}><option value="">Seleccioná</option>{diningServices.filter((service) => service.is_active).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label className="text-[11px] font-semibold">Año académico<input className={field} type="number" min="1" value={diningEnrollmentForm.year} onChange={(event) => setDiningEnrollmentForm({ ...diningEnrollmentForm, year: event.target.value })} /></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones de comedor." items={diningEnrollments} onDeactivate={(id) => deactivate('dining', id)} render={(item) => <>{studentName(item.student)} · {item.dining_service?.name ?? 'Servicio'} · {item.academic_year}</>} /></div><div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Registrar uso de comedor</h2><form onSubmit={submitUsage} className="mt-3 grid gap-3"><label className="text-[11px] font-semibold">Inscripción<select className={field} value={usageForm.enrollment} onChange={(event) => setUsageForm({ ...usageForm, enrollment: event.target.value })}><option value="">Seleccioná</option>{activeDiningEnrollments.map((enrollment) => <option key={enrollment.id} value={enrollment.id}>{studentName(enrollment.student)} · {enrollment.dining_service?.name}</option>)}</select></label><label className="text-[11px] font-semibold">Fecha<input className={field} type="date" value={usageForm.date} onChange={(event) => setUsageForm({ ...usageForm, date: event.target.value })} /></label><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={usageForm.used === 'true'} onChange={(event) => setUsageForm({ ...usageForm, used: String(event.target.checked) })} />Usó el servicio</label><Submit disabled={saving}>Guardar uso</Submit></form><div className="mt-4 space-y-2">{usage.length === 0 ? <Empty text="No hay usos registrados." /> : usage.slice(0, 20).map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span>{studentName(item.enrollment?.student)} · {item.service_date}</span><strong className={item.used ? 'text-emerald-700' : 'text-slate-500'}>{item.used ? 'Usó' : 'No usó'}</strong></div>)}</div></div></section>
    </>}
  </div>;
}

function StudentSelect({ value, students, onChange }: { value: string; students: Student[]; onChange: (value: string) => void }) {
  return <label className="text-[11px] font-semibold">Alumno<select aria-label="Alumno" className={field} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Seleccioná</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person.first_name} {student.person.last_name}</option>)}</select></label>;
}

function Submit({ disabled, children }: { disabled: boolean; children: string }) {
  return <button type="submit" disabled={disabled} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50"><Plus size={14} />{children}</button>;
}

function Empty({ text }: { text: string }) { return <p className="py-5 text-center text-xs text-edu-muted">{text}</p>; }

function CatalogList<T extends Sport | DiningService>({ items, onToggle, showCapacity = false }: { items: T[]; onToggle: (item: T) => void; showCapacity?: boolean }) {
  return <div className="mt-4 space-y-2">{items.length === 0 ? <Empty text="No hay registros en el catálogo." /> : items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span><strong>{item.name}</strong> <span className="text-edu-muted">· {item.code}{showCapacity && 'capacity' in item ? ` · ${item.capacity} cupos` : ''}</span></span><button type="button" onClick={() => onToggle(item)} className={`text-[11px] font-semibold ${item.is_active ? 'text-red-600' : 'text-edu-secondary'}`}>{item.is_active ? 'Desactivar' : 'Activar'}</button></div>)}</div>;
}

function EnrollmentList<T extends { id: string; is_active: boolean }>({ items, empty, onDeactivate, render }: { items: T[]; empty: string; onDeactivate: (id: string) => void; render: (item: T) => ReactNode }) {
  return <div className="mt-4 space-y-2">{items.length === 0 ? <Empty text={empty} /> : items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span>{render(item)}</span>{item.is_active && <button type="button" onClick={() => onDeactivate(item.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><UserMinus size={13} />Desactivar</button>}</div>)}</div>;
}
