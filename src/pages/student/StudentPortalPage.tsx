import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  RefreshCw,
  Utensils,
} from 'lucide-react';
import { getSupabaseAccountSession } from '../../features/auth/services/supabaseAuth';
import {
  loadStudentPortal,
  type PortalService,
  type PortalStudent,
} from '../../features/student/services/studentPortalRepository';
import { toUserFacingError } from '../../shared/utils/userFacingError';

const weekDays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const serviceIcon = (kind: PortalService['kind']) => {
  if (kind === 'Transporte') return Bus;
  if (kind === 'Comedor') return Utensils;
  return GraduationCap;
};

function courseLabel(course: PortalStudent['courses'][number]) {
  return [
    course.yearNumber ? `${course.yearNumber}° año` : null,
    course.division ? `división ${course.division}` : null,
    course.shift === 'morning' ? 'turno mañana' : course.shift === 'afternoon' ? 'turno tarde' : course.shift === 'full_day' ? 'jornada completa' : null,
  ].filter(Boolean).join(' · ');
}

export const StudentPortalPage: React.FC<{ audience: 'student' | 'family' }> = ({ audience }) => {
  const [students, setStudents] = useState<PortalStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const account = await getSupabaseAccountSession();
        if (!account || (audience === 'student' ? account.role !== 'student' : account.role !== 'parent')) {
          throw new Error('No se pudo validar la cuenta institucional. Iniciá sesión nuevamente.');
        }
        const result = await loadStudentPortal(account.profileId, audience === 'student' ? 'student' : 'parent');
        if (!mounted) return;
        setStudents(result);
        setSelectedStudentId((current) => result.some((student) => student.id === current) ? current : result[0]?.id ?? null);
      } catch (loadError) {
        if (mounted) setError(toUserFacingError(loadError, 'No se pudo cargar la información académica.'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [audience, reloadVersion]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const currentCourse = selectedStudent?.courses[0] ?? null;
  const orderedSchedule = [...(selectedStudent?.schedule ?? [])].sort((left, right) => left.day - right.day || left.startsAt.localeCompare(right.startsAt));
  const academicYear = currentCourse?.academicYear ?? new Date().getFullYear();
  const retry = () => {
    setError(null);
    setIsLoading(true);
    setReloadVersion((value) => value + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <p className="sr-only" role="status">Cargando información académica.</p>
        <div className="h-52 animate-pulse rounded-[28px] bg-[#dfe5dc]" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
          <div className="h-72 animate-pulse rounded-[28px] bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl rounded-[28px] border border-[#ead9c5] bg-[#fffefa] p-6 shadow-sm sm:p-8" role="alert">
        <AlertCircle className="h-6 w-6 text-[#aa583f]" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">No pudimos abrir tu ficha</h1>
        <p className="mt-2 text-sm leading-6 text-[#5c6c6c]">{error}</p>
        <button type="button" onClick={retry} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#173b54] px-4 text-sm font-semibold text-white hover:bg-[#20536a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Intentar de nuevo
        </button>
      </section>
    );
  }

  if (students.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-[#e2e2d8] bg-[#fffefa] p-6 shadow-sm sm:p-9">
        <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border-[22px] border-[#e6eee8]" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e4eee9] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#145c58]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Espacio institucional
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#173b54] sm:text-4xl">
            {audience === 'student' ? 'Tu legajo todavía no está vinculado' : 'Todavía no hay alumnos vinculados'}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#5c6c6c]">
            {audience === 'student'
              ? 'La cuenta inició sesión de forma segura, pero la institución aún no vinculó un legajo activo. Contactá a administración para revisar el acceso; no hace falta que compartas tu DNI por este portal.'
              : 'Cuando administración vincule un legajo a tu cuenta, vas a poder acompañar su cursada desde acá. Para cuidar la privacidad, esta pantalla no busca personas por DNI ni correo.'}
          </p>
          <Link to="/inscripcion" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#173b54] px-4 text-sm font-semibold text-white hover:bg-[#20536a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
            Consultar ingreso institucional
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#173b54] px-6 py-7 text-[#fffefa] shadow-[0_16px_38px_rgba(23,59,84,0.12)] sm:px-9 sm:py-9">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[34px] border-white/[0.06]" aria-hidden="true" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#bdd0cb]">
              {audience === 'student' ? 'Mi cuaderno escolar' : 'Acompañamiento familiar'}
              <span className="mx-2 text-[#f4cd6c]" aria-hidden="true">/</span>
              Ciclo {academicYear}
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
              {audience === 'student' ? 'Tu recorrido escolar, en un solo lugar.' : 'La cursada de tu familia, más cerca.'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#d5e0dc]">
              Información académica y servicios vinculados a los registros institucionales.
            </p>
          </div>
          {audience === 'family' && students.length > 1 && (
            <div className="min-w-56">
              <label htmlFor="portal-student" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#bdd0cb]">Legajo seleccionado</label>
              <select id="portal-student" value={selectedStudentId ?? ''} onChange={(event) => setSelectedStudentId(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/20 bg-[#fffefa] px-3 text-sm font-semibold text-[#173b54] outline-none focus-visible:ring-2 focus-visible:ring-[#f4cd6c]">
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
          )}
          {selectedStudent && (
            <div className="md:col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-[#d5e0dc]">
              <span className="font-semibold text-white">{selectedStudent.name}</span>
              {selectedStudent.studentNumber && <span>Legajo {selectedStudent.studentNumber}</span>}
              {selectedStudent.relationship && audience === 'family' && <span>Vínculo: {selectedStudent.relationship}</span>}
              <span className="inline-flex items-center gap-1.5 text-[#f4cd6c]"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Datos con acceso autorizado</span>
            </div>
          )}
        </div>
      </section>

      {selectedStudent && (
        <>
          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[26px] border border-[#e1e2d9] bg-[#fffefa] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#556a63]">Cursada actual</p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-[#173b54]">{currentCourse?.name ?? 'Sin curso activo'}</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7edcf] text-[#8a6822]">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              {currentCourse ? (
                <>
                  <p className="mt-2 text-sm text-[#5c6c6c]">{[currentCourse.level, courseLabel(currentCourse)].filter(Boolean).join(' · ') || 'Curso asignado'}</p>
                  <p className="mt-1 text-xs font-medium text-[#556a63]">Ciclo lectivo {currentCourse.academicYear}</p>
                  {selectedStudent.courses.length > 1 && (
                    <div className="mt-5 border-t border-[#e9e8df] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#556a63]">Otros ciclos registrados</p>
                      <ul className="mt-2 space-y-2 text-sm text-[#465d64]">
                        {selectedStudent.courses.slice(1).map((course) => <li key={course.id} className="flex justify-between gap-3"><span>{course.name}</span><span className="shrink-0 tabular-nums">{course.academicYear}</span></li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-3 rounded-xl bg-[#f5f3eb] px-4 py-3 text-sm leading-5 text-[#5c6c6c]">No hay una cursada activa registrada para este ciclo.</p>
              )}
              <Link to="/inscripcion" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#145c58] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68]">
                Solicitar una nueva inscripción <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="rounded-[26px] border border-[#e1e2d9] bg-[#fffefa] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4eee9] text-[#145c58]"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#556a63]">Aprendizajes</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#173b54]">Materias y calificaciones</h2>
                </div>
              </div>
              {selectedStudent.subjects.length ? (
                <div className="mt-5 divide-y divide-[#e9e8df]">
                  {selectedStudent.subjects.map((subject) => (
                    <div key={subject.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-sm font-semibold text-[#243f50]">{subject.name}</h3>
                        {subject.teacher && <span className="text-xs text-[#556a63]">{subject.teacher}</span>}
                      </div>
                      {subject.grades.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2" aria-label={`Calificaciones de ${subject.name}`}>
                          {subject.grades.map((grade) => <li key={grade.term} className="rounded-xl bg-[#f5f3eb] px-3 py-2 text-xs text-[#526870]">Período {grade.term}: <strong className="tabular-nums text-[#173b54]">{grade.grade.toLocaleString('es-AR')}</strong>{grade.notes && <p className="mt-1 max-w-sm leading-5 text-[#5c6c6c]">{grade.notes}</p>}</li>)}
                        </ul>
                      ) : <p className="mt-1 text-xs text-[#556a63]">Todavía no hay calificaciones cargadas.</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-[#f5f3eb] px-4 py-3 text-sm leading-5 text-[#5c6c6c]">Las materias aparecerán cuando el equipo institucional complete la asignación del ciclo.</p>
              )}
            </article>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[26px] border border-[#e1e2d9] bg-[#fffefa] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7edcf] text-[#8a6822]"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#556a63]">Organización semanal</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#173b54]">Horario de clases</h2>
                </div>
              </div>
              {orderedSchedule.length ? (
                <ol className="mt-5 space-y-2">
                  {orderedSchedule.map((item) => (
                    <li key={item.id} className="grid grid-cols-[92px_1fr] items-center gap-3 rounded-xl bg-[#f7f6f0] px-4 py-3 sm:grid-cols-[116px_1fr]">
                      <span className="text-xs font-semibold capitalize text-[#145c58]">{weekDays[item.day]}</span>
                      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <span className="text-sm font-medium text-[#243f50]">{item.subject}</span>
                        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-[#556a63]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /><time>{item.startsAt}</time>–<time>{item.endsAt}</time></span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 rounded-xl bg-[#f5f3eb] px-4 py-3 text-sm leading-5 text-[#5c6c6c]">No hay horarios publicados para los cursos activos.</p>
              )}
            </article>

            <article className="rounded-[26px] border border-[#e1e2d9] bg-[#fffefa] p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4eee9] text-[#145c58]"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#556a63]">Acompañamiento</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#173b54]">Servicios activos</h2>
                </div>
              </div>
              {selectedStudent.services.length ? (
                <ul className="mt-5 space-y-3">
                  {selectedStudent.services.map((service) => {
                    const Icon = serviceIcon(service.kind);
                    return <li key={`${service.kind}-${service.id}`} className="flex items-start gap-3 rounded-xl bg-[#f7f6f0] p-4">
                      <span className="mt-0.5 text-[#145c58]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[#556a63]">{service.kind} · {service.academicYear}</span>
                        <span className="mt-1 block text-sm font-semibold text-[#243f50]">{service.name}</span>
                        {service.detail && <span className="mt-0.5 block text-xs text-[#556a63]">{service.detail}</span>}
                      </span>
                    </li>;
                  })}
                </ul>
              ) : (
                <p className="mt-5 rounded-xl bg-[#f5f3eb] px-4 py-3 text-sm leading-5 text-[#5c6c6c]">No hay inscripciones activas a deporte, transporte o comedor.</p>
              )}
            </article>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-[#e2e2d8] bg-[#f0eee5] px-5 py-4 text-sm text-[#53686a] sm:flex-row sm:items-start">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6822]" aria-hidden="true" />
            <p><strong className="text-[#243f50]">En construcción responsable:</strong> asistencia, comunicaciones y el foro no se muestran hasta contar con registros institucionales seguros para esas funciones. Esta ficha solo presenta datos guardados por la escuela.</p>
          </section>
        </>
      )}
    </div>
  );
};
