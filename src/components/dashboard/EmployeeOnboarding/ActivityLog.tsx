import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Upload, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Users,
  FileText,
  Mail,
  Clock,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'import' | 'invitation' | 'profile_complete' | 'cv_upload';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  metadata?: any;
}

export default function ActivityLog() {
  const { userProfile } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [userProfile]);

  const fetchActivities = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      setRefreshing(true);
      const items: ActivityItem[] = [];

      // Fetch import sessions
      const { data: imports } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      imports?.forEach(imp => {
        items.push({
          id: `import-${imp.id}`,
          type: 'import',
          title: 'Employee Import',
          description: `Imported ${imp.successful} employees${imp.failed > 0 ? ` (${imp.failed} failed)` : ''}`,
          timestamp: imp.created_at,
          status: imp.status === 'completed' ? 'success' : imp.status === 'failed' ? 'failed' : 'pending',
          metadata: imp
        });
      });

      // Fetch recent invitations
      const { data: invitations } = await supabase
        .from('profile_invitations')
        .select(`
          *,
          employees!inner(
            id,
            company_id,
            users!left(
              email,
              full_name
            )
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .order('sent_at', { ascending: false })
        .limit(10);

      invitations?.forEach(inv => {
        const user = inv.employees?.users;
        items.push({
          id: `invite-${inv.id}`,
          type: 'invitation',
          title: 'Invitation Sent',
          description: user 
            ? `Sent to ${user.full_name} (${user.email})`
            : `Sent to employee ${inv.employee_id}`,
          timestamp: inv.sent_at,
          status: inv.completed_at ? 'success' : 'pending',
          metadata: inv
        });
      });

      // Fetch recent profile completions
      const { data: profileUpdates } = await supabase
        .from('employees')
        .select(`
          id,
          profile_completion_date,
          cv_uploaded_at,
          users!left(
            email,
            full_name
          )
        `)
        .eq('company_id', userProfile.company_id)
        .not('profile_completion_date', 'is', null)
        .order('profile_completion_date', { ascending: false })
        .limit(5);

      profileUpdates?.forEach(emp => {
        const user = emp.users;
        const userName = user?.full_name || 'Employee';
        
        items.push({
          id: `profile-${emp.id}`,
          type: 'profile_complete',
          title: 'Profile Completed',
          description: `${userName} completed their profile`,
          timestamp: emp.profile_completion_date,
          status: 'success',
          metadata: emp
        });

        if (emp.cv_uploaded_at) {
          items.push({
            id: `cv-${emp.id}`,
            type: 'cv_upload',
            title: 'CV Uploaded',
            description: `${userName} uploaded their CV`,
            timestamp: emp.cv_uploaded_at,
            status: 'success',
            metadata: emp
          });
        }
      });

      // Sort all activities by timestamp
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(items.slice(0, 15)); // Keep top 15 most recent
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'import':
        return <Upload className="h-4 w-4" />;
      case 'invitation':
        return <Send className="h-4 w-4" />;
      case 'profile_complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'cv_upload':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden h-full">
        <CardHeader className="py-2.5 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
            <CardTitle className="text-sm">Activity Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-3 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="py-2.5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm">Activity Log</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActivities}
            disabled={refreshing}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[220px]">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <Activity className="h-6 w-6 mx-auto mb-2 text-gray-300" />
              <p>No activities yet</p>
              <p className="text-xs mt-0.5">Import employees to see activity</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => (
                <div key={activity.id} className="px-3 py-2 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {React.cloneElement(getActivityIcon(activity.type), { className: 'h-3 w-3' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{activity.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}