const levelLabels: Record<string, string> = {
  initial: 'Inicial',
  inicial: 'Inicial',
  primary: 'Primaria',
  primario: 'Primaria',
  primaria: 'Primaria',
  secondary: 'Secundaria',
  secundario: 'Secundaria',
  secundaria: 'Secundaria',
};

export function educationalLevelLabel(level: string | null | undefined) {
  if (!level) return level;
  return levelLabels[level.trim().toLowerCase()] ?? level;
}

export function educationalCourseYear(level: string | null | undefined, year: number | null | undefined) {
  if (!year) return null;
  const normalized = level?.trim().toLowerCase();
  if (normalized === 'initial' || normalized === 'inicial') return `Sala de ${year}`;
  return `${year}° año`;
}
