import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import FormProfileBuilder from '@/components/learner/FormProfileBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LearnerProfile() {
  const navigate = useNavigate();
  const profileCompletion = useProfileCompletion();

  const handleProfileComplete = () => {
    // Don't navigate - the FormProfileBuilder will show success screen
    console.log('Profile completed successfully');
  };

  if (profileCompletion.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no employee record exists, show a message
  if (!profileCompletion.employeeId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Setup Required</CardTitle>
            <CardDescription>
              Your employee profile has not been created yet. Please contact your administrator to set up your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please reach out to your HR department or system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show profile completion flow
  return (
    <FormProfileBuilder
      employeeId={profileCompletion.employeeId}
      onComplete={handleProfileComplete}
    />
  );
}