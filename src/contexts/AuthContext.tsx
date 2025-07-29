
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'company_admin' | 'learner';
  company_id?: string;
  is_active: boolean;
  email_verified: boolean;
  position?: string;
  metadata?: {
    early_access?: boolean;
    early_access_lead_id?: string;
    onboarded_from?: string;
    [key: string]: any;
  };
  companies?: {
    id: string;
    name: string;
    plan_type: string;
  };
  employee?: {
    id: string;
    position?: string;
    department?: string;
    current_position_id?: string;
    st_company_positions?: {
      position_title: string;
      department: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialCheckComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  contentManagerReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to avoid initial loading state
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [contentManagerReady, setContentManagerReady] = useState(false);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          email, 
          full_name, 
          role, 
          company_id, 
          is_active, 
          email_verified, 
          position,
          metadata,
          companies (
            id,
            name,
            plan_type
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // If user is a learner, fetch employee data with company info
      if (data.role === 'learner') {
        const { data: employeeData } = await supabase
          .from('employees')
          .select(`
            id,
            position,
            department,
            current_position_id,
            company_id,
            st_company_positions!employees_current_position_id_fkey (
              position_title,
              department
            ),
            companies!employees_company_id_fkey (
              id,
              name,
              plan_type
            )
          `)
          .eq('user_id', userId)
          .maybeSingle();

        if (employeeData) {
          data.employee = employeeData;
          // Override the companies data with the employee's company data
          if (employeeData.companies) {
            data.companies = employeeData.companies;
          }
        }
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to defer profile fetching and prevent deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
              setInitialCheckComplete(true);
              // Don't set loading to false here, keep it as is
            }
          }, 100);
        } else {
          setUserProfile(null);
          // Don't set loading to false here, keep it as is
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setInitialCheckComplete(true);
        return;
      }
      
      // If there is a session, the auth state change listener will handle it
      // If no session, mark initial check as complete
      if (!session) {
        setInitialCheckComplete(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Initialize content manager when user profile is ready
    if (userProfile?.company_id && userProfile?.id) {
      setContentManagerReady(true);
    } else {
      setContentManagerReady(false);
    }
  }, [userProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      // Don't set loading to true here to avoid loading state during login
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setSession(null);
    setContentManagerReady(false);
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    initialCheckComplete,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    contentManagerReady
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
