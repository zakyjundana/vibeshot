import { createClient } from "@supabase/supabase-js";

// Vite environment variables with fallback placeholder values to avoid initialization crash
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
