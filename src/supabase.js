import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnmzdozcrzukfyqyledj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXpkb3pjcnp1a2Z5cXlsZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODEzMzUsImV4cCI6MjA5Mjk1NzMzNX0.kXPp9JVT4rZexwqhgvJ13x2DL3LOjNAlwynybrrBfUA';

export const supabase = createClient(supabaseUrl, supabaseKey);