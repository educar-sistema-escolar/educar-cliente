const technicalError = /supabase|postgrest|postgres|sql|rpc|jwt|vite_|row[- ]level|rls|42501|42\w{3}|5\d{2}|fetch failed|network/i;
const backendError = /active .* required|requires an active|must be|cannot |unsupported|not found|enrollment|constraint|violat|invalid .* (student|course|subject|sport|route|service)|permission|insufficient|duplicate|unique|already exists|capacity|reached|overlap|conflict|\b(student|teacher|course|subject|sport|transport|dining|route|service)\b/i;

function readErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return '';
  return String((error as { code?: unknown }).code ?? '');
}

export function toUserFacingError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message.trim() : '';
  const normalized = message.toLowerCase();
  const code = readErrorCode(error);

  if (code === '23505' || /duplicate|unique|already exists/i.test(normalized)) {
    return 'Ya existe un registro con esos datos. Revisá el legajo, DNI o inscripción antes de volver a intentar.';
  }
  if (code === '23503') return 'La operación referencia un registro que ya no existe o no está disponible. Actualizá la pantalla y comprobá las relaciones seleccionadas.';
  if (code === '23514') return 'Uno o más datos no respetan las reglas del sistema. Revisá los campos indicados e intentá nuevamente.';
  if (code === '42501' || /permission|superadmin|unauthorized|forbidden|row[- ]level|rls/i.test(normalized)) {
    return 'Tu cuenta no tiene permiso para esta operación. Verificá que hayas iniciado sesión con el rol correcto; si el problema continúa, contactá a administración.';
  }
  if (code === '42702' || /ambiguous/i.test(normalized)) return 'La operación quedó bloqueada por una ambigüedad en la base de datos. No la repitas; avisá a administración para que revise la configuración.';
  if (code === '42703' || /no field|column .* does not exist/i.test(normalized)) return 'La operación no coincide con la versión actual de la base de datos. Avisá a administración antes de volver a intentarlo.';
  if (/VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|supabase.*config/i.test(message)) return 'Falta configurar la conexión institucional. Administración debe revisar las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.';
  if (/invalid login credentials|credenciales invalidas|invalid credentials/i.test(normalized)) return 'El correo o la contraseña no son válidos. Revisá los datos e intentá nuevamente.';
  if (/account.*inactive|is_active.*false|cuenta.*desactivada/i.test(normalized)) return 'La cuenta está inactiva. Contactá a administración para verificar el acceso.';
  if (/capacity|cupos|reached/i.test(normalized)) return 'No hay cupos disponibles para esta operación. Elegí otro grupo o servicio.';
  if (/overlap|conflict/i.test(normalized)) return 'El horario se superpone con otra actividad. Elegí un horario distinto.';
  if (/network|fetch failed|failed to fetch/i.test(normalized)) return 'No se pudo conectar con el servidor. Comprobá tu conexión e intentá de nuevo. Si se repite, contactá a soporte.';
  if (/not found|no_data_found|pgrst116/i.test(normalized)) return 'El registro ya no está disponible. Actualizá la pantalla y volvé a buscarlo.';

  if (!message || technicalError.test(message) || backendError.test(message)) {
    if (/required|invalid|constraint|violat|unsupported|enrollment|active .* required|requires an active/i.test(normalized)) {
      return `${fallback} Revisá los datos obligatorios y las relaciones seleccionadas.`;
    }
    return `${fallback} No se pudo confirmar el resultado. Actualizá la pantalla antes de repetir la acción; si el error continúa, contactá a administración.`;
  }

  return message;
}
