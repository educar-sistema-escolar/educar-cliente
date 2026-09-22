import type { AdminAccountRole } from '../types';
import { requireSupabase } from './supabaseClient';

export type { AdminAccountRole } from '../types';

export interface AdminAccount {
  id: string;
  email: string;
  full_name: string;
  role: AdminAccountRole;
  is_active: boolean;
  account_status: 'invited' | 'active' | 'inactive';
  invited_at: string | null;
  activated_at: string | null;
  created_at: string;
}

export interface InviteAdminAccountInput {
  email: string;
  full_name: string;
  role: AdminAccountRole;
}

export interface ProvisionedAccountResult {
  account: AdminAccount;
  invited: boolean;
  idempotent: boolean;
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id,email,full_name,role,is_active,account_status,invited_at,activated_at,created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminAccount[];
}

export async function inviteAdminAccount(input: InviteAdminAccountInput): Promise<ProvisionedAccountResult> {
  const { data, error } = await requireSupabase().functions.invoke('admin-provision-user', {
    body: input,
  });

  if (error) throw new Error(error.message);
  if (!data?.account) throw new Error(data?.error || 'The account could not be created.');
  return data as ProvisionedAccountResult;
}

export async function updateAdminAccount(
  id: string,
  changes: Pick<AdminAccount, 'role' | 'is_active'> & Partial<Pick<AdminAccount, 'account_status'>>,
): Promise<AdminAccount> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .update(changes)
    .eq('id', id)
    .select('id,email,full_name,role,is_active,account_status,invited_at,activated_at,created_at')
    .single();

  if (error) throw new Error(error.message);
  return data as AdminAccount;
}

export async function linkGuardianToStudent(input: {
  studentId: string;
  guardianProfileId: string;
  relationshipType: string;
  isPrimary: boolean;
}): Promise<void> {
  const { error } = await requireSupabase().rpc('link_student_guardian', {
    p_student_id: input.studentId,
    p_guardian_profile_id: input.guardianProfileId,
    p_relationship_type: input.relationshipType,
    p_is_primary: input.isPrimary,
  });

  if (error) throw new Error(error.message);
}
