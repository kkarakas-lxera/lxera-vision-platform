import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Star,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PeerReviewPanelProps {
  moduleId: string;
  employeeId: string;
  onUpdate: () => void;
  onBack?: () => void;
}

export default function PeerReviewPanel({ moduleId, employeeId, onUpdate, onBack }: PeerReviewPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const mockReviewsToComplete = [
    {
      id: '1',
      studentName: 'Sarah Johnson',
      assignment: 'Application Challenge - CEO Performance Report',
      dueDate: 'Tomorrow 5:00 PM',
      type: 'Application Challenge'
    },
    {
      id: '2',
      studentName: 'John Smith',
      assignment: 'Practical Exercise - Spreadsheet Analysis',
      dueDate: '2 days',
      type: 'Practical Exercise'
    }
  ];

  const mockReceivedReviews = [
    {
      id: '1',
      reviewerName: 'Mike Chen',
      assignment: 'Knowledge Check Quiz',
      score: 92,
      maxScore: 100,
      feedback: 'Excellent analysis of gross margins and clear understanding of financial metrics...',
      completedAt: '2 days ago'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Peer Reviews</h3>
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="outline" className="text-xs px-1 py-0">2 to do</Badge>
          <Badge variant="outline" className="text-xs px-1 py-0">1 received</Badge>
        </div>
      </div>

      {/* To Review Section */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, toReview: !prev.toReview }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">To Review ({mockReviewsToComplete.length})</span>
          </div>
          {expandedSections.toReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.toReview && (
          <div className="px-3 pb-3 space-y-2 border-t">
            {mockReviewsToComplete.length === 0 ? (
              <div className="text-center py-4">
                <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No reviews assigned</p>
              </div>
            ) : (
              mockReviewsToComplete.map((review) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{review.studentName}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0">{review.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{review.assignment}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span className="text-orange-600">Due: {review.dueDate}</span>
                      </div>
                    </div>
                    <Button size="sm" className="text-xs px-2 py-1 h-auto">Start</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Received Reviews Section */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, received: !prev.received }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Received ({mockReceivedReviews.length})</span>
          </div>
          {expandedSections.received ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.received && (
          <div className="px-3 pb-3 space-y-2 border-t">
            {mockReceivedReviews.length === 0 ? (
              <div className="text-center py-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No reviews received yet</p>
              </div>
            ) : (
              mockReceivedReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewerName}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">{review.score}/{review.maxScore}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.completedAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{review.assignment}</p>
                  <div className="bg-muted p-2 rounded text-xs mb-2">
                    {review.feedback.length > 100 ? `${review.feedback.substring(0, 100)}...` : review.feedback}
                  </div>
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                    View Full
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pending Reviews Section */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, pending: !prev.pending }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Pending (2)</span>
          </div>
          {expandedSections.pending ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.pending && (
          <div className="px-3 pb-3 space-y-2 border-t">
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Application Challenge</p>
                  <p className="text-xs text-muted-foreground">Submitted 3 days ago</p>
                </div>
                <Badge variant="secondary" className="text-xs">Under Review</Badge>
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Self-Assessment</p>
                  <p className="text-xs text-muted-foreground">Submitted 1 day ago</p>
                </div>
                <Badge variant="secondary" className="text-xs">Under Review</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={onBack} variant="outline" size="sm">
          Back
        </Button>
        <Button size="sm" className="flex-1" disabled>
          All Reviews Complete
        </Button>
      </div>
    </div>
  );
}