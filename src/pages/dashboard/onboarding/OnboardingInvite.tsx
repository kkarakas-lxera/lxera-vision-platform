import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, Mail, CheckCircle, Check, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type InviteState = 'initial' | 'sending' | 'success';

export default function OnboardingInvite() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { stats, loading, refreshData } = useOnboarding();
  const [inviteState, setInviteState] = useState<InviteState>('initial');
  const [notInvitedCount, setNotInvitedCount] = useState(0);

  useEffect(() => {
    // Calculate employees not yet invited
    const notInvited = stats.total - (stats.pending + stats.completed);
    setNotInvitedCount(notInvited);
    
    // If all are already invited, show success state
    if (stats.total > 0 && notInvited === 0) {
      setInviteState('success');
    }
  }, [stats]);

  const sendAllInvitations = async () => {
    setInviteState('sending');
    
    try {
      // Get employees without invitations
      const { data: employees, error: fetchError } = await supabase
        .from('employees')
        .select(`
          id,
          users!inner(
            id,
            email,
            full_name
          )
        `)
        .eq('company_id', userProfile?.company_id)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      // Filter employees without invitations
      const employeeIds = employees?.map(e => e.id) || [];
      
      // Check existing invitations
      const { data: existingInvites } = await supabase
        .from('profile_invitations')
        .select('employee_id')
        .in('employee_id', employeeIds);
      
      const invitedIds = new Set(existingInvites?.map(i => i.employee_id) || []);
      const toInvite = employeeIds.filter(id => !invitedIds.has(id));

      if (toInvite.length === 0) {
        setInviteState('success');
        return;
      }

      // Send invitations
      const { data, error } = await supabase.functions.invoke('send-profile-invitations', {
        body: {
          employee_ids: toInvite,
          company_id: userProfile?.company_id
        }
      });

      if (error) throw error;

      await refreshData();
      setInviteState('success');
      toast.success(`Successfully sent ${toInvite.length} invitations`);
      
      // Auto-navigate after 2 seconds if we have CVs
      if (stats.withCV > 0 || stats.analyzed > 0) {
        setTimeout(() => {
          navigate('/dashboard/onboarding/analysis');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
      setInviteState('initial');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if we have employees to invite
  if (stats.total === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Invite Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Step 2 of 3 • Send invitations to employees
            </p>
          </div>
        </div>

        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-xl font-medium">No team members yet</h2>
            <p className="text-muted-foreground">Import employees first to send invitations</p>
            <Button onClick={() => navigate('/dashboard/onboarding/import')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Import
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Invite Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Step 2 of 3 • Send profile invitations
            </p>
          </div>
        </div>
        
        <Badge variant="default">Step 2</Badge>
      </div>

      {/* Progress Steps */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm text-green-600">Import</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="font-medium text-sm">Invite</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stats.analyzed > 0
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${stats.analyzed > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                Analysis
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area - Single Focus */}
      <div className="min-h-[500px] flex items-center justify-center">
        {renderInviteState()}
      </div>
    </div>
  );

  function renderInviteState() {
    switch (inviteState) {
      case 'initial':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-xl font-medium">Send profile invitations</h2>
            
            <div className="space-y-2">
              <div className="text-4xl font-bold">{notInvitedCount}</div>
              <p className="text-base text-muted-foreground">
                team member{notInvitedCount !== 1 ? 's' : ''} ready to invite
              </p>
            </div>
            
            <Button 
              size="lg"
              onClick={sendAllInvitations}
              className="min-w-[200px]"
            >
              Send All Invitations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Employees will receive an email to complete their profile
            </p>
          </div>
        );

      case 'sending':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-xl font-medium">Sending invitations...</h2>
            
            <div className="flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            
            <p className="text-base text-muted-foreground">
              Delivering to {notInvitedCount} team member{notInvitedCount !== 1 ? 's' : ''}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-2">Sent!</h2>
              <p className="text-2xl font-bold">
                {stats.total} invitation{stats.total !== 1 ? 's' : ''} delivered
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{stats.pending} pending</p>
              <p>{stats.completed} completed</p>
            </div>
            
            <div className="space-y-3">
              {stats.completed > 0 ? (
                <Button onClick={() => navigate('/dashboard/onboarding/analysis')}>
                  Continue to Analysis
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Waiting for employees to complete profiles
                  </p>
                  <Button variant="outline" onClick={() => navigate('/dashboard/onboarding')}>
                    Back to Overview
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}