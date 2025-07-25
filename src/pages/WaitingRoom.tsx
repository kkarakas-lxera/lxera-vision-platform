import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    profile_completed_at?: string;
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
        <Card className="max-w-md w-full bg-white border-gray-200" style={{ borderColor: 'rgb(229, 231, 235)' }}>
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
    <DashboardLayout isEarlyAccess={true} mockAuth={mockAuthContext} hideNavigation={!profileCompleted}>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Compact Welcome Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-1 gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {profileCompleted ? `Hi ${leadData.name || 'there'}!` : 'Almost there...'}
              </h1>
              {profileCompleted && (
                <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white text-xs border-emerald-700" style={{backgroundColor: '#047857', color: 'white'}}>
                  ✓ Waitlisted
                </Badge>
              )}
            </div>
            {profileCompleted && (
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:px-4">
                <span className="text-slate-700 font-medium">🚀 We're building something amazing — you'll be first to know!</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {profileCompleted 
              ? "You're officially on the LXERA early access list."
              : ''
            }
          </p>
        </div>

        {/* Show Progressive Onboarding form if profile not completed */}
        {!profileCompleted && leadData && (
          <ProgressiveOnboarding
            email={leadData.email}
            leadId={leadData.id}
            initialData={{
              name: leadData.name,
              company: leadData.company,
              role: leadData.role,
              use_case: leadData.use_case
            }}
            onComplete={() => {
              setProfileCompleted(true);
              // Reload the lead data to get updated information
              loadLeadData();
            }}
          />
        )}

        {/* Two-sided layout */}
        {profileCompleted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Side - Status & Profile */}
            <div className="space-y-3 sm:space-y-4">
              {/* Position Card */}
              <Card className="bg-white border-gray-200" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-slate-700">
                        #{leadData.waitlist_position || 'TBD'}
                      </div>
                      <p className="text-xs text-gray-600">
                        of {totalLeads} applicants
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {leadData.profile_completed_at 
                          ? new Date(leadData.profile_completed_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric' 
                            })
                          : 'Today'
                        }
                      </span>
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-1 mt-3" />
                </CardContent>
              </Card>
              
              {/* Profile Summary */}
              <Card className="bg-white border-gray-200" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="font-medium">{leadData.company || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Role:</span>
                      <span className="font-medium">
                        {leadData.role && leadData.role.trim() !== '' ? 
                          leadData.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 
                          'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Focus:</span>
                      <span className="font-medium">
                        {leadData.use_case && leadData.use_case.trim() !== '' ? 
                          leadData.use_case.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 
                          'Not specified'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Side - What Happens Next */}
            <div>
              <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100" style={{ borderColor: 'rgb(203, 213, 225)' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-4 h-4 text-slate-600 animate-pulse" />
                    What happens next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">We're building something amazing</h4>
                        <p className="text-xs text-gray-600">Our team is developing the most advanced L&D platform ever created.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">You'll get early access</h4>
                        <p className="text-xs text-gray-600">You'll receive an invitation to try LXERA before anyone else.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-0.5">Shape the future of L&D</h4>
                        <p className="text-xs text-gray-600">Your feedback will influence how we build the platform.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}



      </div>
    </DashboardLayout>
  );
};

export default WaitingRoom;