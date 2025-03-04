import { createClient } from '@supabase/supabase-js';

// Inisialisasi URL dan kunci Supabase dari variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Membuat klien Supabase untuk akses admin dan anon
export const supabase = createClient(supabaseUrl, supabaseAnonKey, );