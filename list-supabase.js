import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbnkkdiysybzhyurdxhe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibmtrZGl5c3liemh5dXJkeGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDg5NTcsImV4cCI6MjA3OTQyNDk1N30.sH9YJ-22ZHbnh53dkLWaRf_u2i2MJTN49Pwq9r8m8Es';

const supabase = createClient(supabaseUrl, supabaseKey);

async function list() {
  const { data, error } = await supabase.from('display_devices').select('*');
  console.log("Rows:", data);
  console.log("Error:", error);
}

list();
