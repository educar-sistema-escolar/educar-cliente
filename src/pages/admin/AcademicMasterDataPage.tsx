import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Edit3, Plus, RefreshCw, UserRound, X } from 'lucide-react';
import {
  createCourse,
  createCourseSubject,
  createEducationalLevel,
  createStudent,
  createStudentEnrollment,
  createSubject,
  createTeacher,
  listCourses,
  listCourseSubjects,
  listEducationalLevels,
  listStudents,
  listSubjects,
  listTeachers,
  updateCourse,
  updateCourseSubject,
  updateEducationalLevel,
  updateStudent,
  updateStudentEnrollment,
  updateSubject,
  updateTeacher,
} from '../../features/admin/services/academicRepository';
import type { Course, CourseSubject, EducationalLevel, Student, Subject, Teacher } from '../../features/admin/types';
import { toUserFacingError } from '../../shared/utils/userFacingError';

type Resource = 'levels' | 'courses' | 'subjects' | 'teachers' | 'students';

type FormState = Record<string, string>;

const labels: Record<Resource, string> = {
  levels: 'Niveles educativos',
  courses: 'Cursos',
  subjects: 'Materias',
  teachers: 'Docentes',
  students: 'Alumnos',
};

const emptyForms: Record<Resource, FormState> = {
  levels: { code: '', name: '', sort_order: '0' },
  courses: { code: '', name: '', educational_level_id: '', academic_year: String(new Date().getFullYear()), year_number: '', division: '', shift: '', capacity: '' },
  subjects: { code: '', name: '' },
  teachers: { first_name: '', last_name: '', email: '', phone: '', dni: '', teacher_number: '', specialty: '' },
  students: { first_name: '', last_name: '', email: '', phone: '', dni: '', student_number: '' },
};

function getErrorMessage(error: unknown) {
  return toUserFacingError(error, 'No se pudo completar la operación.');
}

