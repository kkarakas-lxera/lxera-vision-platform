import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Star,
  Download 
} from 'lucide-react';

interface PeerReviewPanelProps {
  moduleId: string;
  employeeId: string;
  onUpdate: () => void;
}

export default function PeerReviewPanel({ moduleId, employeeId, onUpdate }: PeerReviewPanelProps) {
  const [activeTab, setActiveTab] = useState('to_review');

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

  const renderToReviewTab = () => (
    <div className="space-y-4">
      {mockReviewsToComplete.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No peer reviews assigned at this time.</p>
        </div>
      ) : (
        mockReviewsToComplete.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{review.studentName}</span>
                    <Badge variant="outline">{review.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.assignment}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-600">Due: {review.dueDate}</span>
                  </div>
                </div>
                <Button size="sm">Start Review</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderReceivedTab = () => (
    <div className="space-y-4">
      {mockReceivedReviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews received yet.</p>
        </div>
      ) : (
        mockReceivedReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Review from {review.reviewerName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{review.score}/{review.maxScore}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.assignment}</span>
                <span>•</span>
                <span>{review.completedAt}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Feedback:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {review.feedback}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Full Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderPendingTab = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">2 reviews pending</p>
        <p className="text-sm text-muted-foreground">
          Your submitted assessments are being reviewed by peers
        </p>
      </div>
      
      <div className="space-y-2">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Application Challenge</p>
                <p className="text-sm text-muted-foreground">Submitted 3 days ago</p>
              </div>
              <Badge variant="secondary">Under Review</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Self-Assessment</p>
                <p className="text-sm text-muted-foreground">Submitted 1 day ago</p>
              </div>
              <Badge variant="secondary">Under Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Peer Review Center
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Collaborate with peers to provide and receive feedback on assessments
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="to_review" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              To Review ({mockReviewsToComplete.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Received ({mockReceivedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending (2)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="to_review" className="mt-4">
            {renderToReviewTab()}
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            {renderReceivedTab()}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {renderPendingTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}