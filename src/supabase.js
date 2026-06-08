import { createClient } from '@supabase/supabase-js';

// 👇 Supabase 프로젝트 생성 후 여기에 입력하세요
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
