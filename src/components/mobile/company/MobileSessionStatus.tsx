import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Users, 
  FileText, 
  BarChart3,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface SessionStatus {
  id: string;
  type: 'import' | 'analysis' | 'export' | 'upload';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  startTime: Date;
  endTime?: Date;
  employeeCount?: number;
  processedCount?: number;
  errorMessage?: string;
  sessionName?: string;
}

interface MobileSessionStatusProps {
  sessions: SessionStatus[];
  onRetrySession?: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
  onViewDetails?: (sessionId: string) => void;
  compact?: boolean;
}

export function MobileSessionStatus({
  sessions,
  onRetrySession,
  onCancelSession,
  onViewDetails,
  compact = false
}: MobileSessionStatusProps) {
  const getStatusIcon = (status: SessionStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: SessionStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: SessionStatus['type']) => {
    switch (type) {
      case 'import':
        return <Users className="h-4 w-4" />;
      case 'upload':
        return <FileText className="h-4 w-4" />;
      case 'analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'export':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SessionStatus['type']) => {
    switch (type) {
      case 'import':
        return 'Employee Import';
      case 'upload':
        return 'CV Upload';
      case 'analysis':
        return 'Skills Analysis';
      case 'export':
        return 'Report Export';
      default:
        return 'Unknown';
    }
  };

  const getStatusLabel = (status: SessionStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getDuration = (session: SessionStatus) => {
    if (session.endTime) {
      return formatDistanceToNow(session.endTime, { addSuffix: true });
    }
    return formatDistanceToNow(session.startTime, { addSuffix: true });
  };

  const getProgressText = (session: SessionStatus) => {
    if (session.processedCount && session.employeeCount) {
      return `${session.processedCount}/${session.employeeCount} processed`;
    }
    if (session.progress !== undefined) {
      return `${session.progress}% complete`;
    }
    return '';
  };

  const activeSessions = sessions.filter(s => s.status === 'in_progress' || s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const failedSessions = sessions.filter(s => s.status === 'failed');

  if (compact) {
    return (
      <div className="space-y-2">
        {activeSessions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-800">
                  {activeSessions.length} active session{activeSessions.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {failedSessions.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {failedSessions.length} failed session{failedSessions.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(session.type)}
                    <span className="font-medium text-sm">
                      {session.sessionName || getTypeLabel(session.type)}
                    </span>
                    <Badge className={cn("text-xs", getStatusColor(session.status))}>
                      {getStatusLabel(session.status)}
                    </Badge>
                  </div>
                  {session.status === 'in_progress' && onCancelSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelSession(session.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                {session.status === 'in_progress' && (
                  <>
                    <Progress value={session.progress || 0} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{getProgressText(session)}</span>
                      <span>{getDuration(session)}</span>
                    </div>
                  </>
                )}
                
                {session.status === 'pending' && (
                  <p className="text-xs text-gray-600">
                    Queued {getDuration(session)}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {(completedSessions.length > 0 || failedSessions.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...failedSessions, ...completedSessions.slice(0, 3)].map((session) => (
              <div key={session.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getTypeIcon(session.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {session.sessionName || getTypeLabel(session.type)}
                      </span>
                      <Badge className={cn("text-xs", getStatusColor(session.status))}>
                        {getStatusLabel(session.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getDuration(session)}
                      {session.processedCount && session.employeeCount && (
                        <span className="ml-2">
                          • {session.processedCount}/{session.employeeCount} processed
                        </span>
                      )}
                    </p>
                    {session.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        {session.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {session.status === 'failed' && onRetrySession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetrySession(session.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                  {onViewDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(session.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No active sessions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick status summary component
export function SessionStatusSummary({ sessions }: { sessions: SessionStatus[] }) {
  const activeSessions = sessions.filter(s => s.status === 'in_progress' || s.status === 'pending');
  const failedSessions = sessions.filter(s => s.status === 'failed');
  
  if (activeSessions.length === 0 && failedSessions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
      {activeSessions.length > 0 && (
        <div className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
          <span className="text-xs text-blue-700">
            {activeSessions.length} active
          </span>
        </div>
      )}
      {failedSessions.length > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-600" />
          <span className="text-xs text-red-700">
            {failedSessions.length} failed
          </span>
        </div>
      )}
    </div>
  );
}