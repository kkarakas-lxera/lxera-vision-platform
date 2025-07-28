import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SkillsGapOnboarding from '@/components/onboarding/SkillsGapOnboarding';

const SkillsGapOnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [leadData, setLeadData] = useState<any>(null);
  const [isCompletingSetup, setIsCompletingSetup] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification token');
      setIsLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/verify-skills-gap-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLeadData(data.lead);
      } else {
        setError(data.error || 'Invalid or expired verification token');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setError('Failed to verify token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (onboardingData: {
    password: string;
    company: string;
    industry: string;
    role: string;
    teamSize: string;
    useCases: string[];
    heardAbout: string;
  }) => {
    setIsCompletingSetup(true);
    
    try {
      const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/complete-skills-gap-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw`,
        },
        body: JSON.stringify({
          token,
          ...onboardingData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Account created successfully! Welcome to LXERA.');
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Failed to complete setup. Please try again.');
      }
    } catch (error) {
      console.error('Setup completion error:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsCompletingSetup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Verifying your email...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !leadData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <img 
                src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" 
                alt="LXERA" 
                className="h-8 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Verification Error
              </h2>
            </div>
            
            <Alert className="mb-6">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/skills-gap-signup')}
                className="w-full"
                size="sm"
              >
                Start Over
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompletingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Setting up your account...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we create your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SkillsGapOnboarding
      email={leadData.email}
      name={leadData.name}
      leadId={leadData.id}
      onComplete={handleOnboardingComplete}
    />
  );
};

export default SkillsGapOnboardingPage;