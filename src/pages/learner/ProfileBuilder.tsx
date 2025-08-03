import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FormProfileBuilder from '@/components/learner/FormProfileBuilder';
import { toast } from 'sonner';

export default function ProfileBuilder() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEmployeeProfile();
  }, [userProfile]);

  const checkEmployeeProfile = async () => {
    if (!userProfile?.id) {
      navigate('/auth/signin');
      return;
    }

    try {
      // Get employee record
      const { data: employee, error } = await supabase
        .from('employees')
        .select('id, profile_complete')
        .eq('user_id', userProfile.id)
        .single();

      if (error || !employee) {
        toast.error('Employee profile not found');
        navigate('/learner/dashboard');
        return;
      }

      // If profile is already complete, redirect to dashboard
      if (employee.profile_complete) {
        navigate('/learner/dashboard');
        return;
      }

      setEmployeeId(employee.id);
    } catch (error) {
      console.error('Error checking employee profile:', error);
      toast.error('Failed to load profile');
      navigate('/learner/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    toast.success('Profile completed successfully!');
    navigate('/learner/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employeeId) {
    return null;
  }

  return (
    <FormProfileBuilder
      employeeId={employeeId}
      onComplete={handleComplete}
    />
  );
}