import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Share2, Users, FileText, Slack, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const WaitingRoom = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    const loadLeadData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        // Get lead data
        const { data: lead, error } = await supabase
          .from('early_access_leads')
          .select('*')
          .eq('email', email)
          .single();

        if (error) throw error;

        setLeadData(lead);

        // Get total waitlist count
        const { count } = await supabase
          .from('early_access_leads')
          .select('*', { count: 'exact', head: true })
          .in('status', ['waitlisted', 'invited', 'converted']);

        setTotalLeads(count || 0);
      } catch (error) {
        console.error('Error loading lead data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeadData();
  }, [email]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to LXERA Early Access! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Hi {leadData.name || 'there'}, you're officially on the list!
          </p>
        </div>

        {/* Position Card */}
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
              Estimated access: March 2024
            </p>
          </CardContent>
        </Card>

        {/* Referral Card */}
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
        {leadData.company && (
          <div className="mt-8 text-center text-gray-600">
            <p>
              Registered as: <strong>{leadData.name}</strong> from{' '}
              <strong>{leadData.company}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;