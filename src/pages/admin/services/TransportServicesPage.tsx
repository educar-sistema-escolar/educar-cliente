import { useRef, useState, type FormEvent } from 'react';
import { createTransportRoute, createTransportStop, enrollStudentInTransport, setServiceEnrollmentActive, updateTransportRoute, updateTransportStop } from '../../../features/admin/services/servicesRepository';
import type { SportGroup, SportGroupSchedule, Student, StudentSportEnrollment, StudentTransportEnrollment, TransportRoute } from '../../../features/admin/types';
import { Empty, EnrollmentList, StudentSelect, Submit } from './ServicePageParts';
import { field, studentName } from './ServicePageUtils';
import { ServiceRequestsPanel } from './ServiceRequestsPanel';

type Save = (action: () => Promise<unknown>, text: string) => void;

export function TransportServicesPage({ students, routes, transportEnrollments, saving, save, setError, sportGroups, sportSchedules, sportEnrollments, onChanged }: { students: Student[]; routes: TransportRoute[]; transportEnrollments: StudentTransportEnrollment[]; saving: boolean; save: Save; setError: (message: string) => void; sportGroups: SportGroup[]; sportSchedules: SportGroupSchedule[]; sportEnrollments: StudentSportEnrollment[]; onChanged: () => Promise<void> }) {
  const [routeForm, setRouteForm] = useState({ route_number: '', name: '', capacity: '30' });
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({ route: '', name: '', order: '1' });
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const routeEditTrigger = useRef<HTMLButtonElement | null>(null);
  const stopEditTrigger = useRef<HTMLButtonElement | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ student: '', route: '', stop: '', year: String(new Date().getFullYear()) });
  const activeStudents = students.filter((student) => student.is_active);
  const selectedRoute = routes.find((route) => route.id === enrollmentForm.route);
  const submitRoute = (event: FormEvent) => {
    event.preventDefault();
    const routeNumber = Number(routeForm.route_number); const capacity = Number(routeForm.capacity);
    if (!Number.isInteger(routeNumber) || routeNumber < 1 || routeNumber > 4 || !routeForm.name.trim() || !Number.isInteger(capacity) || capacity < 1) return setError('Completá ruta (1 a 4), nombre y capacidad válida.');
    void save(() => editingRoute
      ? updateTransportRoute(editingRoute, { route_number: routeNumber, name: routeForm.name.trim(), capacity })
      : createTransportRoute({ route_number: routeNumber, name: routeForm.name.trim(), capacity }), editingRoute ? 'Ruta actualizada correctamente.' : 'Ruta creada correctamente.');
    setRouteForm({ route_number: '', name: '', capacity: '30' });
    setEditingRoute(null);
  };
  const submitEnrollment = (event: FormEvent) => {
    event.preventDefault();
    if (!enrollmentForm.student || !enrollmentForm.route || !Number.isInteger(Number(enrollmentForm.year)) || Number(enrollmentForm.year) < 1900 || Number(enrollmentForm.year) > 2200) return setError('Seleccioná alumno, recorrido y un ciclo lectivo válido.');
    void save(() => enrollStudentInTransport(enrollmentForm.student, enrollmentForm.route, enrollmentForm.stop || null, Number(enrollmentForm.year)), 'Inscripción de transporte creada.');
  };
  const submitStop = (event: FormEvent) => {
    event.preventDefault();
    const order = Number(stopForm.order);
    if (!stopForm.route || !stopForm.name.trim() || !Number.isInteger(order) || order < 1) return setError('Completá recorrido, nombre y orden válido para la parada.');
    void save(() => editingStop
      ? updateTransportStop(editingStop, { name: stopForm.name.trim(), stop_order: order })
      : createTransportStop({ route_id: stopForm.route, name: stopForm.name.trim(), stop_order: order }), editingStop ? 'Parada actualizada correctamente.' : 'Parada creada correctamente.');
    setStopForm({ ...stopForm, name: '', order: String(order + 1) });
    setEditingStop(null);
  };
  return <>
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-edu-primary">Recorridos de transporte</h2>
      <form onSubmit={submitRoute} className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold">Ruta (1–4)<input className={field} type="number" min="1" max="4" value={routeForm.route_number} onChange={(event) => setRouteForm({ ...routeForm, route_number: event.target.value })} /></label>
        <label className="text-xs font-semibold">Nombre<input className={field} value={routeForm.name} onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })} /></label>
        <label className="text-xs font-semibold">Capacidad<input className={field} type="number" min="1" value={routeForm.capacity} onChange={(event) => setRouteForm({ ...routeForm, capacity: event.target.value })} /></label>
        <Submit disabled={saving}>{editingRoute ? 'Actualizar recorrido' : 'Agregar recorrido'}</Submit>
        {editingRoute && <button type="button" aria-label="Cancelar edición de recorrido" disabled={saving} onClick={() => { routeEditTrigger.current?.focus(); setEditingRoute(null); setRouteForm({ route_number: '', name: '', capacity: '30' }); }} className="min-h-11 rounded-xl border border-edu-border px-4 text-sm font-semibold text-edu-primary hover:bg-edu-bg disabled:opacity-50">Cancelar</button>}
      </form>
      <form onSubmit={submitStop} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold">Recorrido de la parada<select className={field} value={stopForm.route} onChange={(event) => setStopForm({ ...stopForm, route: event.target.value })} disabled={Boolean(editingStop)}><option value="">Seleccioná un recorrido</option>{routes.filter((route) => route.is_active).map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Nombre de la parada<input className={field} value={stopForm.name} onChange={(event) => setStopForm({ ...stopForm, name: event.target.value })} /></label>
        <label className="text-xs font-semibold">Orden de la parada<input className={field} type="number" min="1" value={stopForm.order} onChange={(event) => setStopForm({ ...stopForm, order: event.target.value })} /></label>
        <Submit disabled={saving}>{editingStop ? 'Actualizar parada' : 'Agregar parada'}</Submit>
        {editingStop && <button type="button" aria-label="Cancelar edición de parada" disabled={saving} onClick={() => { stopEditTrigger.current?.focus(); setEditingStop(null); setStopForm({ route: '', name: '', order: '1' }); }} className="min-h-11 rounded-xl border border-edu-border px-4 text-sm font-semibold text-edu-primary hover:bg-edu-bg disabled:opacity-50">Cancelar</button>}
      </form>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {routes.length === 0 ? <Empty text="No hay recorridos configurados." /> : routes.map((route) => <article key={route.id} className="rounded-lg border border-edu-border/60 px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>Ruta {route.route_number} · {route.name}</strong>
            <span className="flex flex-wrap items-center gap-2">
              <button type="button" aria-label={'Editar recorrido ' + route.route_number + ' · ' + route.name} disabled={saving} onClick={(event) => { routeEditTrigger.current = event.currentTarget; setEditingRoute(route.id); setRouteForm({ route_number: String(route.route_number), name: route.name, capacity: String(route.capacity) }); }} className="min-h-11 min-w-11 rounded-lg px-2 text-xs font-semibold text-edu-secondary hover:bg-edu-light">Editar</button>
              <button type="button" aria-label={(route.is_active ? 'Desactivar' : 'Activar') + ' recorrido ' + route.route_number + ' · ' + route.name} disabled={saving} onClick={() => void save(() => updateTransportRoute(route.id, { is_active: !route.is_active }), 'Ruta ' + (route.is_active ? 'desactivada' : 'activada') + '.')} className="min-h-11 min-w-11 rounded-lg px-2 text-xs font-semibold text-edu-secondary hover:bg-edu-light">{route.is_active ? 'Desactivar' : 'Activar'}</button>
            </span>
          </div>
          <p className="mt-1 text-xs text-edu-muted">{route.capacity} cupos · {route.stops.length} paradas · {route.is_active ? 'Activo' : 'Inactivo'}</p>
          <div className="mt-2 space-y-1">{[...route.stops].sort((a, b) => a.stop_order - b.stop_order).map((stop) => <div key={stop.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-edu-muted">
            <span>{stop.stop_order}. {stop.name}</span>
            <span className="flex flex-wrap items-center gap-2">
              <button type="button" aria-label={'Editar parada ' + stop.name + ' de la ruta ' + route.route_number} disabled={saving} className="min-h-11 min-w-11 rounded-lg px-2 font-semibold text-edu-secondary hover:bg-edu-light" onClick={(event) => { stopEditTrigger.current = event.currentTarget; setEditingStop(stop.id); setStopForm({ route: route.id, name: stop.name, order: String(stop.stop_order) }); }}>Editar</button>
              <button type="button" aria-label={(stop.is_active ? 'Desactivar' : 'Activar') + ' parada ' + stop.name + ' de la ruta ' + route.route_number} disabled={saving} className="min-h-11 min-w-11 rounded-lg px-2 font-semibold text-edu-secondary hover:bg-edu-light" onClick={() => void save(() => updateTransportStop(stop.id, { is_active: !stop.is_active }), stop.is_active ? 'Parada desactivada.' : 'Parada activada.')}>{stop.is_active ? 'Desactivar' : 'Activar'}</button>
            </span>
          </div>)}</div>
        </article>)}
      </div>
    </section>
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en transporte</h2><form onSubmit={submitEnrollment} className="mt-3 grid gap-3 md:grid-cols-3 md:items-end"><StudentSelect value={enrollmentForm.student} students={activeStudents} onChange={(student) => setEnrollmentForm({ ...enrollmentForm, student })} /><label className="text-[11px] font-semibold">Recorrido<select className={field} value={enrollmentForm.route} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, route: event.target.value, stop: '' })}><option value="">Seleccioná</option>{routes.filter((route) => route.is_active).map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select></label><label className="text-[11px] font-semibold">Parada<select className={field} value={enrollmentForm.stop} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, stop: event.target.value })}><option value="">Sin parada</option>{[...(selectedRoute?.stops.filter((stop) => stop.is_active) ?? [])].sort((a, b) => a.stop_order - b.stop_order).map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}</select></label><label className="text-[11px] font-semibold">Ciclo lectivo<input className={field} type="number" min="1900" max="2200" value={enrollmentForm.year} onChange={event => setEnrollmentForm({ ...enrollmentForm, year: event.target.value })} /></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones de transporte." items={transportEnrollments} onToggle={(id, isActive) => void save(() => setServiceEnrollmentActive('transport', id, isActive), `Inscripción ${isActive ? 'activada' : 'desactivada'}.`)} render={(item) => <>{studentName(item.student)} · Ruta {item.route?.route_number ?? '—'} {item.route?.name ?? ''} · {item.stop?.name ?? 'Sin parada'} · {item.academic_year}</>} /></section>
    <ServiceRequestsPanel serviceType="transport" sportGroups={sportGroups} sportSchedules={sportSchedules} sportEnrollments={sportEnrollments} routes={routes} transportEnrollments={transportEnrollments} onChanged={onChanged} />
  </>;
}
