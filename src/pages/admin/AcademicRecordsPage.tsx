import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  createAcademicSchedule,
  deleteAcademicSchedule,
  enrollStudentInSubject,
  listAcademicHistory,
  listAcademicSchedules,
  listCourseSubjects,
  listCourses,
  listStudents,
  listStudentSubjectEnrollments,
  recordAcademicHistory,
  updateAcademicSchedule,
} from '../../features/admin/services/academicRepository';
import type { AcademicHistory, AcademicSchedule, Course, CourseSubject, Student, StudentSubjectEnrollment } from '../../features/admin/types';
import { toUserFacingError } from '../../shared/utils/userFacingError';

const field = 'mt-1 h-9 w-full rounded-lg border border-edu-border bg-white px-2.5 text-xs outline-none focus:border-edu-secondary';
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const message = (error: unknown) => toUserFacingError(error, 'No se pudo completar la operación.');

export function AcademicRecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Array<CourseSubject & { course?: Course }>>([]);
  const [enrollments, setEnrollments] = useState<StudentSubjectEnrollment[]>([]);
  const [history, setHistory] = useState<Record<string, AcademicHistory[]>>({});
  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ student: '', subject: '' });
  const [historyForm, setHistoryForm] = useState({ enrollment: '', term: '1', grade: '', notes: '' });
  const [scheduleForm, setScheduleForm] = useState({ course: '', subject: '', year: String(new Date().getFullYear()), day: '1', start: '08:00', end: '09:00' });
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [studentRows, courseRows, enrollmentRows, scheduleRows] = await Promise.all([
        listStudents(), listCourses(), listStudentSubjectEnrollments(), listAcademicSchedules(),
      ]);
      const subjectRows = (await Promise.all(courseRows.map(async (course) =>
        (await listCourseSubjects(course.id)).map((subject) => ({ ...subject, course }))))).flat();
      setStudents(studentRows); setSubjects(subjectRows); setEnrollments(enrollmentRows); setSchedules(scheduleRows);
      const historyRows = await Promise.all(enrollmentRows.map(async (enrollment) => [enrollment.id, await listAcademicHistory(enrollment.id)] as const));
      setHistory(Object.fromEntries(historyRows));
    } catch (loadError) { setError(message(loadError)); } finally { setLoading(false); }
  };

  // Data loading is intentionally kicked off once on mount; the loader owns its async state lifecycle.
  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const save = async (action: () => Promise<unknown>, successText: string) => {
    setSaving(true); setError(null); setSuccess(null);
    try { await action(); await load(); setSuccess(successText); } catch (saveError) { setError(message(saveError)); } finally { setSaving(false); }
  };

  const subjectOptions = useMemo(() => subjects.filter((subject) => subject.is_active), [subjects]);
  const submitEnrollment = (event: FormEvent) => {
    event.preventDefault();
    if (!enrollmentForm.student || !enrollmentForm.subject) return setError('Seleccioná alumno y materia.');
    void save(() => enrollStudentInSubject(enrollmentForm.student, enrollmentForm.subject), 'Inscripción creada correctamente.');
  };
  const submitHistory = (event: FormEvent) => {
    event.preventDefault(); const term = Number(historyForm.term); const grade = Number(historyForm.grade);
    if (!historyForm.enrollment) return setError('Seleccioná una inscripción.');
    if (!Number.isInteger(term) || term < 1 || term > 4) return setError('El período debe estar entre 1 y 4.');
    if (!Number.isFinite(grade) || grade < 0 || grade > 10) return setError('La calificación debe estar entre 0 y 10.');
    void save(() => recordAcademicHistory({ enrollment_id: historyForm.enrollment, term, grade, notes: historyForm.notes.trim() || null }), 'Historial académico registrado.');
  };
  const submitSchedule = (event: FormEvent) => {
    event.preventDefault();
    const year = Number(scheduleForm.year); const day = Number(scheduleForm.day);
    if (!scheduleForm.course || !Number.isInteger(year) || year < 1 || !scheduleForm.start || !scheduleForm.end || scheduleForm.start >= scheduleForm.end) return setError('Completá curso, año y un horario válido.');
    const input = { course_id: scheduleForm.course, course_subject_id: scheduleForm.subject || null, academic_year: year, day_of_week: day, starts_at: scheduleForm.start, ends_at: scheduleForm.end };
    void save(() => editingSchedule ? updateAcademicSchedule(editingSchedule, input) : createAcademicSchedule(input), editingSchedule ? 'Horario actualizado.' : 'Horario creado.');
    setEditingSchedule(null);
  };
  const editSchedule = (schedule: AcademicSchedule) => setScheduleForm({ course: schedule.course_id, subject: schedule.course_subject_id ?? '', year: String(schedule.academic_year), day: String(schedule.day_of_week), start: schedule.starts_at.slice(0, 5), end: schedule.ends_at.slice(0, 5) });

  return <div className="space-y-5">
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span><h1 className="mt-1 text-lg font-bold text-edu-primary">Registros académicos</h1><p className="mt-1 text-xs text-edu-muted">Inscripciones por materia, historial de calificaciones y horarios.</p></section>
    {error && <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"><AlertTriangle size={15} />{error}<button className="ml-auto font-bold underline" onClick={() => void load()}>Reintentar</button></div>}
    {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-700"><CheckCircle2 size={15} />{success}</div>}
    {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-edu-muted"><RefreshCw className="animate-spin" size={16} />Cargando registros...</div> : <>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscripción alumno-materia</h2><form onSubmit={submitEnrollment} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><label className="text-[11px] font-semibold">Alumno<select className={field} value={enrollmentForm.student} onChange={e => setEnrollmentForm({ ...enrollmentForm, student: e.target.value })}><option value="">Seleccioná</option>{students.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.person.first_name} {s.person.last_name}</option>)}</select></label><label className="text-[11px] font-semibold">Materia<select className={field} value={enrollmentForm.subject} onChange={e => setEnrollmentForm({ ...enrollmentForm, subject: e.target.value })}><option value="">Seleccioná</option>{subjectOptions.map(s => <option key={s.id} value={s.id}>{s.course?.name ?? 'Curso'} · {s.subject?.name ?? 'Materia'}</option>)}</select></label><button disabled={saving} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50"><Plus size={14} />Inscribir</button></form><div className="mt-4 space-y-2">{enrollments.length === 0 ? <p className="py-6 text-center text-xs text-edu-muted">No hay inscripciones por materia.</p> : enrollments.map(e => <article key={e.id} className="rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><div className="flex flex-wrap justify-between gap-2"><strong>{e.student?.person.first_name} {e.student?.person.last_name}</strong><span>{e.course_subject?.course?.name ?? 'Curso'} · {e.course_subject?.subject?.name ?? 'Materia'} · {e.academic_year}</span></div><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-edu-muted">{(history[e.id] ?? []).map(item => <span key={item.id} className="rounded bg-slate-100 px-2 py-1">P{item.term}: {item.grade}</span>)}<button type="button" className="font-semibold text-edu-secondary" onClick={() => setHistoryForm({ ...historyForm, enrollment: e.id })}>Cargar historial</button></div></article>)}</div></section>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Registrar historial académico</h2><form onSubmit={submitHistory} className="mt-3 grid gap-3 md:grid-cols-4 md:items-end"><label className="text-[11px] font-semibold md:col-span-2">Inscripción<select className={field} value={historyForm.enrollment} onChange={e => setHistoryForm({ ...historyForm, enrollment: e.target.value })}><option value="">Seleccioná</option>{enrollments.map(e => <option key={e.id} value={e.id}>{e.student?.person.first_name} {e.student?.person.last_name} · {e.course_subject?.subject?.name}</option>)}</select></label><label className="text-[11px] font-semibold">Período<input className={field} type="number" min="1" max="4" value={historyForm.term} onChange={e => setHistoryForm({ ...historyForm, term: e.target.value })} /></label><label className="text-[11px] font-semibold">Nota<input className={field} type="number" min="0" max="10" step="0.01" value={historyForm.grade} onChange={e => setHistoryForm({ ...historyForm, grade: e.target.value })} /></label><label className="text-[11px] font-semibold md:col-span-3">Observaciones<input className={field} value={historyForm.notes} onChange={e => setHistoryForm({ ...historyForm, notes: e.target.value })} /></label><button disabled={saving} className="h-9 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50">Guardar nota</button></form></section>
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-edu-primary">Horarios académicos</h2><span className="text-[11px] text-edu-muted">{schedules.length} registros</span></div><form onSubmit={submitSchedule} className="mt-3 grid gap-3 md:grid-cols-4 md:items-end"><label className="text-[11px] font-semibold">Curso<select className={field} value={scheduleForm.course} onChange={e => setScheduleForm({ ...scheduleForm, course: e.target.value })}><option value="">Seleccioná</option>{[...new Map(subjects.map(s => [s.course?.id, s.course])).values()].filter(Boolean).map(c => <option key={c!.id} value={c!.id}>{c!.name}</option>)}</select></label><label className="text-[11px] font-semibold">Materia<select className={field} value={scheduleForm.subject} onChange={e => setScheduleForm({ ...scheduleForm, subject: e.target.value })}><option value="">Todas</option>{subjectOptions.filter(s => s.course?.id === scheduleForm.course).map(s => <option key={s.id} value={s.id}>{s.subject?.name}</option>)}</select></label><label className="text-[11px] font-semibold">Año<input className={field} type="number" value={scheduleForm.year} onChange={e => setScheduleForm({ ...scheduleForm, year: e.target.value })} /></label><label className="text-[11px] font-semibold">Día<select className={field} value={scheduleForm.day} onChange={e => setScheduleForm({ ...scheduleForm, day: e.target.value })}>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label><label className="text-[11px] font-semibold">Desde<input className={field} type="time" value={scheduleForm.start} onChange={e => setScheduleForm({ ...scheduleForm, start: e.target.value })} /></label><label className="text-[11px] font-semibold">Hasta<input className={field} type="time" value={scheduleForm.end} onChange={e => setScheduleForm({ ...scheduleForm, end: e.target.value })} /></label><button disabled={saving} className="h-9 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50">{editingSchedule ? 'Actualizar' : 'Crear'} horario</button>{editingSchedule && <button type="button" className="h-9 rounded-lg border border-edu-border px-4 text-xs font-semibold" onClick={() => { setEditingSchedule(null); setScheduleForm({ ...scheduleForm, course: '', subject: '' }); }}>Cancelar</button>}</form><div className="mt-4 space-y-2">{schedules.length === 0 ? <p className="py-6 text-center text-xs text-edu-muted">No hay horarios.</p> : schedules.map(s => <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"><span><strong>{s.course?.name ?? 'Curso'}</strong> · {s.course_subject?.subject?.name ?? 'Todas las materias'} · {days[s.day_of_week]} {s.starts_at.slice(0, 5)}–{s.ends_at.slice(0, 5)} · {s.academic_year}</span><span className="flex gap-1"><button type="button" className="rounded p-1.5 text-edu-secondary hover:bg-slate-100" onClick={() => { setEditingSchedule(s.id); editSchedule(s); }} aria-label="Editar horario"><Pencil size={14} /></button><button type="button" className="rounded p-1.5 text-red-600 hover:bg-red-50" onClick={() => void save(() => deleteAcademicSchedule(s.id), 'Horario eliminado.')} aria-label="Eliminar horario"><Trash2 size={14} /></button></span></div>)}</div></section>
    </>}
  </div>;
}
