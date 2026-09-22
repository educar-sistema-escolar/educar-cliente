import { useState, type FormEvent } from 'react';
import { createTransportRoute, createTransportStop, enrollStudentInTransport, setServiceEnrollmentActive, updateTransportRoute, updateTransportStop } from '../../../features/admin/services/servicesRepository';
import type { Student, StudentTransportEnrollment, TransportRoute } from '../../../features/admin/types';
import { Empty, EnrollmentList, StudentSelect, Submit } from './ServicePageParts';
import { field, studentName } from './ServicePageUtils';

type Save = (action: () => Promise<unknown>, text: string) => void;

export function TransportServicesPage({ students, routes, transportEnrollments, saving, save, setError }: { students: Student[]; routes: TransportRoute[]; transportEnrollments: StudentTransportEnrollment[]; saving: boolean; save: Save; setError: (message: string) => void }) {
  const [routeForm, setRouteForm] = useState({ route_number: '', name: '', capacity: '30' });
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [stopForm, setStopForm] = useState({ route: '', name: '', order: '1' });
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ student: '', route: '', stop: '' });
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
    if (!enrollmentForm.student || !enrollmentForm.route) return setError('Seleccioná alumno y recorrido.');
    void save(() => enrollStudentInTransport(enrollmentForm.student, enrollmentForm.route, enrollmentForm.stop || null), 'Inscripción de transporte creada.');
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
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Recorridos de transporte</h2><form onSubmit={submitRoute} className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Ruta (1–4)<input className={field} type="number" min="1" max="4" value={routeForm.route_number} onChange={(event) => setRouteForm({ ...routeForm, route_number: event.target.value })} /></label><label className="text-[11px] font-semibold">Nombre<input className={field} value={routeForm.name} onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })} /></label><label className="text-[11px] font-semibold">Capacidad<input className={field} type="number" min="1" value={routeForm.capacity} onChange={(event) => setRouteForm({ ...routeForm, capacity: event.target.value })} /></label><Submit disabled={saving}>{editingRoute ? 'Actualizar recorrido' : 'Agregar recorrido'}</Submit></form><form onSubmit={submitStop} className="mt-4 grid gap-2 sm:grid-cols-3"><select aria-label="Recorrido de la parada" className={field} value={stopForm.route} onChange={(event) => setStopForm({ ...stopForm, route: event.target.value })} disabled={Boolean(editingStop)}><option value="">Recorrido de la parada</option>{routes.filter((route) => route.is_active).map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select><input aria-label="Nombre de la parada" className={field} placeholder="Nombre de la parada" value={stopForm.name} onChange={(event) => setStopForm({ ...stopForm, name: event.target.value })} /><input aria-label="Orden de la parada" className={field} type="number" min="1" value={stopForm.order} onChange={(event) => setStopForm({ ...stopForm, order: event.target.value })} /><Submit disabled={saving}>{editingStop ? 'Actualizar parada' : 'Agregar parada'}</Submit></form><div className="mt-4 grid gap-2 md:grid-cols-2">{routes.length === 0 ? <Empty text="No hay recorridos configurados." /> : routes.map((route) => <article key={route.id} className="rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><strong>Ruta {route.route_number} · {route.name}</strong><span className="flex items-center gap-2"><button type="button" disabled={saving} onClick={() => { setEditingRoute(route.id); setRouteForm({ route_number: String(route.route_number), name: route.name, capacity: String(route.capacity) }); }} className="text-[11px] font-semibold text-edu-secondary">Editar</button><button type="button" disabled={saving} onClick={() => void save(() => updateTransportRoute(route.id, { is_active: !route.is_active }), `Ruta ${route.is_active ? 'desactivada' : 'activada'}.`)} className="text-[11px] font-semibold text-edu-secondary">{route.is_active ? 'Desactivar' : 'Activar'}</button></span></div><p className="mt-1 text-[11px] text-edu-muted">{route.capacity} cupos · {route.stops.length} paradas · {route.is_active ? 'Activo' : 'Inactivo'}</p><div className="mt-2 space-y-1">{[...route.stops].sort((a, b) => a.stop_order - b.stop_order).map((stop) => <div key={stop.id} className="flex justify-between text-[11px] text-edu-muted"><span>{stop.stop_order}. {stop.name}</span><span className="flex items-center gap-2"><button type="button" className="font-semibold text-edu-secondary" onClick={() => { setEditingStop(stop.id); setStopForm({ route: route.id, name: stop.name, order: String(stop.stop_order) }); }}>Editar</button><button type="button" className="font-semibold text-edu-secondary" onClick={() => void save(() => updateTransportStop(stop.id, { is_active: !stop.is_active }), `${stop.is_active ? 'Parada desactivada' : 'Parada activada'}.`)}>{stop.is_active ? 'Desactivar' : 'Activar'}</button></span></div>)}</div></article>)}</div></section>
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en transporte</h2><form onSubmit={submitEnrollment} className="mt-3 grid gap-3 md:grid-cols-3 md:items-end"><StudentSelect value={enrollmentForm.student} students={activeStudents} onChange={(student) => setEnrollmentForm({ ...enrollmentForm, student })} /><label className="text-[11px] font-semibold">Recorrido<select className={field} value={enrollmentForm.route} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, route: event.target.value, stop: '' })}><option value="">Seleccioná</option>{routes.filter((route) => route.is_active).map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select></label><label className="text-[11px] font-semibold">Parada<select className={field} value={enrollmentForm.stop} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, stop: event.target.value })}><option value="">Sin parada</option>{[...(selectedRoute?.stops.filter((stop) => stop.is_active) ?? [])].sort((a, b) => a.stop_order - b.stop_order).map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}</select></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones de transporte." items={transportEnrollments} onToggle={(id, isActive) => void save(() => setServiceEnrollmentActive('transport', id, isActive), `Inscripción ${isActive ? 'activada' : 'desactivada'}.`)} render={(item) => <>{studentName(item.student)} · Ruta {item.route?.route_number ?? '—'} {item.route?.name ?? ''} · {item.stop?.name ?? 'Sin parada'} · {item.academic_year}</>} /></section>
  </>;
}
