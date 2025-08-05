import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, User } from 'lucide-react';

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

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profile Journey</h3>
            </div>
            <div className="text-sm text-gray-600">
              {completedCount}/{sections.length} steps completed
            </div>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="relative flex justify-between">
              {sections.map((section, index) => {
                const isFirst = index === 0;
                const isLast = index === sections.length - 1;
                const stepNumber = index + 1;
                
                return (
                  <div 
                    key={section.name}
                    className="flex flex-col items-center"
                    style={{
                      position: 'relative',
                      flex: isFirst || isLast ? '0 0 auto' : '1 1 0%'
                    }}
                  >
                    {/* Circle */}
                    <div className="relative z-10">
                      {section.isComplete ? (
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{stepNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-3 text-center max-w-[120px]">
                      <p className={`text-xs font-medium ${
                        section.isComplete ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {section.displayName}
                      </p>
                      {section.isComplete && section.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(section.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Profile Completion
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}