import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hbboikgafbxqnsqnzgsu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYm9pa2dhZmJ4cW5zcW56Z3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDc3NTgsImV4cCI6MjA4ODkyMzc1OH0.h_WXmGxkgDqGKoCE1iJbrPtXQ4IJXsWXaUgsvigttjM"
export const supabase = createClient(supabaseUrl, supabaseKey);