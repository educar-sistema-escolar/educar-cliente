const technicalError = /supabase|postgrest|postgres|sql|rpc|jwt|vite_|row[- ]level|rls|42501|42\w{3}|5\d{2}|fetch failed|network/i;
const backendError = /active .* required|requires an active|must be|cannot |unsupported|not found|enrollment|constraint|violat|invalid .* (student|course|subject|sport|route|service)|permission|insufficient|duplicate|unique|already exists|capacity|reached|overlap|conflict|\b(student|teacher|course|subject|sport|transport|dining|route|service)\b/i;

export function toUserFacingError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message.trim() : '';
  const normalized = message.toLowerCase();

  if (!message || technicalError.test(message) || backendError.test(message)) {
    if (/permission|superadmin|unauthorized|forbidden|row[- ]level|42501/i.test(message)) return 'No tenés permisos para realizar esta acción.';
    if (/duplicate|unique|already exists/i.test(normalized)) return 'Ya existe un registro con esos datos.';
    if (/capacity|cupos|reached/i.test(normalized)) return 'No hay cupos disponibles para esta operación.';
    if (/overlap|conflict/i.test(normalized)) return 'Existe un conflicto de horarios.';
    if (/network|fetch failed|failed to fetch/i.test(normalized)) return 'No se pudo conectar con el servidor.';
    if (/required|invalid|not found|constraint|violat|unsupported|enrollment|active .* required|requires an active/i.test(normalized)) return fallback;
    return fallback;
  }

  return message;
}
