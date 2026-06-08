import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// supabase is null when env vars are missing → app falls back to localStorage only
export const supabase =
  url && key && !url.includes('xxxxxxxxxxxx')
    ? createClient(url, key)
    : null;
