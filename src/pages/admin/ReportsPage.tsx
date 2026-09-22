import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { getAdminReport, type AdminReportCode } from '../../features/admin/services/servicesRepository';

const options: Array<{ code: AdminReportCode; label: string }> = [
  { code: 'student_overview', label: 'Resumen por alumno' },
  { code: 'students_by_course', label: 'Alumnos por curso' },
  { code: 'students_by_subject', label: 'Alumnos por materia' },
  { code: 'teachers_by_level', label: 'Docentes por nivel' },
  { code: 'students_by_sport', label: 'Alumnos por deporte' },
  { code: 'students_by_sport_schedule', label: 'Deporte, horario y profesor' },
  { code: 'students_by_transport', label: 'Alumnos por recorrido' },
];

const csvValue = (value: unknown) => JSON.stringify(typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? ''));

export function ReportsPage() {
  const [reportCode, setReportCode] = useState<AdminReportCode>('students_by_course');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await getAdminReport(reportCode)); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el reporte.'); } finally { setLoading(false); }
  }, [reportCode]);

  // Report selection is an external query boundary; load owns the async state lifecycle.
  useEffect(() => { void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  const columns = useMemo(() => [...new Set(rows.flatMap((row) => Object.keys(row)))], [rows]);
  const exportCsv = () => {
    const content = [columns.join(','), ...rows.map((row) => columns.map((column) => csvValue(row[column])).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `${reportCode}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><span className="text-[10px] font-bold uppercase tracking-wider text-edu-secondary">Superadmin</span><h1 className="mt-1 text-lg font-bold text-edu-primary">Reportes administrativos</h1><p className="mt-1 text-xs text-edu-muted">Información real de alumnos, docentes, servicios y actividades.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><select aria-label="Tipo de reporte" className="h-9 rounded-lg border border-edu-border bg-white px-3 text-xs" value={reportCode} onChange={(event) => setReportCode(event.target.value as AdminReportCode)}>{options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}</select><button disabled={loading || rows.length === 0} onClick={exportCsv} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-edu-border px-3 text-xs font-semibold text-edu-secondary disabled:opacity-40"><Download size={14} />Exportar CSV</button></div></section>
    {error && <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"><AlertTriangle size={15} />{error}<button className="ml-auto font-bold underline" onClick={() => void load()}>Reintentar</button></div>}
    <section className="overflow-hidden rounded-2xl border border-edu-border/60 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs text-slate-600"><caption className="sr-only">Resultado del reporte</caption><thead className="border-b border-edu-border/70 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-edu-muted"><tr>{columns.map((column) => <th scope="col" key={column} className="px-4 py-3">{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody className="divide-y divide-edu-border/60">{loading ? <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-8 text-center"><RefreshCw className="mx-auto animate-spin" size={16} /></td></tr> : rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="px-4 py-8 text-center text-edu-muted">No hay datos para este reporte.</td></tr> : rows.map((row, index) => <tr key={index} className="hover:bg-slate-50/60">{columns.map((column) => <td key={column} className="max-w-sm px-4 py-3 align-top">{typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column] ?? '—')}</td>)}</tr>)}</tbody></table></div></section>
  </div>;
}
