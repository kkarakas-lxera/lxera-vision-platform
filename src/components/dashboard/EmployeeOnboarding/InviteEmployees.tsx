import React, { useState, useEffect } from 'react';
import { Send, Mail, UserCheck, Clock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OnboardingStepHeader } from './shared/OnboardingStepHeader';
import { OnboardingStepContainer } from './shared/OnboardingStepContainer';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  position_title?: string;
  invitation_status?: 'not_sent' | 'sent' | 'viewed' | 'completed';
  invitation_sent_at?: string;
  profile_completed?: boolean;
  cv_uploaded?: boolean;
}

interface InviteEmployeesProps {
  onInvitationsSent?: () => void;
}

export function InviteEmployees({ onInvitationsSent }: InviteEmployeesProps) {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'not_invited' | 'pending' | 'completed'>('not_invited');

  useEffect(() => {
    fetchEmployees();
  }, [userProfile?.company_id]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;
    
    setLoading(true);
    try {
      // Fetch employees with invitation status
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          position,
          department,
          profile_complete,
          profile_completion_date,
          cv_uploaded_at,
          users!left(
            full_name,
            email
          ),
          profile_invitations!left(
            sent_at,
            viewed_at,
            completed_at
          )
        `)
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data
      const transformedEmployees = (data || []).map(emp => {
        const invitation = emp.profile_invitations?.[0];
        const user = emp.users;
        
        let status: Employee['invitation_status'] = 'not_sent';
        if (invitation?.completed_at) status = 'completed';
        else if (invitation?.viewed_at) status = 'viewed';
        else if (invitation?.sent_at) status = 'sent';

        return {
          id: emp.id,
          full_name: user?.full_name || 'Unknown',
          email: user?.email || 'No email',
          position_title: emp.position,
          invitation_status: status,
          invitation_sent_at: invitation?.sent_at,
          profile_completed: emp.profile_complete || false,
          cv_uploaded: !!emp.cv_uploaded_at
        };
      });

      setEmployees(transformedEmployees);
      
      // Auto-select employees who haven't been invited
      const notInvited = transformedEmployees
        .filter(e => e.invitation_status === 'not_sent')
        .map(e => e.id);
      setSelectedEmployees(notInvited);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitations = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees to invite');
      return;
    }

    setSending(true);
    try {
      // Call edge function to send invitations
      const { data, error } = await supabase.functions.invoke('send-profile-invitations', {
        body: {
          employee_ids: selectedEmployees,
          company_id: userProfile?.company_id
        }
      });

      if (error) throw error;

      toast.success(`Successfully sent ${selectedEmployees.length} invitations`);
      
      // Refresh employee list
      await fetchEmployees();
      
      // Clear selection
      setSelectedEmployees([]);
      
      // Notify parent
      onInvitationsSent?.();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  // Filter employees based on status
  const filteredEmployees = employees.filter(emp => {
    switch (filter) {
      case 'not_invited':
        return emp.invitation_status === 'not_sent';
      case 'pending':
        return emp.invitation_status === 'sent' || emp.invitation_status === 'viewed';
      case 'completed':
        return emp.invitation_status === 'completed';
      default:
        return true;
    }
  });

  // Calculate stats
  const stats = {
    total: employees.length,
    notInvited: employees.filter(e => e.invitation_status === 'not_sent').length,
    pending: employees.filter(e => e.invitation_status === 'sent' || e.invitation_status === 'viewed').length,
    completed: employees.filter(e => e.invitation_status === 'completed').length,
    profilesCompleted: employees.filter(e => e.profile_completed).length,
    cvsUploaded: employees.filter(e => e.cv_uploaded).length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <OnboardingStepContainer>
      {/* Header */}
      <OnboardingStepHeader
        icon={Send}
        title="Invite Employees"
        description="Send personalized invitations to complete employee profiles"
        status="active"
      />

      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Completion</span>
            <span className="text-muted-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.notInvited}</p>
            <p className="text-xs text-muted-foreground">Not Invited</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.cvsUploaded}</p>
            <p className="text-xs text-muted-foreground">CVs Uploaded</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Alert className="bg-blue-50 border-blue-200">
        <Mail className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription className="space-y-1 mt-2">
          <p>• Employees receive an email with a personalized link to complete their profile</p>
          <p>• They can upload their CV and fill in additional information</p>
          <p>• Progress updates automatically as employees complete their profiles</p>
        </AlertDescription>
      </Alert>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'not_invited', label: 'Not Invited', count: stats.notInvited },
          { value: 'pending', label: 'Pending', count: stats.pending },
          { value: 'completed', label: 'Completed', count: stats.completed },
          { value: 'all', label: 'All', count: stats.total }
        ].map(tab => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.value as any)}
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg">
            <p>
              {filter === 'not_invited' && stats.total === 0 
                ? 'No employees imported yet' 
                : 'No employees in this category'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            {filter !== 'completed' && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedEmployees.length === filteredEmployees.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEmployees(filteredEmployees.map(e => e.id));
                    } else {
                      setSelectedEmployees([]);
                    }
                  }}
                />
                <span className="text-sm font-medium">Select All ({filteredEmployees.length})</span>
              </div>
            )}

            {/* Employee Cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEmployees.map(employee => (
                <div key={employee.id} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {filter !== 'completed' && (
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                      />
                    )}
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{employee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                      {employee.position_title && (
                        <p className="text-xs text-muted-foreground">{employee.position_title}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {employee.cv_uploaded && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          CV
                        </Badge>
                      )}
                      
                      {employee.invitation_status === 'not_sent' && (
                        <Badge variant="secondary">Not Invited</Badge>
                      )}
                      {employee.invitation_status === 'sent' && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                      {employee.invitation_status === 'viewed' && (
                        <Badge variant="outline" className="text-blue-600">
                          <Mail className="h-3 w-3 mr-1" />
                          Viewed
                        </Badge>
                      )}
                      {employee.invitation_status === 'completed' && (
                        <Badge variant="default" className="bg-green-600">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {selectedEmployees.length > 0 && (
          <Button 
            onClick={sendInvitations}
            disabled={sending}
            className="w-full"
            size="lg"
          >
            {sending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {selectedEmployees.length} Invitation{selectedEmployees.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={fetchEmployees}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>
    </OnboardingStepContainer>
  );
}