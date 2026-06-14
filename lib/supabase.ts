import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  gemini_api_key: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  title: string;
  transcript: string;
  summary: string;
  created_at: string;
};

export type ActionItem = {
  id: string;
  meeting_id: string;
  task: string;
  assignee: string | null;
  deadline: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
};
