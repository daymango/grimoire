// ============================================================
//  The Grimoire — Supabase Client (public/read-only access)
//  All data is publicly readable. DM edits are protected by
//  the password in nav.js, not by Supabase auth.
// ============================================================

const SUPABASE_URL     = 'https://kwsyticbuyfytzdijuwd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PZ4d5mHnL24ur7KNq13_Aw_W5XAZOSC';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
