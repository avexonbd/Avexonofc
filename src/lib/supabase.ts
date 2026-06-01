import { createClient } from "@supabase/supabase-js";
import supabaseConfig from "../supabase_config.json";
import { safeLocalStorage } from "../utils/safeStorage";

const getSavedCredential = (key: string): string => {
  const saved = safeLocalStorage.getItem(key);
  if (saved && saved.trim()) return saved.trim();
  return "";
};

const supabaseUrl = (
  getSavedCredential("VITE_SUPABASE_URL") ||
  ((supabaseConfig as any).VITE_SUPABASE_URL || "") ||
  (((import.meta as any).env?.VITE_SUPABASE_URL) || "")
).trim();

const supabaseAnonKey = (
  getSavedCredential("VITE_SUPABASE_ANON_KEY") ||
  ((supabaseConfig as any).VITE_SUPABASE_ANON_KEY || "") ||
  (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || "")
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" &&
  supabaseUrl.length > 0
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

