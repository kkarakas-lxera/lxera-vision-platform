import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Slack, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProgressiveOnboarding from '@/components/onboarding/ProgressiveOnboarding';

const WaitingRoom = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [leadData, setLeadData] = useState<{
    id: string;
    email: string;
    name?: string;
    company?: string;
    role?: string;
    use_case?: string;
    status: string;
    waitlist_position?: number;
    heard_about?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const loadLeadData = async () => {
      // If we have a token, verify it first
      if (token) {
        try {
          const { data, error } = await supabase.functions.invoke('verify-magic-link', {
            body: { token }
          });

          if (!error && data.success && data.lead) {
            setLeadData(data.lead);
            setProfileCompleted(data.lead.status === 'profile_completed' || data.lead.status === 'waitlisted');
          }
        } catch (error) {
          console.error('Token verification error:', error);
        }
      } else if (email) {
        // If no token, just load by email
        try {
          const { data: lead, error } = await supabase
            .from('early_access_leads')
            .select('*')
            .eq('email', email)
            .single();

          if (!error && lead) {
            setLeadData(lead);
            setProfileCompleted(lead.status === 'profile_completed' || lead.status === 'waitlisted');
          }
        } catch (error) {
          console.error('Error loading lead data:', error);
        }
      }

      // Get total waitlist count
      const { count } = await supabase
        .from('early_access_leads')
        .select('*', { count: 'exact', head: true })
        .in('status', ['waitlisted', 'profile_completed', 'invited', 'converted']);

      setTotalLeads(count || 0);
      setLoading(false);
    };

  useEffect(() => {
    loadLeadData();
    
    // Poll for profile completion status if not completed
    if (!profileCompleted && email) {
      const interval = setInterval(async () => {
        try {
          const { data: lead, error } = await supabase
            .from('early_access_leads')
            .select('*')
            .eq('email', email)
            .single();
          
          if (!error && lead && (lead.status === 'profile_completed' || lead.status === 'waitlisted')) {
            setLeadData(lead);
            setProfileCompleted(true);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Check every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [email, token, profileCompleted]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-future-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your status...</p>
        </div>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Check Your Waitlist Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Enter your email to check your position in the waitlist.
            </p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <Button type="submit" className="w-full">
                Check Status
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = leadData.waitlist_position 
    ? ((totalLeads - leadData.waitlist_position + 1) / totalLeads) * 100
    : 0;

  // Create a mock auth context for the layout
  const mockAuthContext = {
    userProfile: {
      id: 'early-access',
      email: leadData?.email || email || '',
      full_name: leadData?.name || 'Early Access User',
      role: 'early_access' as const,
      company_id: null,
      company_name: leadData?.company || 'Company'
    },
    signOut: async () => {
      window.location.href = '/';
    }
  };

  return (
    <DashboardLayout isEarlyAccess={true} mockAuth={mockAuthContext}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to LXERA Early Access Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            {profileCompleted 
              ? `Hi ${leadData.name || 'there'}, you're officially on the list!`
              : 'Complete your profile to unlock your dashboard'
            }
          </p>
        </div>

        {/* Show Progressive Onboarding form if profile not completed */}
        {!profileCompleted && leadData && (
          <ProgressiveOnboarding
            email={leadData.email}
            leadId={leadData.id}
            onComplete={() => {
              setProfileCompleted(true);
              // Reload the lead data to get updated information
              loadLeadData();
            }}
          />
        )}

        {/* Position Card - Only show when profile completed */}
        {profileCompleted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Waitlist Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-future-green mb-2">
                  #{leadData.waitlist_position || 'TBD'}
                </div>
                <p className="text-gray-600">
                  of {totalLeads} total applicants
                </p>
              </div>
              
              <div className="mb-4">
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                Estimated access: March 2025
              </p>
            </CardContent>
          </Card>
        )}


        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                AI in L&D Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Download our 2024 research on AI's impact on learning.
              </p>
              <Button variant="outline" className="w-full">
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Slack className="w-5 h-5" />
                Join Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Connect with 500+ L&D leaders in our Slack community.
              </p>
              <Button variant="outline" className="w-full">
                Join Slack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Manage your email notification settings.
              </p>
              <Button variant="outline" className="w-full">
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Company Info */}
        {leadData.company && profileCompleted && (
          <div className="mt-8 text-center text-gray-600">
            <p>
              Registered as: <strong>{leadData.name}</strong> from{' '}
              <strong>{leadData.company}</strong>
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaitingRoom;