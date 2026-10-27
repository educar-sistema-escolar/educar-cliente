import { withAuthTimeout } from './authTimeout';
import type { AuthSession } from '../types';
import { supabase, requireSupabase } from './supabaseClient';
import { resolveInstitutionalRole } from './institutionalRole';

export interface SupabaseAccountSession extends AuthSession {
  profileId: string;
  profileRole: string;
}

interface AuthenticatedProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  account_status: string;
}

export async function getSupabaseAccountSession(options?: { strict?: boolean; signal?: AbortSignal }): Promise<SupabaseAccountSession | null> {
  options?.signal?.throwIfAborted();
  try {
    const account = await withAuthTimeout(readAccountSession(options));
    options?.signal?.throwIfAborted();
    return account;
  } catch (error) {
    if (options?.strict || options?.signal?.aborted) throw error;
    return null;
  }
}

async function readAccountSession(options?: { strict?: boolean; signal?: AbortSignal }): Promise<SupabaseAccountSession | null> {
  if (!supabase) return null;

  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  options?.signal?.throwIfAborted();
  if (authError && options?.strict && authError.name !== 'AuthSessionMissingError' && authError.status !== 401 && authError.status !== 403) {
    throw new Error('No se pudo validar la sesión institucional.');
  }
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  options?.signal?.throwIfAborted();
  if (sessionError && options?.strict) {
    if (sessionError.name === 'AuthSessionMissingError') return null;
    throw new Error('No se pudo validar la sesión institucional.');
  }

  if (authError || !authData.user || !sessionData.session) return null;

  const profileQuery = client
    .from('profiles')
    .select('id,email,full_name,role,is_active,account_status')
    .eq('id', authData.user.id);
  if (options?.signal) profileQuery.abortSignal(options.signal);
  const { data, error } = await profileQuery.maybeSingle();
  options?.signal?.throwIfAborted();
  if (error && options?.strict) throw new Error('No se pudo validar la cuenta institucional.');

  if (error || !data) return null;
  const profile = data as AuthenticatedProfile;
  if (profile.id !== authData.user.id || !profile.is_active || profile.account_status !== 'active') return null;

  const role = resolveInstitutionalRole(profile.role);
  if (!role) return null;

  return {
    profileId: profile.id,
    profileRole: profile.role,
    token: sessionData.session.access_token,
    role: role as AuthSession['role'],
    email: profile.email || authData.user.email || '',
    name: profile.full_name?.trim() && !profile.full_name.includes('@') ? profile.full_name.trim() : '',
    authSource: 'supabase',
  };
}

// This optional display lookup never grants access or changes the validated identity.
export async function getStudentDisplayName(account: SupabaseAccountSession, signal: AbortSignal): Promise<string> {
  const fallback = account.name.trim() && !account.name.includes('@') ? account.name.trim() : '';
  if (account.role !== 'student') return fallback;
  signal.throwIfAborted();
  try {
    const { data, error } = await withAuthTimeout(requireSupabase().from('people')
      .select('first_name,last_name').eq('profile_id', account.profileId).eq('is_active', true)
      .abortSignal(signal).maybeSingle());
    signal.throwIfAborted();
    if (error || !data) return fallback;
    const name = [data.first_name, data.last_name].filter(part => typeof part === 'string').map(part => part.trim()).filter(Boolean).join(' ');
    return name && !name.includes('@') ? name : fallback;
  } catch (error) {
    if (signal.aborted) throw error;
    return fallback;
  }
}

export async function loginInstitutionalUser(email: string, password: string): Promise<SupabaseAccountSession> {
  const { error } = await withAuthTimeout(requireSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  }));
  if (error) {
    if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
      throw new Error('No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.');
    }
    throw new Error('No se pudo validar el acceso. Revisá tus credenciales o contactá a la institución.');
  }

  const session = await getSupabaseAccountSession();
  if (session) return session;

  await withAuthTimeout(requireSupabase().auth.signOut());
  throw new Error('La cuenta no tiene un portal institucional habilitado. Contactá a administración.');
}

export async function getSupabaseAdminSession(): Promise<AuthSession | null> {
  const session = await getSupabaseAccountSession();
  return session?.role === 'superadmin' ? session : null;
}

export async function loginSuperadmin(email: string, password: string): Promise<AuthSession> {
  const session = await loginInstitutionalUser(email, password);
  if (session.role !== 'superadmin') {
    await withAuthTimeout(requireSupabase().auth.signOut());
    throw new Error('La cuenta no tiene acceso administrativo activo.');
  }
  return session;
}

export async function signOutSupabase() {
  if (!supabase) return;
  const { error } = await withAuthTimeout(supabase.auth.signOut());
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await withAuthTimeout(requireSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/login?mode=reset`,
  }));
  if (error) throw new Error(error.message);
}

export async function updateSupabasePassword(password: string): Promise<void> {
  const { error } = await withAuthTimeout(requireSupabase().auth.updateUser({ password }));
  if (error) throw new Error(error.message);
}

export function subscribeToSupabaseAuth(callback: () => void, onInvalidate?: () => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(event => {
    // The portal owns its initial read; invalidation must run before deferred SDK queries.
    if (onInvalidate && event === 'INITIAL_SESSION') return;
    onInvalidate?.();
    window.setTimeout(callback, 0);
  });
  return () => data.subscription.unsubscribe();
}
