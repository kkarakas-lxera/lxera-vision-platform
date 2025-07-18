import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionStatus {
  isComplete: boolean;
  isLoading: boolean;
  employeeId: string | null;
  profileSections: any[];
}

export const useProfileCompletion = () => {
  const { userProfile } = useAuth();
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    isLoading: true,
    employeeId: null,
    profileSections: []
  });

  useEffect(() => {
    checkProfileCompletion();
  }, [userProfile]);

  const checkProfileCompletion = async () => {
    if (!userProfile?.id) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id, profile_complete, profile_completion_date')
        .eq('user_id', userProfile.id)
        .single();

      if (!employee) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get profile sections
      const { data: sections } = await supabase
        .from('employee_profile_sections')
        .select('*')
        .eq('employee_id', employee.id);

      setStatus({
        isComplete: employee.profile_complete || false,
        isLoading: false,
        employeeId: employee.id,
        profileSections: sections || []
      });
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  return status;
};