import React from 'react';
import { Clock, CheckCircle2, AlertCircle, TrendingUp, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  active_position_id?: string;
  session_metadata?: {
    position_title?: string;
    [key: string]: unknown;
  };
}

interface SessionStatusCardProps {
  session: ImportSession;
  positionTitle?: string;
}

export function SessionStatusCard({ session, positionTitle }: SessionStatusCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Completed',
          badgeClass: 'bg-green-100 text-green-800'
        };
      case 'processing':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'In Progress',
          badgeClass: 'bg-blue-100 text-blue-800'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Failed',
          badgeClass: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Pending',
          badgeClass: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(session.status);
  const Icon = config.icon;
  const successRate = session.processed > 0 
    ? Math.round((session.successful / session.processed) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 ${config.bgColor}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <p className="font-medium text-sm">
                {format(new Date(session.created_at), 'MMM d, yyyy - h:mm a')}
              </p>
              {positionTitle && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <FileText className="h-3 w-3" />
                  {positionTitle}
                </p>
              )}
            </div>
          </div>
          <Badge className={config.badgeClass}>
            {config.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Employees</span>
            <span className="font-medium">{session.total_employees}</span>
          </div>

          {session.status === 'processing' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{session.processed}/{session.total_employees}</span>
              </div>
              <Progress 
                value={(session.processed / session.total_employees) * 100} 
                className="h-2"
              />
            </div>
          )}

          {(session.status === 'completed' || session.processed > 0) && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-semibold text-green-600">{successRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Analyzed</p>
                <p className="text-lg font-semibold">{session.successful}</p>
              </div>
            </div>
          )}

          {session.failed > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-3 w-3" />
              {session.failed} failed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}