import type { AuthSession, DemoUserRole } from '../types';
import { supabase, requireSupabase } from './supabaseClient';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: DemoUserRole;
  is_active: boolean;
}

async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminProfile;
}

export async function getSupabaseAdminSession(): Promise<AuthSession | null> {
  if (!supabase) return null;

  const { data, error } = await requireSupabase().auth.getSession();
  if (error || !data.session) return null;

  const profile = await getAdminProfile(data.session.user.id);
  if (!profile || profile.role !== 'superadmin' || !profile.is_active) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    token: data.session.access_token,
    role: 'superadmin',
    email: profile.email || data.session.user.email || '',
    name: profile.full_name || profile.email || data.session.user.email || 'Admin',
    authSource: 'supabase',
  };
}

export async function loginSuperadmin(email: string, password: string): Promise<AuthSession> {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(error?.message || 'Credenciales inválidas.');
  }

  const profile = await getAdminProfile(data.session.user.id);
  if (!profile || profile.role !== 'superadmin' || !profile.is_active) {
    await requireSupabase().auth.signOut();
    throw new Error('La cuenta no tiene acceso administrativo activo.');
  }

  return {
    token: data.session.access_token,
    role: 'superadmin',
    email: profile.email || email,
    name: profile.full_name || profile.email || email,
    authSource: 'supabase',
  };
}

export async function signOutSupabase() {
  if (supabase) await supabase.auth.signOut();
}

export function subscribeToSupabaseAuth(callback: () => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(() => callback());
  return () => data.subscription.unsubscribe();
}
