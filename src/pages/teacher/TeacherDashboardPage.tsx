import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowRight, BookOpen, Download, Search, Users, RefreshCw, FileCheck2 } from 'lucide-react';
import type { SupabaseAccountSession } from '../../features/auth/services/supabaseAuth';
import { loadTeacherAssignments, loadTeacherRoster, type TeacherAssignment } from '../../features/teacher/services/teacherRepository';
import { filterRoster, rosterCsv, type TeacherStudent } from '../../features/teacher/services/teacherUtils';
import { educationalLevelLabel } from '../../shared/utils/educationalLevelLabel';

export function TeacherDashboardPage() {
  const session = useOutletContext<SupabaseAccountSession>();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [year, setYear] = useState('');
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => {
    let active = true;
    void loadTeacherAssignments(session.profileId).then(data => {
      if (active) { setAssignments(data); setLoading(false); }
    }).catch(() => { if (active) { setError('No se pudieron cargar tus materias.'); setLoading(false); } });
    return () => { active = false; };
  }, [session.profileId, revision]);
  const years = [...new Set(assignments.map(item => item.academic_year))];
  const selectedYear = year || String(years[0] ?? '');
  const visible = assignments.filter(item => String(item.academic_year) === selectedYear);
  const selected = visible.find(item => item.id === selectedId) ?? visible[0];
  function reload() { setLoading(true); setError(''); setRevision(value => value + 1); }
  return <>
    <section className="teacher-hero"><p>ENSEÑAR. ACOMPAÑAR. TRANSFORMAR.</p><h1>Hola, {session.name.split(' ')[0]}.</h1><p>Un espacio pensado para tu día a día: tus materias, tus estudiantes y su recorrido académico.</p></section>
    <section className="teacher-summary" aria-label="Resumen docente">
      <div><span className="teacher-summary-icon"><BookOpen size={21} /></span><div><strong>{loading ? '—' : visible.length}</strong><span>Materias asignadas</span></div></div>
      <div><span className="teacher-summary-icon"><Users size={21} /></span><div><strong>{loading ? '—' : new Set(visible.map(item => item.course_id)).size}</strong><span>Cursos a tu cargo</span></div></div>
      <div className="teacher-summary-note"><FileCheck2 size={23} /><span>Información institucional<br /><strong>Siempre conectada a la escuela</strong></span></div>
    </section>
    <div className="teacher-section-heading"><div><p className="teacher-eyebrow">TU ESPACIO ACADÉMICO</p><h2>Mis materias</h2></div><div className="teacher-heading-actions">
      {!!years.length && <label className="teacher-year">Ciclo lectivo<select aria-label="Ciclo lectivo" value={selectedYear} onChange={event => { setYear(event.target.value); setSelectedId(''); }}>{years.map(value => <option key={value}>{value}</option>)}</select></label>}
      <button className="teacher-icon-button" aria-label="Actualizar materias" title="Actualizar materias" onClick={reload} disabled={loading}><RefreshCw size={18} /></button>
    </div></div>
    {loading ? <div className="teacher-state" role="status">Cargando tus materias institucionales…</div> : error ? <div className="teacher-state" role="alert"><p>{error}</p><button className="teacher-button" onClick={reload}>Volver a intentar</button></div> : !assignments.length ?
      <div className="teacher-state"><BookOpen size={32} className="teacher-empty-icon" /><h3>Tu espacio está listo</h3><p>Aún no tienes materias asignadas. Solicita a administración que vincule tu cuenta docente a los cursos y materias correspondientes.</p></div> :
      <div className="teacher-workspace"><div className="teacher-course-list" role="group" aria-label="Materias asignadas">{visible.map((item, index) => <button key={item.id} className={`teacher-course-card ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id}>
        <span className="teacher-course-number">{String(index + 1).padStart(2, '0')}</span><span className="teacher-course-info"><small>{educationalLevelLabel(item.course?.level?.name) || 'Curso'} · {item.academic_year}</small><strong>{item.subject?.name || 'Materia sin nombre disponible'}</strong><span>{item.course?.name || 'Curso no disponible'}{item.course?.division ? ` · ${item.course.division}` : ''}</span></span><ArrowRight size={17} />
      </button>)}</div>{selected && <RosterPanel key={`${selected.id}-${revision}`} assignment={selected} />}</div>}
  </>;
}
function RosterPanel({ assignment }: { assignment: TeacherAssignment }) {
  const [roster, setRoster] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [exported, setExported] = useState(false);
  useEffect(() => {
    let active = true;
    void loadTeacherRoster(assignment.id).then(data => { if (active) { setRoster(data); setLoading(false); } })
      .catch(() => { if (active) { setError('No se pudo cargar el listado o su historial académico.'); setLoading(false); } });
    return () => { active = false; };
  }, [assignment.id, revision]);
  const filtered = filterRoster(roster, query);
  function download() {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rosterCsv(filtered)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `estudiantes-${assignment.academic_year}.csv`; link.click();
    URL.revokeObjectURL(url); setExported(true);
  }
  return <section className="teacher-roster" aria-label={`Estudiantes de ${assignment.subject?.name || 'la materia'}`}>
    <div className="teacher-roster-heading"><div><p className="teacher-eyebrow">{assignment.course?.name || 'CURSO ASIGNADO'}</p><h2>{assignment.subject?.name || 'Estudiantes'}</h2></div><span className="teacher-count">{loading ? '…' : roster.length} estudiantes</span></div>
    <p className="teacher-roster-description">Consulta el grupo y abre cada ficha para ver notas y observaciones registradas por la institución.</p>
    <div className="teacher-roster-tools"><label className="teacher-search"><Search size={17} /><span className="sr-only">Buscar estudiante por nombre o legajo</span><input value={query} onChange={event => { setQuery(event.target.value); setExported(false); }} placeholder="Buscar por nombre o legajo" /></label><button className="teacher-icon-button" aria-label="Descargar listado e historial filtrados en CSV" title="Descargar CSV" disabled={loading || !!error || !filtered.length} onClick={download}><Download size={18} /></button></div>
    {exported && <p className="teacher-inline-status" role="status">Listado descargado. Contiene información personal: compártelo solo por canales institucionales.</p>}
    {loading ? <p className="teacher-state" role="status">Cargando estudiantes e historial…</p> : error ? <div className="teacher-state" role="alert"><p>{error}</p><button className="teacher-button" onClick={() => { setLoading(true); setError(''); setRevision(value => value + 1); }}>Reintentar</button></div> : !roster.length ? <div className="teacher-state"><Users size={28} className="teacher-empty-icon" /><h3>Sin estudiantes inscritos</h3><p>Los estudiantes aparecerán cuando administración complete las inscripciones a esta materia.</p></div> : !filtered.length ? <p className="teacher-state">No hay coincidencias. Prueba con otro nombre o legajo.</p> :
      <div className="teacher-student-list">{filtered.map(row => <details key={row.id} className="teacher-student"><summary><span className="teacher-student-avatar">{row.student?.person?.first_name.charAt(0) || '?'}</span><span><strong>{row.student?.person ? `${row.student.person.last_name}, ${row.student.person.first_name}` : 'Nombre no disponible'}</strong><small>Legajo {row.student?.student_number || 'sin asignar'}</small></span><span className="teacher-record-count">{row.history.length ? `${row.history.length} registros` : 'Sin notas'}</span></summary>
      <div className="teacher-student-records">{row.history.length ? row.history.map((record, index) => <article key={record.id || index}><div><span>Período {record.term}</span><strong>{record.grade}<small> / 10</small></strong></div><p>{record.notes || 'Sin observaciones registradas.'}</p></article>) : <p>No hay calificaciones registradas para esta materia.</p>}</div>
    </details>)}</div>}
    <p className="teacher-readonly-note">Consulta académica · La carga y corrección de calificaciones está a cargo de administración.</p>
  </section>;
}
