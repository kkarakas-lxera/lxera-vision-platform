import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Users, Calendar, ArrowRight } from 'lucide-react';
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
        {/* Compact Welcome Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {profileCompleted ? `Hi ${leadData.name || 'there'}!` : 'Almost there...'}
            </h1>
            {profileCompleted && (
              <Badge className="bg-future-green text-white">
                ✓ Waitlisted
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            {profileCompleted 
              ? "You're officially on the LXERA early access list."
              : 'Complete your profile to join the waitlist'
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

        {/* Compact Position Card */}
        {profileCompleted && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-future-green mb-1">
                    #{leadData.waitlist_position || 'TBD'}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    of {totalLeads} applicants
                  </p>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-future-green" />
                  <div>
                    <p className="font-semibold">Estimated Access</p>
                    <p className="text-sm text-gray-600">March 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* What Happens Next - Attention Grabbing */}
        {profileCompleted && (
          <Card className="mb-6 border-2 border-future-green/20 bg-gradient-to-br from-future-green/5 to-future-green/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="w-6 h-6 text-future-green animate-pulse" />
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-future-green text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">We're building something amazing</h4>
                    <p className="text-sm text-gray-600">Our team is hard at work developing the most advanced L&D platform ever created.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-future-green text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">You'll get early access</h4>
                    <p className="text-sm text-gray-600">Based on your position, you'll receive an invitation to try LXERA before anyone else.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-future-green text-white flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Shape the future of L&D</h4>
                    <p className="text-sm text-gray-600">Your feedback will directly influence how we build the platform that transforms learning.</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white/50 rounded-lg border border-future-green/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-future-green" />
                    <span className="font-semibold text-sm">Stay tuned</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    We'll email you with updates on our progress and when it's your turn to access the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Compact Profile Summary */}
        {profileCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name</span>
                  <p className="font-medium">{leadData.name || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Company</span>
                  <p className="font-medium">{leadData.company || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Role</span>
                  <p className="font-medium">
                    {leadData.role ? leadData.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Focus</span>
                  <p className="font-medium">
                    {leadData.use_case ? leadData.use_case.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaitingRoom;