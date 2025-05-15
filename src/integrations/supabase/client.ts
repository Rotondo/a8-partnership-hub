import { createClient } from "@supabase/supabase-js";

// Assegure-se de definir essas variáveis no painel da Vercel (ou .env local para dev)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
