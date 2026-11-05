import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xcsdnrkgqkacmqdmedju.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjc2RucmtncWthY21xZG1lZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzI2NzYsImV4cCI6MjA5NjE0ODY3Nn0.8X_Jr8JQmO3lojcxoG-hhz6FEPCOiqf3EQ4QR5vNRFI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
