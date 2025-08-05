import React from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, FileText, Download } from 'lucide-react';

interface ProfileSection {
  name: string;
  displayName: string;
  isComplete: boolean;
  completedAt?: string;
  summary?: string;
}

interface ProfileJourneySectionProps {
  sections: ProfileSection[];
  lastUpdated?: string;
}

export function ProfileJourneySection({ sections, lastUpdated }: ProfileJourneySectionProps) {
  const completedCount = sections.filter(s => s.isComplete).length;
  const completionPercentage = Math.round((completedCount / sections.length) * 100);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeSince = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const summary = `All ${sections.length} steps completed • Last updated: ${getTimeSince(lastUpdated)}`;

  return (
    <CollapsibleCard
      title="Profile Journey"
      icon={<FileText className="h-5 w-5" />}
      summary={completionPercentage < 100 ? `${completedCount}/${sections.length} steps completed` : summary}
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completionPercentage}% Complete</span>
            <span>{completedCount} of {sections.length} steps</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.name}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {section.isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${!section.isComplete ? 'text-muted-foreground' : ''}`}>
                    {index + 1}. {section.displayName}
                  </span>
                  {section.isComplete && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(section.completedAt)}
                    </span>
                  )}
                </div>
                {section.summary && (
                  <p className="text-sm text-muted-foreground">{section.summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </CollapsibleCard>
  );
}