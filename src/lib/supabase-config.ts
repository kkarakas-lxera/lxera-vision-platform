import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://xwfweumeryrgbguwrocr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw";

/**
 * Create a Supabase client with enhanced auth configuration
 */
export const createAuthenticatedClient = () => {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'lxera-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-client-info': 'lxera-vision-platform'
      }
    }
  });
};

/**
 * Get auth headers for manual API calls
 */
export async function getAuthHeaders(supabaseClient: any) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  if (!session) {
    throw new Error('No authenticated session');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  };
}