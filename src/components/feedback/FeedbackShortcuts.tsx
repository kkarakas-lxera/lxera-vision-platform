import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Lightbulb, 
  MessageCircle, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import FeedbackModal, { FeedbackType } from './FeedbackModal';

interface FeedbackShortcutsProps {
  showAsCard?: boolean;
  title?: string;
  className?: string;
}

const feedbackShortcuts = [
  {
    type: 'bug_report' as FeedbackType,
    title: 'Report a Bug',
    description: 'Found something broken? Let us know!',
    icon: Bug,
    color: 'text-red-600',
    variant: 'destructive' as const,
  },
  {
    type: 'feature_request' as FeedbackType,
    title: 'Request Feature',
    description: 'Have an idea to improve the platform?',
    icon: Lightbulb,
    color: 'text-blue-600',
    variant: 'default' as const,
  },
  {
    type: 'general_feedback' as FeedbackType,
    title: 'General Feedback',
    description: 'Share your thoughts or suggestions',
    icon: MessageCircle,
    color: 'text-green-600',
    variant: 'secondary' as const,
  },
];

export default function FeedbackShortcuts({ 
  showAsCard = true, 
  title = 'Quick Feedback', 
  className = '' 
}: FeedbackShortcutsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('general_feedback');

  const handleFeedbackClick = (type: FeedbackType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {feedbackShortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Button
              key={shortcut.type}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => handleFeedbackClick(shortcut.type)}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className={`h-5 w-5 ${shortcut.color}`} />
                <div className="text-left">
                  <div className="font-medium">{shortcut.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Need help?</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a 
              href="https://docs.lxera.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={selectedType}
      />
    </div>
  );

  if (!showAsCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}