import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  session_metadata?: any;
}

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  gap_score?: number;
  invitation_status?: 'not_sent' | 'sent' | 'viewed' | 'completed';
  profile_completed?: boolean;
  cv_uploaded?: boolean;
}

interface OnboardingStats {
  total: number;
  withCV: number;
  analyzed: number;
  avgGapScore: number;
  notInvited: number;
  pending: number;
  completed: number;
  profilesCompleted: number;
  cvsUploaded: number;
}

interface OnboardingContextType {
  // State
  importSessions: ImportSession[];
  employeeStatuses: EmployeeStatus[];
  loading: boolean;
  stats: OnboardingStats;
  hasPositions: boolean;
  checkingPositions: boolean;
  companyMode: 'manual' | 'automated';
  hrisConnection: any;
  
  // Actions
  fetchImportSessions: () => Promise<void>;
  fetchEmployeeStatuses: () => Promise<void>;
  checkForPositions: () => Promise<void>;
  setCompanyMode: (mode: 'manual' | 'automated') => void;
  refreshData: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { userProfile } = useAuth();
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPositions, setHasPositions] = useState(false);
  const [checkingPositions, setCheckingPositions] = useState(true);
  const [companyMode, setCompanyModeState] = useState<'manual' | 'automated'>('manual');
  const [hrisConnection, setHrisConnection] = useState<any>(null);

  // Calculate statistics
  const stats: OnboardingStats = {
    total: employeeStatuses.length,
    withCV: employeeStatuses.filter(e => e.cv_status !== 'missing').length,
    analyzed: employeeStatuses.filter(e => e.cv_status === 'analyzed').length,
    avgGapScore: 0,
    notInvited: employeeStatuses.filter(e => e.invitation_status === 'not_sent').length,
    pending: employeeStatuses.filter(e => e.invitation_status === 'sent' || e.invitation_status === 'viewed').length,
    completed: employeeStatuses.filter(e => e.invitation_status === 'completed').length,
    profilesCompleted: employeeStatuses.filter(e => e.profile_completed).length,
    cvsUploaded: employeeStatuses.filter(e => e.cv_uploaded).length
  };

  const fetchImportSessions = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImportSessions(data || []);
    } catch (error) {
      console.error('Error fetching import sessions:', error);
    }
  };

  const fetchEmployeeStatuses = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_users')
        .select(`
          id,
          full_name,
          email,
          st_user_profiles!inner(
            position_title,
            cv_uploaded,
            cv_analyzed,
            skills_extracted,
            profile_completed
          ),
          profile_invitations(
            sent_at,
            viewed_at,
            completed_at
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('role', 'learner');

      if (error) throw error;

      const statuses = (data || []).map(user => {
        const profile = user.st_user_profiles[0];
        const invitation = user.profile_invitations?.[0];
        
        let invitationStatus: EmployeeStatus['invitation_status'] = 'not_sent';
        if (invitation?.completed_at) invitationStatus = 'completed';
        else if (invitation?.viewed_at) invitationStatus = 'viewed';
        else if (invitation?.sent_at) invitationStatus = 'sent';

        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          position: profile?.position_title || 'Not Assigned',
          cv_status: profile?.cv_analyzed 
            ? 'analyzed' 
            : profile?.cv_uploaded 
              ? 'uploaded' 
              : 'missing',
          skills_analysis: profile?.skills_extracted 
            ? 'completed' 
            : 'pending',
          gap_score: undefined,
          invitation_status: invitationStatus,
          profile_completed: profile?.profile_completed || false,
          cv_uploaded: profile?.cv_uploaded || false
        };
      });

      setEmployeeStatuses(statuses);
    } catch (error) {
      console.error('Error fetching employee statuses:', error);
    }
  };

  const checkForPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, count } = await supabase
        .from('st_company_positions')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);
      
      setHasPositions((count || 0) > 0);
    } catch (error) {
      console.error('Error checking positions:', error);
    } finally {
      setCheckingPositions(false);
    }
  };

  const setCompanyMode = (mode: 'manual' | 'automated') => {
    setCompanyModeState(mode);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchImportSessions(),
      fetchEmployeeStatuses(),
      checkForPositions()
    ]);
    setLoading(false);
  };

  // Initialize data on mount
  useEffect(() => {
    if (userProfile?.company_id) {
      refreshData();
    }
  }, [userProfile?.company_id]);

  // Fetch company mode on mount
  useEffect(() => {
    const fetchCompanyMode = async () => {
      if (!userProfile?.company_id) return;
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('onboarding_mode')
          .eq('id', userProfile.company_id)
          .single();
        
        if (error) throw error;
        if (data?.onboarding_mode) {
          setCompanyModeState(data.onboarding_mode);
        }
      } catch (error) {
        console.error('Error fetching company mode:', error);
      }
    };

    fetchCompanyMode();
  }, [userProfile?.company_id]);

  const value: OnboardingContextType = {
    importSessions,
    employeeStatuses,
    loading,
    stats,
    hasPositions,
    checkingPositions,
    companyMode,
    hrisConnection,
    fetchImportSessions,
    fetchEmployeeStatuses,
    checkForPositions,
    setCompanyMode,
    refreshData
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};