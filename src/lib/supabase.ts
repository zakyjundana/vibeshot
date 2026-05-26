import { createClient } from "@supabase/supabase-js";

// Supabase public credentials — anon key is intentionally public (safe to expose in client code)
// See: https://supabase.com/docs/guides/api/api-keys
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://jnkvqvygiwbjkowhprcp.supabase.co";

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua3ZxdnlnaXdiamtvd2hwcmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Nzk0MjQsImV4cCI6MjA5NTM1NTQyNH0.em14Eh5U1XjD_tGA-hjDw1xuWySftejFRA_S3xt8uPI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
