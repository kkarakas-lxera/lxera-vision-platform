import React from 'react';
import { Calendar, Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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

  const pendingCount = session.total_employees - session.successful - session.failed;
  const hasErrors = session.failed > 0;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Date and time row */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Session:</span>
            <span>{format(new Date(session.created_at), 'MMM d, yyyy')} – {format(new Date(session.created_at), 'hh:mm a')}</span>
          </div>
          
          {/* Status row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{session.total_employees} employees added</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700">{session.successful} ready</span>
            </div>
            {hasErrors && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">{session.failed} with missing data</span>
                </div>
              </>
            )}
            {pendingCount > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-700">{pendingCount} incomplete</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}