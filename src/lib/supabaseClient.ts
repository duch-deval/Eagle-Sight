import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://xkwforssmtaeesmkckod.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd2ZvcnNzbXRhZWVzbWtja29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTE5MTYsImV4cCI6MjA3MzI2NzkxNn0.PvMkUqq7vOna9hiTZWaKxhoFrZAdfolLT9j0ES7lyV8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
