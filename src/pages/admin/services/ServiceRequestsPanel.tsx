import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import type { SportGroup, StudentSportEnrollment, StudentTransportEnrollment, TransportRoute } from '../../../features/admin/types';
import { listStudentServiceRequests, reviewStudentServiceRequest, type RequestedServiceType, type StudentServiceRequest } from '../../../features/services/servicesRequestsRepository';
import { toUserFacingError } from '../../../shared/utils/userFacingError';
import { educationalLevelLabel } from '../../../shared/utils/educationalLevelLabel';
import { Empty } from './ServicePageParts';
import { field } from './ServicePageUtils';

const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ServiceRequestsPanel({ serviceType, sportGroups, sportSchedules = [], sportEnrollments = [], routes = [], transportEnrollments = [], onChanged }: {
  serviceType: RequestedServiceType;
  sportGroups: SportGroup[];
  sportSchedules?: Array<{ id: string; sport_group_id: string; day_of_week: number; starts_at: string; ends_at: string; is_active: boolean }>;
  sportEnrollments?: StudentSportEnrollment[];
  routes?: TransportRoute[];
  transportEnrollments?: StudentTransportEnrollment[];
  onChanged: () => Promise<void>;
}) {
  const [requests, setRequests] = useState<StudentServiceRequest[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [stops, setStops] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listStudentServiceRequests({ serviceType });
      const pending = rows.filter((request) => request.status === 'pending');
      setRequests(pending);
      setAssignments(Object.fromEntries(pending.map((request) => [request.id, request.service_type === 'sport' ? request.requested_sport_group_id ?? '' : request.requested_route_id ?? ''])));
      setStops(Object.fromEntries(pending.map((request) => [request.id, request.requested_stop_id ?? ''])));
    } catch (loadError) {
      setError(toUserFacingError(loadError, 'No se pudieron cargar las solicitudes pendientes.'));
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const review = async (request: StudentServiceRequest, action: 'approve' | 'reject') => {
    const verb = action === 'approve' ? 'aprobar y asignar este servicio' : 'rechazar esta solicitud';
    if (!window.confirm(`¿Confirmás ${verb} para ${request.student?.person ? `${request.student.person.first_name} ${request.student.person.last_name}` : 'el alumno'}?`)) return;
    const assignedServiceId = assignments[request.id];
    if (action === 'approve' && !assignedServiceId) return setError('Seleccioná una asignación válida antes de aprobar.');
    setSavingId(request.id);
    setError(null);
    try {
      await reviewStudentServiceRequest({
        requestId: request.id,
        action,
        ...(action === 'approve' ? { assignedServiceId, assignedStopId: stops[request.id] || null } : {}),
      });
      await onChanged();
      await load();
    } catch (reviewError) {
      setError(toUserFacingError(reviewError, 'No se pudo resolver la solicitud. Revisá cupos y reglas del servicio.'));
    } finally {
      setSavingId(null);
    }
  };

  return <section aria-labelledby={`service-requests-${serviceType}`} className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><div><h2 id={`service-requests-${serviceType}`} className="text-sm font-bold text-edu-primary">Solicitudes familiares pendientes</h2><p className="mt-1 text-xs text-edu-muted">Dirección revisa la solicitud y confirma el servicio en la misma operación.</p></div><button type="button" onClick={() => void load()} disabled={loading || savingId !== null} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-edu-border px-3 text-xs font-semibold text-edu-primary disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />Actualizar</button></div>
    {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p>}
    {loading ? <p role="status" className="mt-4 text-xs text-edu-muted">Cargando solicitudes…</p> : requests.length === 0 ? <Empty text="No hay solicitudes pendientes." /> : <ul className="mt-4 space-y-3">{requests.map((request) => {
      const student = request.student?.person ? `${request.student.person.first_name} ${request.student.person.last_name}` : 'Alumno';
      const groupOptions = sportGroups.filter((group) => group.is_active && group.academic_year === request.academic_year);
      const routeOptions = routes.filter((route) => route.is_active);
      const selectedRoute = routeOptions.find((route) => route.id === assignments[request.id]);
      const schedules = sportSchedules.filter((schedule) => schedule.sport_group_id === assignments[request.id] && schedule.is_active);
      const activeCount = sportEnrollments.filter((enrollment) => enrollment.sport_group_id === assignments[request.id] && enrollment.academic_year === request.academic_year && enrollment.is_active).length;
      const routeCount = transportEnrollments.filter((enrollment) => enrollment.route_id === assignments[request.id] && enrollment.academic_year === request.academic_year && enrollment.is_active).length;
      return <li key={request.id} className="rounded-xl border border-edu-border bg-edu-bg p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-bold text-edu-primary">{student}</p><p className="mt-1 text-xs text-edu-muted">{request.service_type === 'sport' ? `Solicita ${request.sport_group?.sport?.name ?? 'deporte'} · ${request.sport_group?.name ?? 'grupo'}` : `Solicita Ruta ${request.route?.route_number ?? ''} · ${request.route?.name ?? 'transporte'}${request.stop ? ` · ${request.stop.name}` : ''}`} · Ciclo {request.academic_year}</p><p className="mt-1 text-[11px] text-edu-muted">Recibida {new Date(request.created_at).toLocaleDateString('es-AR')}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900">Pendiente</span></div>
        {request.service_type === 'sport' ? <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-[11px] font-semibold text-edu-primary">Asignar grupo<select className={field} value={assignments[request.id] ?? ''} onChange={(event) => setAssignments((current) => ({ ...current, [request.id]: event.target.value }))}><option value="">Seleccioná</option>{groupOptions.map((group) => <option key={group.id} value={group.id}>{group.sport?.name ?? 'Deporte'} · {group.name} · {educationalLevelLabel(group.level?.name) ?? 'Todos los niveles'} · {group.capacity} cupos</option>)}</select></label><div className="text-[11px] text-edu-muted">{schedules.map((schedule) => `${days[schedule.day_of_week]} ${schedule.starts_at.slice(0, 5)}–${schedule.ends_at.slice(0, 5)}`).join(' · ') || 'Horario a confirmar'} · {Math.max(0, (groupOptions.find((group) => group.id === assignments[request.id])?.capacity ?? 0) - activeCount)} libres</div></div> : <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold text-edu-primary">Asignar recorrido<select className={field} value={assignments[request.id] ?? ''} onChange={(event) => { setAssignments((current) => ({ ...current, [request.id]: event.target.value })); setStops((current) => ({ ...current, [request.id]: '' })); }}><option value="">Seleccioná</option>{routeOptions.map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name} · {route.capacity} cupos</option>)}</select></label><label className="text-[11px] font-semibold text-edu-primary">Asignar parada<select className={field} value={stops[request.id] ?? ''} onChange={(event) => setStops((current) => ({ ...current, [request.id]: event.target.value }))} disabled={!selectedRoute}><option value="">A coordinar</option>{selectedRoute?.stops.filter((stop) => stop.is_active).map((stop) => <option key={stop.id} value={stop.id}>{stop.stop_order}. {stop.name}</option>)}</select><span className="mt-1 block font-normal text-edu-muted">{Math.max(0, (selectedRoute?.capacity ?? 0) - routeCount)} cupos disponibles</span></label></div>}
        <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => void review(request, 'reject')} disabled={savingId !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-700 disabled:opacity-50"><XCircle className="h-4 w-4" aria-hidden="true" />Rechazar</button><button type="button" onClick={() => void review(request, 'approve')} disabled={savingId !== null || !assignments[request.id]} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-edu-primary px-3 text-xs font-bold text-white disabled:opacity-50">{savingId === request.id ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}Aceptar y asignar</button></div>
      </li>;
    })}</ul>}
  </section>;
}
