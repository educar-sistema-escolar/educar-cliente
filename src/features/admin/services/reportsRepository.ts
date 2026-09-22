import { requireSupabase } from '../../auth/services/supabaseClient';

const repositoryError = (message: string) => new Error(`No se pudo completar el reporte administrativo: ${message}`);

export type AdminReportCode = 'student_overview' | 'students_by_course' | 'students_by_subject' | 'teachers_by_level' | 'teachers_by_level_courses' | 'teachers_by_course_schedule' | 'students_by_sport' | 'students_by_sport_level' | 'students_by_sport_schedule' | 'students_by_sport_schedule_teacher' | 'students_by_transport' | 'transport_and_dining';

export type AdminReportColumn = { key: string; label: string };
export type AdminReportDefinition = { code: AdminReportCode; label: string; columns: readonly AdminReportColumn[] };

const columns = (...entries: Array<[string, string]>): readonly AdminReportColumn[] => entries.map(([key, label]) => ({ key, label }));

export const ADMIN_REPORT_DEFINITIONS: readonly AdminReportDefinition[] = [
  { code: 'student_overview', label: 'Resumen por alumno', columns: columns(['student', 'Alumno'], ['student_number', 'Legajo'], ['courses', 'Cursos'], ['subjects', 'Materias'], ['sports', 'Deportes'], ['transport', 'Transporte'], ['dining', 'Comedor']) },
  { code: 'students_by_course', label: 'Alumnos por curso', columns: columns(['educational_level', 'Nivel educativo'], ['course', 'Curso'], ['student_number', 'Legajo'], ['student', 'Alumno']) },
  { code: 'students_by_subject', label: 'Alumnos por materia', columns: columns(['educational_level', 'Nivel educativo'], ['course', 'Curso'], ['subject', 'Materia'], ['teacher', 'Profesor'], ['student', 'Alumno'], ['student_number', 'Legajo']) },
  { code: 'teachers_by_level', label: 'Docentes por nivel', columns: columns(['educational_level', 'Nivel educativo'], ['teacher', 'Profesor'], ['subjects', 'Materias'], ['courses', 'Cursos']) },
  { code: 'teachers_by_level_courses', label: 'Docentes, cursos y materias', columns: columns(['educational_level', 'Nivel educativo'], ['teacher', 'Profesor'], ['subject', 'Materia'], ['course', 'Curso'], ['academic_year', 'Año']) },
  { code: 'teachers_by_course_schedule', label: 'Docentes y horarios de curso', columns: columns(['educational_level', 'Nivel educativo'], ['teacher', 'Profesor'], ['course', 'Curso'], ['subject', 'Materia'], ['day_of_week', 'Día'], ['starts_at', 'Desde'], ['ends_at', 'Hasta'], ['academic_year', 'Año']) },
  { code: 'students_by_sport', label: 'Alumnos por deporte', columns: columns(['sport', 'Deporte'], ['student', 'Alumno'], ['course', 'Curso'], ['educational_level', 'Nivel educativo']) },
  { code: 'students_by_sport_level', label: 'Alumnos por deporte y nivel', columns: columns(['sport', 'Deporte'], ['educational_level', 'Nivel educativo'], ['student', 'Alumno'], ['course', 'Curso'], ['academic_year', 'Año']) },
  { code: 'students_by_sport_schedule', label: 'Deporte, horario y profesor', columns: columns(['sport', 'Deporte'], ['student', 'Alumno'], ['course', 'Curso'], ['educational_level', 'Nivel educativo'], ['schedule_day', 'Día'], ['starts_at', 'Desde'], ['ends_at', 'Hasta'], ['teacher', 'Profesor']) },
  { code: 'students_by_sport_schedule_teacher', label: 'Deporte, nivel, horario y profesor', columns: columns(['sport', 'Deporte'], ['educational_level', 'Nivel educativo'], ['day_of_week', 'Día'], ['starts_at', 'Desde'], ['ends_at', 'Hasta'], ['teacher', 'Profesor'], ['student', 'Alumno'], ['course', 'Curso'], ['academic_year', 'Año']) },
  { code: 'students_by_transport', label: 'Alumnos por recorrido', columns: columns(['route', 'Recorrido'], ['stop', 'Parada'], ['student', 'Alumno'], ['course', 'Curso'], ['educational_level', 'Nivel educativo']) },
  { code: 'transport_and_dining', label: 'Transporte y comedor', columns: columns(['student', 'Alumno'], ['student_number', 'Legajo'], ['route', 'Recorrido'], ['route_name', 'Nombre del recorrido'], ['stop', 'Parada'], ['dining_service', 'Comedor'], ['dining_days_used', 'Días utilizados'], ['academic_year', 'Año']) },
];

export type AdminReportFilters = { academic_year?: number; level_id?: string; sport_id?: string; route_id?: string };

export async function getAdminReport(reportCode: AdminReportCode, filters: AdminReportFilters = {}): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await requireSupabase().rpc('get_admin_report', { p_report_code: reportCode, p_filters: filters });
  if (error) throw repositoryError(error.message);
  return Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
}
