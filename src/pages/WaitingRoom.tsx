import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Share2, Users, FileText, Slack, Mail, Loader2, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import '@/styles/tally-embed.css';

const WaitingRoom = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Listen for Tally form completion and try to prefill email
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from Tally
      if (event.origin === 'https://tally.so' && event.data?.event === 'Tally.FormSubmitted') {
        // Reload the page to show the completed state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Try to send email to Tally iframe after it loads
    if (leadData?.email) {
      const iframe = document.querySelector('.tally-embed') as HTMLIFrameElement;
      if (iframe) {
        setTimeout(() => {
          iframe.contentWindow?.postMessage({
            type: 'prefill',
            email: leadData.email
          }, 'https://tally.so');
        }, 1000);
      }
    }
    
    return () => window.removeEventListener('message', handleMessage);
  }, [leadData]);

  useEffect(() => {
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

    loadLeadData();
  }, [email, token]);

  const handleShare = () => {
    const referralUrl = `${window.location.origin}?ref=${leadData?.referral_code}`;
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: 'Referral Link Copied!',
      description: 'Share this link to move up in line.',
    });
  };

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

        {/* Show Tally form if profile not completed */}
        {!profileCompleted && leadData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Just a few quick questions to help us personalize your experience.
              </p>
              {console.log('Prefilling email:', leadData.email)}
              <div className="tally-embed-container">
                <iframe
                  src={`https://tally.so/embed/w2dO6L?transparentBackground=1&hideTitle=1&email=${encodeURIComponent(leadData.email)}&Email=${encodeURIComponent(leadData.email)}`}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  title="LXERA Early Access Form"
                  style={{ 
                    overflow: 'hidden',
                    border: 'none',
                    display: 'block',
                    minHeight: '600px'
                  }}
                  scrolling="no"
                  className="tally-embed"
                />
              </div>
            </CardContent>
          </Card>
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

        {/* Referral Card - Only show when profile completed */}
        {profileCompleted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Jump the Line
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Invite 3 colleagues and move up 50 spots for each successful referral!
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">Your referrals:</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadData.referral_count || 0} / 3
                </p>
              </div>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Referral Link
              </Button>
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