// ============================================================
//  The Grimoire — Supabase Client
//  Replace the two values below with your project credentials.
//  Find them at: https://supabase.com/dashboard/project/kwsyticbuyfytzdijuwd/settings/api
// ============================================================

const SUPABASE_URL = 'https://kwsyticbuyfytzdijuwd.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← paste your anon/public key

// ── Client ──────────────────────────────────────────────────
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ─────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Returns 'dm' | 'player' | null */
export async function getRole() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return data?.role ?? 'player';
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/grimoire/index.html';
}
