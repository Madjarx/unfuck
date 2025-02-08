import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://sryzjrhdxcsmlhapqtck.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeXpqcmhkeGNzbWxoYXBxdGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMjU1MTgsImV4cCI6MjA1NDYwMTUxOH0.Km6cDVuWSipSKIwdoR3gJCl9R27iW3r83UBhsMpTOIs";

/**
 * This file is a wrapper around the Supabase client. 
 * It creates a new client using the URL and key from the environment variables. 
 * Now, you can use the  supabase  client in your application. 
 */ 
export const supabase = createClient(supabaseUrl, supabaseKey);