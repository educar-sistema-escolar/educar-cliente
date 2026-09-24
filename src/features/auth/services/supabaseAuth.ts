import type { AuthSession } from '../types';
import { supabase, requireSupabase } from './supabaseClient';

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

export async function getSupabaseAccountSession(): Promise<SupabaseAccountSession | null> {
  if (!supabase) return null;

  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  const { data: sessionData } = await client.auth.getSession();

  if (authError || !authData.user || !sessionData.session) return null;

  const { data, error } = await client
    .from('profiles')
    .select('id,email,full_name,role,is_active,account_status')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (error || !data) return null;
  const profile = data as AuthenticatedProfile;
  if (!profile.is_active || profile.account_status !== 'active') return null;

  const role = profile.role === 'guardian' ? 'parent' : profile.role;
  if (!['superadmin', 'student', 'parent'].includes(role)) return null;

  return {
    profileId: profile.id,
    profileRole: profile.role,
    token: sessionData.session.access_token,
    role: role as AuthSession['role'],
    email: profile.email || authData.user.email || '',
    name: profile.full_name || profile.email || authData.user.email || 'Usuario',
    authSource: 'supabase',
  };
}

export async function loginInstitutionalUser(email: string, password: string): Promise<SupabaseAccountSession> {
  const { error } = await requireSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error('No se pudo validar el acceso. Revisá tus credenciales o contactá a la institución.');

  const session = await getSupabaseAccountSession();
  if (session) return session;

  await requireSupabase().auth.signOut();
  throw new Error('La cuenta no tiene un portal institucional habilitado. Contactá a administración.');
}

export async function getSupabaseAdminSession(): Promise<AuthSession | null> {
  const session = await getSupabaseAccountSession();
  return session?.role === 'superadmin' ? session : null;
}

export async function loginSuperadmin(email: string, password: string): Promise<AuthSession> {
  const session = await loginInstitutionalUser(email, password);
  if (session.role !== 'superadmin') {
    await requireSupabase().auth.signOut();
    throw new Error('La cuenta no tiene acceso administrativo activo.');
  }
  return session;
}

export async function signOutSupabase() {
  if (supabase) await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/login?mode=reset`,
  });
  if (error) throw new Error(error.message);
}

export async function updateSupabasePassword(password: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export function subscribeToSupabaseAuth(callback: () => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(() => {
    window.setTimeout(callback, 0);
  });
  return () => data.subscription.unsubscribe();
}