export const AcademicMasterDataPage: React.FC<{ resource: Resource }> = ({ resource }) => {
  const [items, setItems] = useState<Array<EducationalLevel | Course | Subject | Teacher | Student>>([]);
  const [levels, setLevels] = useState<EducationalLevel[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<FormState>(emptyForms[resource]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [enrollmentStudent, setEnrollmentStudent] = useState<Student | null>(null);
  const [enrollmentCourseId, setEnrollmentCourseId] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState(String(new Date().getFullYear()));
  const [assignmentCourse, setAssignmentCourse] = useState<Course | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [assignmentSubjectId, setAssignmentSubjectId] = useState('');
  const [assignmentTeacherId, setAssignmentTeacherId] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (resource === 'levels') setItems(await listEducationalLevels());
      if (resource === 'courses') {
        const [courseRows, levelRows, subjectRows, teacherRows] = await Promise.all([listCourses(), listEducationalLevels(), listSubjects(), listTeachers()]);
        setItems(courseRows);
        setLevels(levelRows);
        setSubjects(subjectRows);
        setTeachers(teacherRows);
      }
      if (resource === 'subjects') setItems(await listSubjects());
      if (resource === 'teachers') setItems(await listTeachers());
      if (resource === 'students') {
        const [studentRows, courseRows] = await Promise.all([listStudents(), listCourses()]);
        setItems(studentRows);
        setCourses(courseRows);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    // The loader updates async state after the effect returns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
  }, [items, search]);

  function startCreate() {
    setForm(emptyForms[resource]);
    setEditingId(null);
    setError(null);
    setIsFormOpen(true);
  }

  function startEdit(item: EducationalLevel | Course | Subject | Teacher | Student) {
    if (resource === 'levels') {
      const level = item as EducationalLevel;
      setForm({ code: level.code, name: level.name, sort_order: String(level.sort_order) });
    }
    if (resource === 'courses') {
      const course = item as Course;
      setForm({ code: course.code, name: course.name, educational_level_id: course.educational_level_id, academic_year: String(course.academic_year), year_number: String(course.year_number ?? ''), division: course.division ?? '', shift: course.shift ?? '', capacity: String(course.capacity ?? '') });
    }
    if (resource === 'subjects') {
      const subject = item as Subject;
      setForm({ code: subject.code, name: subject.name });
    }
    if (resource === 'teachers') {
      const teacher = item as Teacher;
      setForm({ first_name: teacher.person.first_name, last_name: teacher.person.last_name, email: teacher.person.email ?? '', phone: teacher.person.phone ?? '', dni: teacher.dni ?? '', teacher_number: teacher.teacher_number ?? '', specialty: teacher.specialty ?? '' });
    }
    if (resource === 'students') {
      const student = item as Student;
      setForm({ first_name: student.person.first_name, last_name: student.person.last_name, email: student.person.email ?? '', phone: student.person.phone ?? '', dni: student.dni ?? '', student_number: student.student_number ?? '' });
    }
    setEditingId(item.id);
    setError(null);
    setIsFormOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (!form.name?.trim() && ['levels', 'courses', 'subjects'].includes(resource)) throw new Error('El nombre es obligatorio.');
      if (!form.code?.trim() && ['levels', 'courses', 'subjects'].includes(resource)) throw new Error('El código es obligatorio.');
      if (resource === 'levels') {
        const input = { code: form.code.trim(), name: form.name.trim(), sort_order: Number(form.sort_order) || 0 };
        if (editingId) await updateEducationalLevel(editingId, input); else await createEducationalLevel(input);
      }
      if (resource === 'courses') {
        if (!form.educational_level_id) throw new Error('Seleccioná un nivel educativo.');
        const input = { code: form.code.trim(), name: form.name.trim(), educational_level_id: form.educational_level_id, academic_year: Number(form.academic_year), year_number: form.year_number ? Number(form.year_number) : null, division: form.division.trim() || null, shift: (form.shift || null) as Course['shift'], capacity: form.capacity ? Number(form.capacity) : null };
        if (!Number.isInteger(input.academic_year) || input.academic_year < 2000) throw new Error('El ciclo lectivo no es válido.');
        if (input.year_number !== null && (!Number.isInteger(input.year_number) || input.year_number < 1)) throw new Error('El año del curso no es válido.');
        if (input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 1)) throw new Error('La capacidad no es válida.');
        if (editingId) await updateCourse(editingId, input); else await createCourse(input);
      }
      if (resource === 'subjects') {
        const input = { code: form.code.trim(), name: form.name.trim() };
        if (editingId) await updateSubject(editingId, input); else await createSubject(input);
      }
      if (resource === 'teachers') {
        const input = { first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, dni: form.dni.trim() || null, teacher_number: form.teacher_number.trim() || null, specialty: form.specialty.trim() || null };
        if (!input.first_name || !input.last_name) throw new Error('Nombre y apellido son obligatorios.');
        if (editingId) await updateTeacher(editingId, input); else await createTeacher(input);
      }
      if (resource === 'students') {
        const input = { first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, dni: form.dni.trim() || null, student_number: form.student_number.trim() || null };
        if (!input.first_name || !input.last_name) throw new Error('Nombre y apellido son obligatorios.');
        if (editingId) await updateStudent(editingId, input); else await createStudent(input);
      }
      setFeedback(`${labels[resource]} actualizado correctamente.`);
      setIsFormOpen(false);
      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function assignCourse(event: React.FormEvent) {
    event.preventDefault();
    if (!enrollmentStudent || !enrollmentCourseId) return;
    try {
      await createStudentEnrollment({ student_id: enrollmentStudent.id, course_id: enrollmentCourseId, academic_year: Number(enrollmentYear) });
      setFeedback('Alumno asignado al curso correctamente.');
      setEnrollmentStudent(null);
      await load();
    } catch (enrollmentError) {
      setError(getErrorMessage(enrollmentError));
    }
  }

  async function openCourseAssignments(course: Course) {
    setAssignmentCourse(course);
    setAssignmentSubjectId('');
    setAssignmentTeacherId('');
    try {
      setCourseSubjects(await listCourseSubjects(course.id));
    } catch (assignmentError) {
      setError(getErrorMessage(assignmentError));
    }
  }

  async function assignSubject(event: React.FormEvent) {
    event.preventDefault();
    if (!assignmentCourse || !assignmentSubjectId || !assignmentTeacherId) return;
    try {
      if (courseSubjects.some((item) => item.subject_id === assignmentSubjectId && item.academic_year === assignmentCourse.academic_year && item.is_active)) {
        throw new Error('Esa materia ya está asignada a este curso. Podés cambiar su docente en la lista.');
      }
      const assignment = await createCourseSubject({ course_id: assignmentCourse.id, subject_id: assignmentSubjectId, teacher_id: assignmentTeacherId, academic_year: assignmentCourse.academic_year });
      setCourseSubjects((current) => [assignment, ...current]);
      setAssignmentSubjectId('');
      setAssignmentTeacherId('');
      setFeedback('Materia y docente asignados correctamente.');
    } catch (assignmentError) {
      setError(getErrorMessage(assignmentError));
    }
  }

  async function changeAssignmentTeacher(assignment: CourseSubject, teacherId: string) {
    if (!assignmentCourse || !teacherId || teacherId === assignment.teacher_id) return;
    try {
      await updateCourseSubject(assignment.id, { teacher_id: teacherId });
      setCourseSubjects(await listCourseSubjects(assignmentCourse.id));
      setFeedback('Docente actualizado correctamente.');
    } catch (assignmentError) {
      setError(getErrorMessage(assignmentError));
    }
  }

  async function toggleActive(item: EducationalLevel | Course | Subject | Teacher | Student) {
    setError(null);
    try {
      if (resource === 'levels') await updateEducationalLevel(item.id, { is_active: !(item as EducationalLevel).is_active });
      if (resource === 'courses') await updateCourse(item.id, { is_active: !(item as Course).is_active });
      if (resource === 'subjects') await updateSubject(item.id, { is_active: !(item as Subject).is_active });
      if (resource === 'teachers') await updateTeacher(item.id, { is_active: !(item as Teacher).is_active });
      if (resource === 'students') await updateStudent(item.id, { is_active: !(item as Student).is_active });
      setFeedback(`${labels[resource]} ${item.is_active ? 'desactivado' : 'activado'} correctamente.`);
      await load();
    } catch (toggleError) {
      setError(getErrorMessage(toggleError));
    }
  }

  const title = labels[resource];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Gestión académica</p>
            <h1 className="mt-1 text-lg font-bold text-edu-primary">{title}</h1>
            <p className="mt-1 text-xs text-edu-muted">Administrá la información institucional desde un único lugar.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void load()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-edu-border px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <RefreshCw size={14} /> Actualizar
            </button>
            <button type="button" onClick={startCreate} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-edu-secondary px-3 text-xs font-semibold text-white hover:bg-edu-secondary-dark">
              <Plus size={14} /> Nuevo
            </button>
          </div>
        </div>
      </section>

      {feedback && <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700"><CheckCircle2 size={14} /> {feedback}<button type="button" className="ml-auto" onClick={() => setFeedback(null)}><X size={14} /></button></div>}
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</div>}

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar..." className="mb-4 h-9 w-full rounded-lg border border-edu-border px-3 text-xs outline-none focus:border-edu-secondary" />
        {isLoading ? <p className="py-12 text-center text-xs text-edu-muted">Cargando datos...</p> : visibleItems.length === 0 ? <p className="py-12 text-center text-xs text-edu-muted">No hay registros.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead><tr className="border-b border-edu-border bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-edu-muted"><th className="px-3 py-3">Nombre</th><th className="px-3 py-3">Código / identificación</th><th className="px-3 py-3">Especialidad</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-edu-border/60">
                {visibleItems.map((item) => {
                  const name = resource === 'teachers' || resource === 'students' ? `${(item as Teacher | Student).person.first_name} ${(item as Teacher | Student).person.last_name}` : (item as EducationalLevel | Course | Subject).name;
                  const code = resource === 'teachers' ? ((item as Teacher).dni ?? (item as Teacher).teacher_number) : resource === 'students' ? ((item as Student).dni ?? (item as Student).student_number) : (item as EducationalLevel | Course | Subject).code;
                  const specialty = resource === 'teachers' ? (item as Teacher).specialty : null;
                  const active = resource === 'teachers' || resource === 'students' ? (item as Teacher | Student).is_active : (item as EducationalLevel | Course | Subject).is_active;
                  return <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-3 py-3 font-semibold text-slate-800">{name}</td><td className="px-3 py-3">{code || '-'}</td><td className="px-3 py-3">{specialty || '-'}</td><td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{active ? 'Activo' : 'Inactivo'}</span></td><td className="px-3 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => void toggleActive(item)} className={`text-[11px] font-semibold ${active ? 'text-red-600' : 'text-edu-secondary'}`}>{active ? 'Desactivar' : 'Activar'}</button><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1 rounded-lg border border-edu-border px-2.5 py-1.5 text-[11px] font-semibold hover:bg-slate-50"><Edit3 size={13} /> Editar</button>{resource === 'courses' && <button type="button" onClick={() => void openCourseAssignments(item as Course)} className="inline-flex items-center gap-1 rounded-lg bg-edu-secondary px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-edu-secondary-dark"><BookOpen size={13} /> Materias</button>}{resource === 'students' && <button type="button" onClick={() => { setEnrollmentStudent(item as Student); setEnrollmentCourseId(''); }} className="inline-flex items-center gap-1 rounded-lg bg-edu-secondary px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-edu-secondary-dark"><UserRound size={13} /> Curso</button>}</div></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-edu-primary">{editingId ? 'Editar' : 'Nuevo'} {title.toLowerCase()}</h2><button type="button" onClick={() => setIsFormOpen(false)}><X size={16} /></button></div>{resource === 'levels' && <><Field label="Código" value={form.code} onChange={(value) => setForm({ ...form, code: value })} /><Field label="Nombre" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="Orden" type="number" value={form.sort_order} onChange={(value) => setForm({ ...form, sort_order: value })} /></>}{resource === 'courses' && <><Field label="Código" value={form.code} onChange={(value) => setForm({ ...form, code: value })} /><Field label="Nombre" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><SelectField label="Nivel" value={form.educational_level_id} options={levels.map((level) => ({ value: level.id, label: level.name }))} onChange={(value) => setForm({ ...form, educational_level_id: value })} /><Field label="Ciclo lectivo" type="number" value={form.academic_year} onChange={(value) => setForm({ ...form, academic_year: value })} /><Field label="Año" type="number" value={form.year_number} onChange={(value) => setForm({ ...form, year_number: value })} /><Field label="División" value={form.division} onChange={(value) => setForm({ ...form, division: value })} /><SelectField label="Turno" value={form.shift} options={[{ value: 'morning', label: 'Mañana' }, { value: 'afternoon', label: 'Tarde' }, { value: 'full_day', label: 'Jornada completa' }]} onChange={(value) => setForm({ ...form, shift: value })} /><Field label="Capacidad" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} /></>}{resource === 'subjects' && <><Field label="Código" value={form.code} onChange={(value) => setForm({ ...form, code: value })} /><Field label="Nombre" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /></>}{(resource === 'teachers' || resource === 'students') && <><Field label="Nombre" value={form.first_name} onChange={(value) => setForm({ ...form, first_name: value })} /><Field label="Apellido" value={form.last_name} onChange={(value) => setForm({ ...form, last_name: value })} /><Field label="Correo" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><Field label="Teléfono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><Field label="DNI" value={form.dni} onChange={(value) => setForm({ ...form, dni: value.replace(/\D/g, '') })} /><Field label={resource === 'teachers' ? 'Legajo docente' : 'Legajo del alumno'} value={resource === 'teachers' ? form.teacher_number : form.student_number} onChange={(value) => setForm({ ...form, [resource === 'teachers' ? 'teacher_number' : 'student_number']: value })} />{resource === 'teachers' && <Field label="Especialidad" value={form.specialty} onChange={(value) => setForm({ ...form, specialty: value })} />}</>}<div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-edu-border py-2 text-xs font-semibold">Cancelar</button><button type="submit" disabled={isSaving} className="flex-1 rounded-lg bg-edu-secondary py-2 text-xs font-semibold text-white disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar'}</button></div></form></div>}

      {enrollmentStudent && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-edu-primary">Cursos del alumno</h2><button type="button" onClick={() => setEnrollmentStudent(null)}><X size={16} /></button></div><p className="text-xs text-slate-600">Alumno: <strong>{enrollmentStudent.person.first_name} {enrollmentStudent.person.last_name}</strong></p><form onSubmit={assignCourse} className="space-y-3"><SelectField label="Curso" value={enrollmentCourseId} options={courses.filter((course) => course.is_active).map((course) => ({ value: course.id, label: `${course.name} (${course.academic_year})` }))} onChange={setEnrollmentCourseId} /><Field label="Ciclo lectivo" type="number" value={enrollmentYear} onChange={setEnrollmentYear} /><button type="submit" disabled={isSaving} className="w-full rounded-lg bg-edu-secondary py-2 text-xs font-semibold text-white disabled:opacity-50">Asignar curso</button></form><div className="space-y-2 border-t border-edu-border pt-3">{enrollmentStudent.enrollments.length === 0 ? <p className="text-xs text-edu-muted">El alumno no tiene cursos asignados.</p> : enrollmentStudent.enrollments.map((enrollment) => <div key={enrollment.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"><span>{enrollment.course?.name ?? 'Curso'} · {enrollment.academic_year}</span>{enrollment.is_active && <button type="button" className="font-semibold text-red-600" onClick={() => void updateStudentEnrollment(enrollment.id, { is_active: false }).then(async () => { setFeedback('Asignación desactivada.'); setEnrollmentStudent(null); await load(); }).catch((enrollmentError: unknown) => setError(getErrorMessage(enrollmentError)))}>Desactivar</button>}</div>)}</div></div></div>}

      {assignmentCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="course-assignment-title">
          <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="course-assignment-title" className="text-sm font-bold text-edu-primary">Materias y docentes · {assignmentCourse.name}</h2>
                <p className="mt-1 text-xs text-edu-muted">Cada materia del curso debe tener un docente responsable.</p>
              </div>
              <button type="button" onClick={() => setAssignmentCourse(null)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800" aria-label="Cerrar"><X size={16} /></button>
            </div>

            <form onSubmit={assignSubject} className="grid gap-3 rounded-xl border border-edu-border/70 bg-slate-50/60 p-3 sm:grid-cols-2">
              <SelectField label="1. Materia" value={assignmentSubjectId} options={subjects.filter((subject) => subject.is_active).map((subject) => ({ value: subject.id, label: subject.name }))} onChange={setAssignmentSubjectId} />
              <SelectField label="2. Docente responsable" value={assignmentTeacherId} options={teachers.filter((teacher) => teacher.is_active).map((teacher) => ({ value: teacher.id, label: `${teacher.person.first_name} ${teacher.person.last_name}` }))} onChange={setAssignmentTeacherId} />
              <p className="text-[11px] text-edu-muted sm:col-span-2">Ciclo lectivo: {assignmentCourse.academic_year}</p>
              <button type="submit" disabled={isSaving || !assignmentSubjectId || !assignmentTeacherId} className="sm:col-span-2 rounded-lg bg-edu-secondary py-2 text-xs font-semibold text-white transition-colors hover:bg-edu-secondary-dark disabled:opacity-50">Asignar materia y docente</button>
            </form>

            <div className="space-y-2 border-t border-edu-border pt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-edu-muted">Asignaciones actuales</p>
              {courseSubjects.length === 0 ? <p className="text-xs text-edu-muted">Todavía no hay materias asignadas.</p> : courseSubjects.map((assignment) => (
                <div key={assignment.id} className="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{assignment.subject?.name ?? 'Materia'}</p>
                    <p className="mt-1 text-edu-muted">{assignment.teacher ? `${assignment.teacher.person.first_name} ${assignment.teacher.person.last_name}` : 'Sin docente asignado'} · {assignment.academic_year}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="min-w-40 space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-edu-muted">Cambiar docente</span>
                      <select value={assignment.teacher_id ?? ''} onChange={(event) => void changeAssignmentTeacher(assignment, event.target.value)} className="h-8 w-full rounded-lg border border-edu-border bg-white px-2 text-xs outline-none transition-colors hover:border-edu-secondary focus:border-edu-secondary">
                        <option value="">Seleccionar...</option>
                        {teachers.filter((teacher) => teacher.is_active).map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.person.first_name} {teacher.person.last_name}</option>)}
                      </select>
                    </label>
                    <button type="button" className={`rounded-lg px-2 py-1.5 font-semibold transition-colors ${assignment.is_active ? 'text-red-600 hover:bg-red-50' : 'text-edu-secondary hover:bg-sky-50'}`} onClick={() => void updateCourseSubject(assignment.id, { is_active: !assignment.is_active }).then(async () => { setFeedback(`Materia ${assignment.is_active ? 'desactivada' : 'activada'}.`); setCourseSubjects(await listCourseSubjects(assignmentCourse.id)); }).catch((assignmentError) => setError(getErrorMessage(assignmentError)))}>{assignment.is_active ? 'Desactivar' : 'Activar'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block space-y-1"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-lg border border-edu-border px-3 text-xs outline-none transition-colors hover:border-edu-secondary focus:border-edu-secondary" /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="block space-y-1"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-muted">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-lg border border-edu-border px-3 text-xs outline-none transition-colors hover:border-edu-secondary focus:border-edu-secondary"><option value="">Seleccionar...</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
