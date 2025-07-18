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
    // Navigate to dashboard after profile completion
    navigate('/learner');
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

  // Show profile view for completed profiles
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Your profile is complete! You can view and edit your information here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Profile viewing and editing functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}