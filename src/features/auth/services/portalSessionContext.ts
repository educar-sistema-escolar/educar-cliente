import { createContext, useContext } from 'react';
import type { SupabaseAccountSession } from './supabaseAuth';

export interface VerifiedPortalSession {
  readonly account: SupabaseAccountSession;
  readonly invalidate: () => void;
  readonly revalidate: () => void;
}

export const PortalSessionContext = createContext<VerifiedPortalSession | null>(null);
export const usePortalSession = () => useContext(PortalSessionContext);
