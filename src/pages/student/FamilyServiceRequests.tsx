import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import {
  listServiceEnrollmentAvailability,
  listSportRequestOptions,
  listStudentServiceRequests,
  listTransportRequestOptions,
  submitStudentServiceRequest,
  type ServiceAvailability,
  type SportRequestOption,
  type StudentServiceRequest,
  type TransportRequestOption,
} from '../../features/services/servicesRequestsRepository';
import type { PortalStudent } from '../../features/student/services/studentPortalRepository';
import { toUserFacingError } from '../../shared/utils/userFacingError';
import { educationalLevelLabel } from '../../shared/utils/educationalLevelLabel';

const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const field = 'mt-1 min-h-11 w-full rounded-lg border border-edu-border bg-white px-3 text-sm text-edu-primary outline-none focus-visible:ring-2 focus-visible:ring-edu-secondary';
const statusLabel = { pending: 'Pendiente de revisión', approved: 'Aceptada por administración', rejected: 'Rechazada' };

export function FamilyServiceRequests({ student, academicYear, onRefresh }: { student: PortalStudent; academicYear: number; onRefresh: () => void }) {
  const [groups, setGroups] = useState<SportRequestOption[]>([]);
  const [routes, setRoutes] = useState<TransportRequestOption[]>([]);
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [requests, setRequests] = useState<StudentServiceRequest[]>([]);
  const [sportGroupId, setSportGroupId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [stopId, setStopId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupRows, routeRows, availabilityRows, requestRows] = await Promise.all([
        listSportRequestOptions(academicYear, student.id), listTransportRequestOptions(),
        listServiceEnrollmentAvailability(academicYear), listStudentServiceRequests({ studentId: student.id }),
      ]);
      setGroups(groupRows);
      setRoutes(routeRows.map((route) => ({ ...route, stops: [...route.stops].sort((a, b) => a.stop_order - b.stop_order) })));
      setAvailability(availabilityRows);
      setRequests(requestRows);
      setSportGroupId('');
      setRouteId((current) => routeRows.some((route) => route.id === current) ? current : '');
    } catch (loadError) {
      setError(toUserFacingError(loadError, 'No se pudieron cargar los servicios disponibles.'));
    } finally {
      setLoading(false);
    }
  }, [student.id, academicYear]);

  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const levelId = student.courses.find((course) => course.academicYear === academicYear)?.levelId;
  const hasCycleEnrollment = student.courses.some((course) => course.academicYear === academicYear);
  const compatibleGroups = groups.filter((group) => !group.educational_level_id || group.educational_level_id === levelId);
  const selectedGroup = compatibleGroups.find((group) => group.id === sportGroupId);
  const selectedRoute = routes.find((route) => route.id === routeId);
  const availabilityById = useMemo(() => new Map(availability.map((entry) => [entry.service_id, entry])), [availability]);
  const activeSports = student.services.filter((service) => service.kind === 'Deporte' && service.academicYear === academicYear);
  const pendingSportRequests = requests.filter((request) => request.service_type === 'sport' && request.status === 'pending');
  const reservedSportCount = activeSports.length + pendingSportRequests.length;
  const transportActive = student.services.some((service) => service.kind === 'Transporte' && service.academicYear === academicYear);
  const pendingTransportRequest = requests.some((request) => request.service_type === 'transport' && request.status === 'pending');

  const submit = async (event: FormEvent, serviceType: 'sport' | 'transport') => {
    event.preventDefault();
    if (serviceType === 'sport' && !sportGroupId) return setError('Elegí un grupo deportivo disponible.');
    if (serviceType === 'transport' && !routeId) return setError('Elegí un recorrido de transporte.');
    const selectedId = serviceType === 'sport' ? sportGroupId : routeId;
    if ((availabilityById.get(selectedId)?.available ?? 0) < 1) return setError('El servicio elegido ya no tiene cupos. Actualizá los datos y elegí otra opción.');
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await submitStudentServiceRequest({
        studentId: student.id,
        serviceType,
        academicYear,
        ...(serviceType === 'sport' ? { sportGroupId } : { routeId, stopId: stopId || null }),
      });
      setSuccess('Solicitud enviada. El equipo de dirección revisará la asignación.');
      await load();
    } catch (submitError) {
      setError(toUserFacingError(submitError, 'No se pudo enviar la solicitud.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="rounded-xl border border-edu-border bg-white p-6" aria-busy="true"><p role="status" className="flex items-center gap-2 text-sm text-edu-muted"><RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />Cargando deportes y transporte disponibles…</p></section>;

  return <section aria-labelledby="family-service-requests-heading" className="rounded-xl border border-edu-border bg-white p-5 shadow-sm sm:p-7">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-edu-secondary">Ciclo lectivo {academicYear}</p><h2 id="family-service-requests-heading" className="mt-1 text-xl font-bold text-edu-primary">Solicitar un servicio para {student.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-edu-muted">Elegí una opción compatible. Dirección revisará la solicitud y confirmará la inscripción.</p></div>
      <button type="button" onClick={onRefresh} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-edu-border px-3 text-xs font-semibold text-edu-primary hover:bg-edu-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"><RefreshCw className="h-4 w-4" aria-hidden="true" />Actualizar servicios</button>
    </div>
    {(error || success) && <div role={error ? 'alert' : 'status'} aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{success && <CheckCircle2 className="mr-2 inline h-4 w-4" aria-hidden="true" />}{error ?? success}</div>}
    {!levelId && <p role="status" className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">El legajo no tiene un nivel activo para este ciclo. Dirección debe revisar la cursada antes de solicitar servicios.</p>}

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <form onSubmit={(event) => void submit(event, 'sport')} className="rounded-xl border border-edu-border bg-edu-bg p-4 sm:p-5">
        <h3 className="text-base font-bold text-edu-primary">Actividad deportiva</h3>
        <label className="mt-3 block text-xs font-semibold text-edu-primary">Deporte y grupo<select className={field} value={sportGroupId} onChange={(event) => setSportGroupId(event.target.value)} disabled={!levelId || reservedSportCount >= 2 || saving}>
          <option value="">Seleccioná un grupo compatible</option>
          {compatibleGroups.map((group) => {
            const places = availabilityById.get(group.id)?.available ?? 0;
            return <option key={group.id} value={group.id} disabled={places < 1 || activeSports.some((service) => service.name === group.sport?.name) || pendingSportRequests.some((request) => request.sport_group?.sport?.name === group.sport?.name)}>{group.sport?.name ?? 'Deporte'} · {group.name} · {places > 0 ? `${places} cupos` : 'Completo'}</option>;
          })}
        </select></label>
        {selectedGroup && <div className="mt-3 rounded-lg border border-edu-border bg-white p-3 text-xs leading-5 text-edu-muted">
          <p className="break-words text-sm font-semibold text-edu-primary">{selectedGroup.sport?.name ?? 'Deporte'} · {selectedGroup.name}</p>
          <p><strong className="text-edu-primary">{educationalLevelLabel(selectedGroup.level?.name) ?? 'Todos los niveles'}</strong> · {availabilityById.get(selectedGroup.id)?.available ?? 0} cupos disponibles</p>
          {selectedGroup.teacher?.person && <p>Profesor: {selectedGroup.teacher.person.first_name} {selectedGroup.teacher.person.last_name}</p>}
          <p>Horario: {selectedGroup.schedules.filter((item) => item.is_active).map((item) => `${days[item.day_of_week]} ${item.starts_at.slice(0, 5)}–${item.ends_at.slice(0, 5)}`).join(' · ') || 'A confirmar'}</p>
        </div>}
        {reservedSportCount >= 2 && <p className="mt-2 text-xs text-amber-900">El alumno ya tiene dos deportes activos o pendientes de asignación en {academicYear}.</p>}
        {!compatibleGroups.length && <p className="mt-2 text-xs text-edu-muted">No hay grupos disponibles para el nivel educativo del alumno en este ciclo.</p>}
        <button type="submit" disabled={!levelId || !sportGroupId || reservedSportCount >= 2 || saving || (availabilityById.get(sportGroupId)?.available ?? 0) < 1} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-edu-primary px-4 text-sm font-bold text-white hover:bg-edu-secondary-dark disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Enviando solicitud…' : 'Solicitar inscripción deportiva'}</button>
      </form>

      <form onSubmit={(event) => void submit(event, 'transport')} className="rounded-xl border border-edu-border bg-edu-bg p-4 sm:p-5">
        <h3 className="text-base font-bold text-edu-primary">Transporte escolar</h3>
        <label className="mt-3 block text-xs font-semibold text-edu-primary">Recorrido<select className={field} value={routeId} onChange={(event) => { setRouteId(event.target.value); setStopId(''); }} disabled={!hasCycleEnrollment || transportActive || pendingTransportRequest || saving}>
          <option value="">Seleccioná un recorrido</option>
          {routes.map((route) => {
            const places = availabilityById.get(route.id)?.available ?? 0;
            return <option key={route.id} value={route.id} disabled={places < 1}>{`Ruta ${route.route_number} · ${route.name} · ${places > 0 ? `${places} cupos` : 'Completo'}`}</option>;
          })}
        </select></label>
        {selectedRoute && <>
          <label className="mt-3 block text-xs font-semibold text-edu-primary">Parada<select className={field} value={stopId} onChange={(event) => setStopId(event.target.value)} disabled={saving}><option value="">A coordinar con dirección</option>{selectedRoute.stops.filter((stop) => stop.is_active).map((stop) => <option key={stop.id} value={stop.id}>{stop.stop_order}. {stop.name}</option>)}</select></label>
          <p className="mt-2 text-xs text-edu-muted">{availabilityById.get(selectedRoute.id)?.available ?? 0} cupos · {selectedRoute.stops.filter((stop) => stop.is_active).length} paradas disponibles</p>
        </>}
        {transportActive && <p className="mt-2 text-xs text-edu-muted">El alumno ya tiene un recorrido asignado para este ciclo.</p>}
        {!hasCycleEnrollment && <p className="mt-2 text-xs text-amber-900">Dirección debe confirmar la cursada del alumno en este ciclo antes de solicitar transporte.</p>}
        <button type="submit" disabled={!hasCycleEnrollment || !routeId || transportActive || pendingTransportRequest || saving || (availabilityById.get(routeId)?.available ?? 0) < 1} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-edu-primary px-4 text-sm font-bold text-white hover:bg-edu-secondary-dark disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Enviando solicitud…' : 'Solicitar transporte'}</button>
      </form>
    </div>

    <div className="mt-6 border-t border-edu-border pt-5">
      <h3 className="text-sm font-bold text-edu-primary">Solicitudes de servicios</h3>
      {requests.length ? <ul className="mt-3 space-y-2">{requests.map((request) => <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edu-border px-3 py-3 text-sm">
        <span className="min-w-0"><strong className="text-edu-primary">{request.service_type === 'sport' ? `${request.sport_group?.sport?.name ?? 'Deporte'} · ${request.sport_group?.name ?? 'Grupo'}` : `Ruta ${request.route?.route_number ?? ''} · ${request.route?.name ?? 'Transporte'}${request.stop ? ` · ${request.stop.name}` : ''}`}</strong><span className="block text-xs text-edu-muted">Ciclo {request.academic_year} · {new Date(request.created_at).toLocaleDateString('es-AR')}</span>{request.review_note && <span className="block text-xs text-edu-muted">Respuesta: {request.review_note}</span>}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : request.status === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900'}`}>{statusLabel[request.status]}</span>
      </li>)}</ul> : <p className="mt-2 text-sm text-edu-muted">Todavía no hay solicitudes para este alumno.</p>}
    </div>
  </section>;
}
