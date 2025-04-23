
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jchrkbdmidyjnrpiaulo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaHJrYmRtaWR5am5ycGlhdWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTM1NDYsImV4cCI6MjA2MDkyOTU0Nn0.B7WAUizJ0ikOyFpHzFGxvElyL9sCJ8jniQNpKs9wOFk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
