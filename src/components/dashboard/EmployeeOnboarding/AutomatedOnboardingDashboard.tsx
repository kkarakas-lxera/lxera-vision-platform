import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Zap, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Link2,
  UserPlus,
  BarChart3
} from 'lucide-react';
import { HRISService } from '@/services/hrisService';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomatedOnboardingDashboardProps {
  companyId: string;
  employeeStatuses: any[];
  onRefresh: () => void;
}

export function AutomatedOnboardingDashboard({ 
  companyId, 
  employeeStatuses, 
  onRefresh 
}: AutomatedOnboardingDashboardProps) {
  const [hrisConnection, setHrisConnection] = useState<any>(null);
  const [invitationsSent, setInvitationsSent] = useState(0);
  const [profilesCompleted, setProfilesCompleted] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      // Get HRIS connection status
      const connection = await HRISService.getConnection(companyId);
      setHrisConnection(connection);

      // Get invitation stats
      const { data: invitations } = await supabase
        .from('profile_invitations')
        .select('completed_at')
        .in('employee_id', employeeStatuses.map((e: any) => e.id));

      if (invitations) {
        setInvitationsSent(invitations.length);
        setProfilesCompleted(invitations.filter(i => i.completed_at).length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleSyncEmployees = async () => {
    setLoading(true);
    try {
      await HRISService.syncEmployees(companyId);
      toast.success('Employee sync completed');
      onRefresh();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to sync employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    setLoading(true);
    try {
      // Get employees without invitations
      const { data: employees } = await supabase
        .from('employees')
        .select('id, users!inner(email, full_name)')
        .eq('company_id', companyId)
        .eq('profile_complete', false);

      if (!employees || employees.length === 0) {
        toast.info('All employees have been invited');
        return;
      }

      // Bulk send invitations via edge function
      const employeeIds = employees.map((e: any) => e.id);
      const { data, error } = await supabase.functions.invoke('send-profile-invitations', {
        body: {
          employee_ids: employeeIds,
          company_id: companyId
        }
      });

      if (error) throw error;
      toast.success(`Sent ${data?.sent ?? employeeIds.length} profile invitations`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-profile-reminder');
      
      if (error) throw error;
      
      toast.success(`Sent ${data.sent} reminder emails`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to send reminders');
    } finally {
      setLoading(false);
    }
  };

  const completionRate = employeeStatuses.length > 0 
    ? Math.round((profilesCompleted / employeeStatuses.length) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          Automated Employee Onboarding
        </h1>
        <p className="text-muted-foreground mt-1">
          Streamline onboarding with HRIS integration and employee self-service profiles
        </p>
      </div>

      {/* HRIS Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            HRIS Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hrisConnection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{hrisConnection.provider} Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Last synced: {hrisConnection.lastSyncAt 
                      ? new Date(hrisConnection.lastSyncAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Button
                  onClick={handleSyncEmployees}
                  disabled={loading || hrisConnection.syncStatus === 'syncing'}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync Employees
                </Button>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No HRIS connected. Go to <a href="/dashboard/settings" className="font-medium underline">Settings</a> to connect your HR system.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{employeeStatuses.length}</div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Invitations Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{invitationsSent}</div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Profiles Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{profilesCompleted}</div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Progress</CardTitle>
          <CardDescription>
            Track employee profile completion across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            
            {employeeStatuses.length > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={handleSendInvitations}
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Profile Invitations
                </Button>
                {invitationsSent > profilesCompleted && (
                  <Button
                    onClick={handleSendReminders}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Send Reminder Emails
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Status</CardTitle>
          <CardDescription>
            View profile completion status for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employeeStatuses.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {employee.profile_complete ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Profile Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Automated Workflow:</strong> When employees complete their profiles, 
          skills gap analysis and course assignments happen automatically based on their 
          position requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
}