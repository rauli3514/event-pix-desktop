import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atwcpxprxtkkegouogac.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2NweHByeHRra2Vnb3VvZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjIzMzksImV4cCI6MjA5NjMzODMzOX0.pMNcePW969TC5cxvHrKxeYGOn0GAwBGbvzYA6ZsllIQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
