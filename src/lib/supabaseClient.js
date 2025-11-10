import { createClient } from "@supabase/supabase-js";

// These come from your .env file (root of project)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if they're missing — helps debug blank page issues
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[Supabase] Missing environment variables.");
  console.error("Did you restart the dev server after creating your .env file?");
  throw new Error(
    "[Supabase] Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY"
  );
}

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Optional helper to log the connection
console.log("[Supabase] Client initialized:", SUPABASE_URL);
