import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { ADMIN_REPORT_DEFINITIONS, getAdminReport, type AdminReportCode } from '../../features/admin/services/reportsRepository';
import { listEducationalLevels } from '../../features/admin/services/academicRepository';
import { listSports } from '../../features/admin/services/sportsRepository';
import { listTransportRoutes } from '../../features/admin/services/transportRepository';
import type { EducationalLevel, Sport, TransportRoute } from '../../features/admin/types';
import { toUserFacingError } from '../../shared/utils/userFacingError';

const csvValue = (value: unknown) => JSON.stringify(typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? ''));
const reportDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const displayReportValue = (value: unknown, key?: string): string => {
  if (value === null || value === undefined || value === '') return '—';
  if ((key === 'day_of_week' || key === 'schedule_day') && typeof value === 'number') return reportDays[value] ?? '—';
  if (Array.isArray(value)) return value.map((item) => displayReportValue(item)).join(', ');
  if (typeof value === 'object') return Object.values(value).map((item) => displayReportValue(item)).join(' · ') || '—';
  return String(value);
};

export function ReportsPage() {
  const [reportCode, setReportCode] = useState<AdminReportCode>('students_by_course');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [levelId, setLevelId] = useState('');
  const [sportId, setSportId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [levels, setLevels] = useState<EducationalLevel[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([listEducationalLevels(), listSports(), listTransportRoutes()]).then(([loadedLevels, loadedSports, loadedRoutes]) => {
      if (!mounted) return;
      setLevels(loadedLevels.filter((level) => level.is_active));
      setSports(loadedSports.filter((sport) => sport.is_active));
      setRoutes(loadedRoutes.filter((route) => route.is_active));
    }).catch(() => {
      if (mounted) setError('No se pudieron cargar los filtros del reporte.');
    });
    return () => { mounted = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      setRows(await getAdminReport(reportCode, { academic_year: academicYear ? Number(academicYear) : undefined, level_id: levelId || undefined, sport_id: sportId || undefined, route_id: routeId || undefined }));
    } catch (loadError) { setError(toUserFacingError(loadError, 'No se pudo cargar el reporte.')); } finally { setLoading(false); }
  }, [academicYear, levelId, reportCode, routeId, sportId]);

  // Report selection is an external query boundary; load owns the async state lifecycle.
  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const definition = useMemo(() => ADMIN_REPORT_DEFINITIONS.find((item) => item.code === reportCode) ?? ADMIN_REPORT_DEFINITIONS[0], [reportCode]);
  const reportColumns = useMemo(() => {
    const availableColumns = new Set(rows.flatMap((row) => Object.keys(row)));
    return definition.columns.filter((column) => availableColumns.has(column.key));
  }, [definition, rows]);
  const columns = reportColumns.length > 0 ? reportColumns : definition.columns;
  const exportCsv = () => {
    const content = [columns.map((column) => csvValue(column.label)).join(','), ...rows.map((row) => columns.map((column) => csvValue(row[column.key])).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `${reportCode}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span><h1 className="mt-1 text-lg font-bold text-edu-primary">Reportes administrativos</h1><p className="mt-1 text-xs text-edu-muted">Información real de alumnos, docentes, servicios y actividades.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><select aria-label="Tipo de reporte" className="h-9 rounded-lg border border-edu-border bg-white px-3 text-xs lg:col-span-2" value={reportCode} onChange={(event) => setReportCode(event.target.value as AdminReportCode)}>{ADMIN_REPORT_DEFINITIONS.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select><input aria-label="Año académico" className="h-9 rounded-lg border border-edu-border px-3 text-xs" type="number" min="1" placeholder="Año" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} /><select aria-label="Nivel educativo" className="h-9 rounded-lg border border-edu-border bg-white px-3 text-xs" value={levelId} onChange={(event) => setLevelId(event.target.value)}><option value="">Todos los niveles</option>{levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</select><select aria-label="Deporte" className="h-9 rounded-lg border border-edu-border bg-white px-3 text-xs" value={sportId} onChange={(event) => setSportId(event.target.value)}><option value="">Todos los deportes</option>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select><select aria-label="Recorrido" className="h-9 rounded-lg border border-edu-border bg-white px-3 text-xs" value={routeId} onChange={(event) => setRouteId(event.target.value)}><option value="">Todos los recorridos</option>{routes.map((route) => <option key={route.id} value={route.id}>Ruta {route.route_number} · {route.name}</option>)}</select><button disabled={loading || rows.length === 0} onClick={exportCsv} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-edu-border px-3 text-xs font-semibold text-edu-secondary disabled:opacity-40"><Download size={14} />Exportar CSV</button></div></section>
    {error && <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"><AlertTriangle size={15} />{error}<button className="ml-auto font-bold underline" onClick={() => void load()}>Reintentar</button></div>}
    <section className="overflow-hidden rounded-2xl border border-edu-border/60 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs text-slate-600"><caption className="sr-only">Resultado del reporte</caption><thead className="border-b border-edu-border/70 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-edu-muted"><tr>{columns.map((column) => <th scope="col" key={column.key} className="px-4 py-3">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-edu-border/60">{loading ? <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-8 text-center"><RefreshCw className="mx-auto animate-spin" size={16} /></td></tr> : rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-8 text-center text-edu-muted">No hay datos para este reporte.</td></tr> : rows.map((row, index) => <tr key={index} className="hover:bg-slate-50/60">{columns.map((column) => <td key={column.key} className="max-w-sm px-4 py-3 align-top">{displayReportValue(row[column.key], column.key)}</td>)}</tr>)}</tbody></table></div></section>
  </div>;
}
