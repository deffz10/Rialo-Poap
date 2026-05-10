import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://epxucjibqzrqifcjhugz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweHVjamlicXpycWlmY2podWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTE1MjMsImV4cCI6MjA5MjY4NzUyM30.nq79XajuoR5WdSHh3pBMvf1UjF_aiK9Mdz9uOqzhLGs'
)