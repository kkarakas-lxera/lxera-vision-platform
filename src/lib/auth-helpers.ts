import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Verifies that we have a valid authenticated session
 * @returns Session object if valid, null otherwise
 */
export async function verifyAuthSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session) {
      console.warn('No active session found');
      return null;
    }
    
    // Check if session is expired or about to expire (within 5 minutes)
    const expiresAt = new Date(session.expires_at! * 1000);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    if (expiresAt <= fiveMinutesFromNow) {
      console.log('Session expired or expiring soon, attempting refresh...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        return null;
      }
      
      console.log('Session refreshed successfully');
      return refreshedSession;
    }
    
    console.log('Session is valid', {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: expiresAt.toISOString(),
      role: session.user.role
    });
    
    return session;
  } catch (error) {
    console.error('Unexpected error verifying session:', error);
    return null;
  }
}

/**
 * Ensures we have a valid session before proceeding
 * Throws an error if no valid session
 */
export async function requireAuthSession(): Promise<Session> {
  const session = await verifyAuthSession();
  
  if (!session) {
    throw new Error('Authentication required. Please sign in to continue.');
  }
  
  return session;
}

/**
 * Gets the current user's auth data including session
 */
export async function getCurrentAuthData() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('No authenticated session:', error);
    return null;
  }
  
  // Also verify the user exists in the database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (userError || !userData) {
    console.error('User not found in database:', userError);
    return null;
  }
  
  return {
    session,
    user: userData,
    authHeaders: {
      'Authorization': `Bearer ${session.access_token}`
    }
  };
}

/**
 * Debug function to log current auth state
 */
export async function debugAuthState() {
  console.group('🔍 Auth State Debug');
  
  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? 'Active' : 'None', sessionError);
    
    if (session) {
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
      console.log('Expires at:', new Date(session.expires_at! * 1000).toISOString());
      console.log('Access token preview:', session.access_token.substring(0, 20) + '...');
    }
    
    // Check auth.uid() in database
    const { data: authCheck, error: authError } = await supabase
      .rpc('check_auth_uid');
      
    console.log('Database auth.uid():', authCheck, authError);
    
    // Check user profile
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      console.log('User profile:', profile ? 'Found' : 'Missing', profileError);
      if (profile) {
        console.log('Role:', profile.role);
        console.log('Company ID:', profile.company_id);
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    console.groupEnd();
  }
}

/**
 * Ensures the Supabase client has the current session
 * Call this before any authenticated operations
 */
export async function ensureAuthenticatedClient() {
  const session = await verifyAuthSession();
  
  if (!session) {
    throw new Error('No authenticated session available');
  }
  
  // The supabase client should automatically use the session
  // but we can verify it's set correctly
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== session.user.id) {
    console.error('Session mismatch detected');
    throw new Error('Authentication session mismatch');
  }
  
  return true;
}