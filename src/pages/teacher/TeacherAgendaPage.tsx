import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, Clock3, RefreshCw } from 'lucide-react';
import type { SupabaseAccountSession } from '../../features/auth/services/supabaseAuth';
import { loadTeacherAssignments, loadTeacherSchedules, type TeacherAssignment, type TeacherSchedule } from '../../features/teacher/services/teacherRepository';
import { groupSchedulesByDay } from '../../features/teacher/services/teacherUtils';

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export function TeacherAgendaPage() {
  const session = useOutletContext<SupabaseAccountSession>();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    void loadTeacherAssignments(session.profileId).then(async data => {
      const schedule = await loadTeacherSchedules(data);
      if (active) { setAssignments(data); setSchedules(schedule); setLoading(false); }
    }).catch(() => { if (active) { setError('No se pudo cargar tu agenda institucional.'); setLoading(false); } });
    return () => { active = false; };
  }, [session.profileId, revision]);
  const years = [...new Set(assignments.map(item => item.academic_year))];
  const selectedYear = year || String(years[0] ?? '');
  const currentAssignments = assignments.filter(item => String(item.academic_year) === selectedYear);
  const currentSchedules = schedules.filter(schedule => String(schedule.academic_year) === selectedYear && currentAssignments.some(item => item.id === schedule.course_subject_id || (!schedule.course_subject_id && item.course_id === schedule.course_id)));
  const days = groupSchedulesByDay(currentSchedules);
  const today = (new Date().getDay() + 6) % 7;
  function reload() { setLoading(true); setError(''); setRevision(value => value + 1); }
  return <>
    <section className="teacher-hero"><p>TIEMPO PARA LO IMPORTANTE</p><h1>Tu semana, en orden.</h1><p>Consulta los horarios de tus materias y los bloques generales de los cursos a tu cargo. Una mirada clara para organizar cada jornada.</p></section>
    <div className="teacher-section-heading"><div><p className="teacher-eyebrow">HORARIOS INSTITUCIONALES</p><h2>Agenda semanal</h2></div><div className="teacher-heading-actions">{!!years.length && <label className="teacher-year">Ciclo lectivo<select aria-label="Ciclo lectivo de la agenda" value={selectedYear} onChange={event => setYear(event.target.value)}>{years.map(value => <option key={value}>{value}</option>)}</select></label>}<button className="teacher-icon-button" aria-label="Actualizar agenda" onClick={reload} disabled={loading}><RefreshCw size={18} /></button></div></div>
    {loading ? <p className="teacher-state" role="status">Organizando tus horarios…</p> : error ? <div className="teacher-state" role="alert"><p>{error}</p><button className="teacher-button" onClick={reload}>Reintentar</button></div> : !currentSchedules.length ? <div className="teacher-state"><CalendarDays size={32} className="teacher-empty-icon" /><h3>Aún no hay horarios publicados</h3><p>Cuando administración registre los horarios de tus materias y cursos, podrás consultarlos aquí.</p></div> :
    <div className="teacher-agenda">{days.map((day, index) => <section className={`teacher-day ${today === index ? 'today' : ''}`} key={dayNames[index]} aria-label={dayNames[index]}><header><h3>{dayNames[index]}</h3>{today === index && <span>Hoy</span>}<small>{day.length} {day.length === 1 ? 'bloque' : 'bloques'}</small></header>{day.length ? day.map(item => {
      const assignment = currentAssignments.find(value => value.id === item.course_subject_id) ?? currentAssignments.find(value => value.course_id === item.course_id);
      return <article className="teacher-class" key={item.id}><p><Clock3 size={13} />{item.starts_at.slice(0, 5)} — {item.ends_at.slice(0, 5)}</p><h4>{item.course_subject_id ? assignment?.subject?.name || 'Materia asignada' : 'Bloque general del curso'}</h4><span>{assignment?.course?.name || 'Curso asignado'}</span></article>;
    }) : <p className="teacher-day-empty">Sin bloques asignados</p>}</section>)}</div>}
    <aside className="teacher-agenda-note"><CalendarDays size={19} /><p>Esta agenda muestra la semana habitual, no un calendario de feriados. Los cambios de horario se gestionan desde administración.</p></aside>
  </>;
}
