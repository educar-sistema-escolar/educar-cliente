import { getSupabaseAccountSession } from '../auth/services/supabaseAuth';
import { getStudentIds, loadStudentSports, loadStudentTransport } from '../student/services/studentPortalRepository';
import type { ChatLookupResult, ChatLookupTopic } from './chatbotTypes';

export type ChatbotRepositoryErrorCode = 'SESSION_REQUIRED' | 'STUDENT_REQUIRED' | 'LINKAGE_REQUIRED' | 'LINKAGE_AMBIGUOUS' | 'QUERY_FAILED' | 'SESSION_CHANGED' | 'INVALID_TOPIC' | 'ABORTED';

const messages: Record<ChatbotRepositoryErrorCode, string> = {
  SESSION_REQUIRED: 'Inicia sesión con tu cuenta institucional para consultar tus servicios.',
  STUDENT_REQUIRED: 'Esta consulta está disponible únicamente para estudiantes.',
  LINKAGE_REQUIRED: 'Tu cuenta todavía no tiene un legajo activo vinculado. Comunícate con administración.',
  LINKAGE_AMBIGUOUS: 'No pudimos identificar un único legajo activo. Comunícate con administración.',
  QUERY_FAILED: 'No pudimos consultar tu información. Inténtalo nuevamente.',
  SESSION_CHANGED: 'Tu sesión cambió. Inicia sesión nuevamente para consultar tus servicios.',
  INVALID_TOPIC: 'La consulta solicitada no está disponible.',
  ABORTED: 'La consulta fue cancelada.',
};

export class ChatbotRepositoryError extends Error {
  readonly code: ChatbotRepositoryErrorCode;
  constructor(code: ChatbotRepositoryErrorCode) {
    super(messages[code]);
    this.name = code === 'ABORTED' ? 'AbortError' : 'ChatbotRepositoryError';
    this.code = code;
  }
}

function checkCancelled(signal: AbortSignal) {
  if (signal.aborted) throw new ChatbotRepositoryError('ABORTED');
}

async function activeStudentId(profileId: string, signal: AbortSignal) {
  checkCancelled(signal);
  const students = await getStudentIds(profileId, 'student', signal);
  checkCancelled(signal);
  if (!students.length) throw new ChatbotRepositoryError('LINKAGE_REQUIRED');
  if (students.length !== 1) throw new ChatbotRepositoryError('LINKAGE_AMBIGUOUS');
  return students[0].id;
}

export async function lookupStudentChatbotServices(topic: ChatLookupTopic, signal: AbortSignal): Promise<ChatLookupResult> {
  checkCancelled(signal);
  if (topic !== 'transport' && topic !== 'sports') throw new ChatbotRepositoryError('INVALID_TOPIC');
  try {
    const account = await getSupabaseAccountSession({ strict: true, signal });
    checkCancelled(signal);
    if (!account) throw new ChatbotRepositoryError('SESSION_REQUIRED');
    if (account.role !== 'student') throw new ChatbotRepositoryError('STUDENT_REQUIRED');
    const studentId = await activeStudentId(account.profileId, signal);
    checkCancelled(signal);
    const result: ChatLookupResult = topic === 'transport'
      ? { topic, items: await loadStudentTransport(studentId, signal) }
      : { topic, items: await loadStudentSports(studentId, signal) };
    checkCancelled(signal);

    // Do not deliver an A-account response after a logout, identity/role change or revoked linkage.
    const current = await getSupabaseAccountSession({ strict: true, signal });
    checkCancelled(signal);
    if (!current || current.profileId !== account.profileId || current.role !== 'student') throw new ChatbotRepositoryError('SESSION_CHANGED');
    const currentStudentId = await activeStudentId(current.profileId, signal);
    checkCancelled(signal);
    if (currentStudentId !== studentId) throw new ChatbotRepositoryError('SESSION_CHANGED');
    return result;
  } catch (error) {
    checkCancelled(signal);
    if (error instanceof ChatbotRepositoryError) throw error;
    throw new ChatbotRepositoryError('QUERY_FAILED');
  }
}
