import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionFlow from '@/components/learner/ProfileCompletionFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LearnerProfile() {
  const navigate = useNavigate();
  const profileCompletion = useProfileCompletion();

  const handleProfileComplete = () => {
    // Don't navigate - the ProfileCompletionFlow will show success screen
    console.log('Profile completed successfully');
  };

  if (profileCompletion.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show profile completion flow if profile is not complete
  if (!profileCompletion.isComplete && profileCompletion.employeeId) {
    return (
      <ProfileCompletionFlow
        employeeId={profileCompletion.employeeId}
        onComplete={handleProfileComplete}
      />
    );
  }

  // Show profile completion flow even for completed profiles
  // This allows them to see the success screen and edit their profile
  return (
    <ProfileCompletionFlow
      employeeId={profileCompletion.employeeId || ''}
      onComplete={handleProfileComplete}
    />
  );
}