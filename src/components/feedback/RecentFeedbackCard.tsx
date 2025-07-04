import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bug, 
  Lightbulb, 
  MessageCircle, 
  Clock, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Circle
} from 'lucide-react';
import { feedbackService, FeedbackSubmission } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';

interface RecentFeedbackCardProps {
  showCompanyFeedback?: boolean;
  maxItems?: number;
}

const feedbackTypeIcons = {
  bug_report: Bug,
  feature_request: Lightbulb,
  general_feedback: MessageCircle,
};

const feedbackTypeColors = {
  bug_report: 'bg-red-50 text-red-700 border-red-200',
  feature_request: 'bg-blue-50 text-blue-700 border-blue-200',
  general_feedback: 'bg-green-50 text-green-700 border-green-200',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusIcons = {
  new: Circle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const statusColors = {
  new: 'text-gray-500',
  in_progress: 'text-blue-500',
  resolved: 'text-green-500',
  closed: 'text-gray-400',
};

export default function RecentFeedbackCard({ showCompanyFeedback = false, maxItems = 5 }: RecentFeedbackCardProps) {
  const { userProfile } = useAuth();
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      loadFeedback();
    }
  }, [userProfile, showCompanyFeedback]);

  const loadFeedback = async () => {
    if (!userProfile) return;

    setLoading(true);
    setError(null);

    try {
      const result = showCompanyFeedback && userProfile.company_id
        ? await feedbackService.getCompanyFeedback(userProfile.company_id, maxItems)
        : await feedbackService.getUserFeedback(userProfile.email, maxItems);

      if (result.error) {
        setError(result.error);
      } else {
        setSubmissions(result.submissions);
      }
    } catch (err) {
      setError('Failed to load feedback submissions');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showCompanyFeedback ? 'Team Feedback' : 'Your Recent Feedback'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showCompanyFeedback ? 'Team Feedback' : 'Your Recent Feedback'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showCompanyFeedback ? 'Team Feedback' : 'Your Recent Feedback'}
          </CardTitle>
          {submissions.length > 0 && (
            <Badge variant="secondary">
              {submissions.length} submission{submissions.length === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <Alert>
            <AlertDescription>
              {showCompanyFeedback 
                ? 'No feedback submissions from your team yet.' 
                : 'No feedback submissions yet. Share your thoughts to help improve the platform!'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const FeedbackIcon = feedbackTypeIcons[submission.type];
              const StatusIcon = statusIcons[submission.status];
              
              return (
                <div key={submission.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className={`p-2 rounded-full ${feedbackTypeColors[submission.type]}`}>
                    <FeedbackIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {truncateText(submission.title, 50)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {truncateText(submission.description, 100)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <StatusIcon className={`h-4 w-4 ${statusColors[submission.status]}`} />
                        <Badge variant="outline" className={priorityColors[submission.priority]}>
                          {submission.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {submission.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {submission.category}
                        </Badge>
                        {showCompanyFeedback && submission.metadata?.email && (
                          <span className="text-xs text-muted-foreground">
                            by {submission.metadata.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(submission.submitted_at)}
                        </span>
                        <Badge 
                          variant={submission.status === 'new' ? 'destructive' : 
                                  submission.status === 'resolved' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {submission.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}