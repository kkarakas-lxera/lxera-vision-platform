import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import SkillsGapOnboarding from '@/components/onboarding/SkillsGapOnboarding';

const EarlyAccessOnboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leadData, setLeadData] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid or missing verification token');
        setLoading(false);
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
    console.log('=== EARLY ACCESS SIGNUP DEBUG ===');
    console.log('Lead Data:', {
      id: leadData.id,
      email: leadData.email,
      name: leadData.name,
      status: leadData.status
    });
    console.log('Form Data:', {
      company: data.company,
      industry: data.industry,
      role: data.role,
      teamSize: data.teamSize,
      useCases: data.useCases,
      heardAbout: data.heardAbout,
      passwordLength: data.password.length
    });

    try {
      // First check if user already exists in the database
      console.log('Checking if user already exists in database...');
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email, role, company_id')
        .eq('email', leadData.email.toLowerCase());
      
      console.log('Existing users check:', {
        users: existingUsers,
        error: checkError,
        count: existingUsers?.length || 0
      });

      // Check auth.users table too
      console.log('Checking auth status...');
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      console.log('Current auth user:', currentAuthUser);

      // Create auth account for early access user
      console.log('Invoking complete-early-access-signup edge function...');
      const response = await supabase.functions.invoke('complete-early-access-signup', {
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

      console.log('Edge function response:', response);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);

      if (response.error) {
        console.error('Edge function error details:', {
          message: response.error.message,
          status: response.error.status,
          code: response.error.code,
          details: response.error.details,
          hint: response.error.hint,
          context: response.error.context
        });
        throw response.error;
      }

      // Check if we got a redirect URL in the response
      const responseData = response.data as any;
      console.log('Parsed response data:', responseData);
      
      if (responseData?.redirectTo === '/waiting-room') {
        console.log('Redirecting to waiting room...');
        toast({
          title: 'Profile completed!',
          description: 'Welcome to the LXERA Early Access waiting room.',
        });
        // Navigate to waiting room with the lead's email
        navigate(`/waiting-room?email=${encodeURIComponent(leadData.email)}`);
      } else {
        console.log('Profile completed, redirecting to login...');
        toast({
          title: 'Profile completed!',
          description: 'Welcome to LXERA Early Access. Please sign in with your new password.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('=== PROFILE COMPLETION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      
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
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Verifying your access...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your profile setup.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SkillsGapOnboarding
      email={leadData.email}
      name={leadData.name || ''}
      leadId={leadData.id}
      isEarlyAccess={true}
      onComplete={handleComplete}
    />
  );
};

export default EarlyAccessOnboarding;