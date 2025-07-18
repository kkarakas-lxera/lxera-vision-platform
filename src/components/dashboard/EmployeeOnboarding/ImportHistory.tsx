import React from 'react';
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { formatDistanceToNow } from 'date-fns';

export function ImportHistory() {
  const { importSessions, loading } = useOnboarding();

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const recentSessions = importSessions.slice(0, 3);

  if (recentSessions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Recent Imports</h3>
      <div className="space-y-2">
        {recentSessions.map((session) => (
          <div
            key={session.id}
            className="p-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {session.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : session.status === 'failed' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {session.successful} employees imported
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {session.failed > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  {session.failed} failed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}