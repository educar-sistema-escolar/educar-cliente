import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  listDiningServices,
  listDiningSlots,
  listDiningUsage,
  listSportGroups,
  listSportGroupSchedules,
  listSports,
  listStudentDiningEnrollments,
  listStudentSportEnrollments,
  listStudentTransportEnrollments,
  listTransportRoutes,
} from '../../features/admin/services/servicesRepository';
import { listEducationalLevels, listStudents, listTeachers } from '../../features/admin/services/academicRepository';
import type { DiningService, DiningSlot, DiningUsage, EducationalLevel, Sport, SportGroup, SportGroupSchedule, Student, StudentDiningEnrollment, StudentSportEnrollment, StudentTransportEnrollment, Teacher, TransportRoute } from '../../features/admin/types';
import { toUserFacingError } from '../../shared/utils/userFacingError';
import { DiningServicesPage } from './services/DiningServicesPage';
import { SportsServicesPage } from './services/SportsServicesPage';
import { TransportServicesPage } from './services/TransportServicesPage';

type Tab = 'sports' | 'transport' | 'dining';
const errorText = (error: unknown) => toUserFacingError(error, 'No se pudo completar la operación.');

export function ServiciosPage() {
  const [tab, setTab] = useState<Tab>('sports');
  const [students, setStudents] = useState<Student[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportGroups, setSportGroups] = useState<SportGroup[]>([]);
  const [sportSchedules, setSportSchedules] = useState<SportGroupSchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [levels, setLevels] = useState<EducationalLevel[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [diningServices, setDiningServices] = useState<DiningService[]>([]);
  const [diningSlots, setDiningSlots] = useState<DiningSlot[]>([]);
  const [sportEnrollments, setSportEnrollments] = useState<StudentSportEnrollment[]>([]);
  const [transportEnrollments, setTransportEnrollments] = useState<StudentTransportEnrollment[]>([]);
  const [diningEnrollments, setDiningEnrollments] = useState<StudentDiningEnrollment[]>([]);
  const [usage, setUsage] = useState<DiningUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [studentRows, sportRows, groupRows, sportScheduleRows, teacherRows, levelRows, routeRows, diningRows, diningSlotRows, sportEnrollmentRows, transportEnrollmentRows, diningEnrollmentRows, usageRows] = await Promise.all([
        listStudents(), listSports(), listSportGroups(), listSportGroupSchedules(), listTeachers(), listEducationalLevels(), listTransportRoutes(), listDiningServices(), listDiningSlots(),
        listStudentSportEnrollments(), listStudentTransportEnrollments(), listStudentDiningEnrollments(), listDiningUsage(),
      ]);
      setStudents(studentRows); setSports(sportRows); setSportGroups(groupRows); setSportSchedules(sportScheduleRows); setTeachers(teacherRows); setLevels(levelRows); setRoutes(routeRows); setDiningServices(diningRows); setDiningSlots(diningSlotRows);
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

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-edu-muted"><RefreshCw className="animate-spin" size={16} />Cargando servicios...</div>;

  return <div className="space-y-5">
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span><h1 className="mt-1 text-lg font-bold text-edu-primary">Servicios institucionales</h1><p className="mt-1 text-xs leading-relaxed text-edu-muted">Catálogos, inscripciones deportivas, transporte y comedor.</p></section>
    {(error || success) && <div role="status" aria-live="polite" className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}><span>{error ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}</span><span>{error || success}</span>{error && <button className="ml-auto font-bold underline" onClick={() => void load()}>Reintentar</button>}</div>}
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Servicios">{([['sports', 'Deportes'], ['transport', 'Transporte'], ['dining', 'Comedor']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} type="button" onClick={() => { setTab(value); setError(null); }} className={`rounded-xl px-4 py-2 text-xs font-bold ${tab === value ? 'bg-edu-primary text-white' : 'border border-edu-border bg-white text-edu-muted'}`}>{label}</button>)}</div>
    <div hidden={tab !== 'sports'}><SportsServicesPage students={students} sports={sports} sportGroups={sportGroups} sportSchedules={sportSchedules} teachers={teachers} levels={levels} sportEnrollments={sportEnrollments} saving={saving} save={save} setError={setError} /></div>
    <div hidden={tab !== 'transport'}><TransportServicesPage students={students} routes={routes} transportEnrollments={transportEnrollments} saving={saving} save={save} setError={setError} /></div>
    <div hidden={tab !== 'dining'}><DiningServicesPage students={students} diningServices={diningServices} diningSlots={diningSlots} diningEnrollments={diningEnrollments} usage={usage} saving={saving} save={save} setError={setError} /></div>
  </div>;
}
