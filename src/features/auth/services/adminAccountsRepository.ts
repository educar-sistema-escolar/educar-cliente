import type { DemoUserRole } from '../types';
import { requireSupabase } from './supabaseClient';

export type AdminAccountRole = DemoUserRole;

export interface AdminAccount {
  id: string;
  email: string;
  full_name: string;
  role: AdminAccountRole;
  is_active: boolean;
  created_at: string;
}

export interface InviteAdminAccountInput {
  email: string;
  full_name: string;
  role: AdminAccountRole;
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id,email,full_name,role,is_active,created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminAccount[];
}

export async function inviteAdminAccount(input: InviteAdminAccountInput): Promise<AdminAccount> {
  const { data, error } = await requireSupabase().functions.invoke('admin-provision-user', {
    body: input,
  });

  if (error) throw new Error(error.message);
  if (!data?.account) throw new Error(data?.error || 'The account could not be created.');
  return data.account as AdminAccount;
}

export async function updateAdminAccount(
  id: string,
  changes: Pick<AdminAccount, 'role' | 'is_active'>,
): Promise<AdminAccount> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update(changes)
    .eq('id', id)
    .select('id,email,full_name,role,is_active,created_at')
    .single();

  if (error) throw new Error(error.message);
  return data as AdminAccount;
}
