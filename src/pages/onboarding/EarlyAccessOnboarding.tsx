import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import SkillsGapOnboarding from '@/components/onboarding/SkillsGapOnboarding';

const EarlyAccessOnboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: 'Invalid Link',
          description: 'No token provided. Please use the link from your email.',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      try {
        // Verify magic link
        const response = await supabase.functions.invoke('verify-magic-link', {
          body: { token }
        });

        if (response.error) throw response.error;

        const data = response.data as any;

        if (data.success && data.lead) {
          setLeadData(data.lead);
          setLoading(false);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error: any) {
        console.error('Token verification error:', error);
        toast({
          title: 'Link Expired',
          description: 'This link has expired or already been used. Please request a new one.',
          variant: 'destructive'
        });
        navigate('/');
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleComplete = async (data: { 
    password: string; 
    company: string; 
    industry: string;
    role: string; 
    teamSize: string; 
    useCases: string[]; 
    heardAbout: string 
  }) => {
    try {
      // Create auth account for early access user
      const { error } = await supabase.functions.invoke('complete-early-access-signup', {
        body: {
          leadId: leadData.id,
          password: data.password,
          company: data.company,
          industry: data.industry,
          role: data.role,
          teamSize: data.teamSize,
          useCases: data.useCases,
          heardAbout: data.heardAbout
        }
      });

      if (error) throw error;

      toast({
        title: 'Profile completed!',
        description: 'Welcome to LXERA Early Access. Please sign in with your new password.',
      });

      // Redirect to login
      navigate('/login');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Loader2 className="h-12 w-12 animate-spin text-future-green mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifying your access...
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare your profile setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SkillsGapOnboarding
      email={leadData.email}
      name={leadData.name || ''}
      leadId={leadData.id}
      onComplete={handleComplete}
    />
  );
};

export default EarlyAccessOnboarding;