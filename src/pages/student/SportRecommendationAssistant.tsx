import { useEffect, useState } from 'react';
import { Activity, AlertCircle, Clock3, Sparkles } from 'lucide-react';
import type { PortalStudent } from '../../features/student/services/studentPortalRepository';
import {
  formatRecommendationSchedule,
  loadSportRecommendations,
  type SportRecommendation,
} from '../../features/student/services/sportRecommendationsRepository';
import { toUserFacingError } from '../../shared/utils/userFacingError';

export function SportRecommendationAssistant({ student, academicYear }: { student: PortalStudent; academicYear: number }) {
  const studentId = student.id;
  const levelId = student.courses[0]?.levelId ?? null;
  const scheduleKey = JSON.stringify(student.schedule.map((item) => ({
    day: item.day,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
  })));
  const requestKey = JSON.stringify([studentId, levelId, academicYear, scheduleKey]);
  const [loaded, setLoaded] = useState<{
    key: string;
    recommendations?: SportRecommendation[];
    error?: string;
  } | null>(null);
  const currentResult = loaded?.key === requestKey ? loaded : null;
  const recommendations = currentResult?.recommendations ?? [];
  const isLoading = currentResult === null;
  const error = currentResult?.error ?? null;

  useEffect(() => {
    let mounted = true;
    const schedule = JSON.parse(scheduleKey) as { day: number; startsAt: string; endsAt: string }[];

    void loadSportRecommendations(
      studentId,
      levelId,
      academicYear,
      schedule,
    ).then((result) => {
      if (mounted) setLoaded({ key: requestKey, recommendations: result });
    }).catch((loadError: unknown) => {
      if (mounted) setLoaded({ key: requestKey, error: toUserFacingError(loadError, 'No se pudieron evaluar los grupos deportivos.') });
    });

    return () => { mounted = false; };
  }, [studentId, levelId, academicYear, scheduleKey, requestKey]);

  return (
    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-800 shadow-sm">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-800">Asistente deportivo</p>
          <h3 className="mt-1 text-base font-bold text-edu-primary">¿Qué actividad podría sumar?</h3>
          <p className="mt-1 text-sm leading-5 text-slate-700">Busqué grupos activos de tu nivel para el ciclo {academicYear}, respetando tus clases, tus deportes actuales y el límite de dos inscripciones.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-slate-700" role="status" aria-live="polite">Revisando grupos y horarios…</p>
      ) : error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm leading-5 text-red-900" role="alert"><AlertCircle className="mr-2 inline h-4 w-4" aria-hidden="true" />{error}</p>
      ) : recommendations.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm leading-5 text-slate-700" role="status">
          No encontré grupos compatibles para este ciclo. Puede que ya tengas dos deportes, que no haya grupos activos para tu nivel o que sus horarios coincidan con tus clases.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Deportes compatibles">
          {recommendations.map((recommendation) => (
            <li key={recommendation.id} className="rounded-xl border border-blue-100 bg-white p-4">
              <div className="flex items-start gap-2">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-blue-800" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{recommendation.sportName}</p>
                  <p className="mt-0.5 text-sm text-slate-700">{recommendation.groupName}</p>
                  {recommendation.teacherName && <p className="mt-1 text-xs text-slate-600">Docente: {recommendation.teacherName}</p>}
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-700">
                    <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{formatRecommendationSchedule(recommendation.schedule)}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-600">Cupo sujeto a confirmación de administración ({recommendation.capacity} lugares por grupo).</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-700">La sugerencia no crea una inscripción. Administración debe confirmar vacantes y registrar el alta institucional.</p>
    </div>
  );
}
