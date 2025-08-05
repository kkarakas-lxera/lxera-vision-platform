import React from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, BookOpen, Award } from 'lucide-react';

interface DevelopmentSectionProps {
  employee: {
    profile_data?: {
      professional_challenges?: Array<{
        challenge: string;
        category?: string;
      }>;
      growth_opportunities?: Array<{
        opportunity: string;
        category?: string;
      }>;
    };
    courses?: Array<{
      id: string;
      course_title: string;
      status: string;
      progress_percentage: number;
      completed_at?: string;
    }>;
  };
}

export function DevelopmentSection({ employee }: DevelopmentSectionProps) {
  const challenges = employee.profile_data?.professional_challenges || [];
  const opportunities = employee.profile_data?.growth_opportunities || [];
  const activeCourses = employee.courses?.filter(c => c.status === 'in_progress') || [];
  const completedCourses = employee.courses?.filter(c => c.status === 'completed') || [];

  const summary = `${challenges.length} challenges • ${opportunities.length} growth areas • ${activeCourses.length} active courses`;

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return <Zap className="h-3 w-3" />;
      case 'leadership':
        return <Target className="h-3 w-3" />;
      case 'communication':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <Award className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return 'bg-blue-100 text-blue-700';
      case 'leadership':
        return 'bg-purple-100 text-purple-700';
      case 'communication':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <CollapsibleCard
      title="Development & Growth"
      icon={<Target className="h-5 w-5" />}
      summary={summary}
    >
      <div className="space-y-6">
        {/* Professional Challenges */}
        {challenges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Professional Challenges
            </h4>
            <div className="space-y-2">
              {challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{challenge.challenge}</p>
                  </div>
                  {challenge.category && (
                    <Badge variant="secondary" className={`text-xs flex items-center gap-1 ${getCategoryColor(challenge.category)}`}>
                      {getCategoryIcon(challenge.category)}
                      {challenge.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Opportunities */}
        {opportunities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Growth Opportunities
            </h4>
            <div className="space-y-2">
              {opportunities.map((opp, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{opp.opportunity}</p>
                  </div>
                  {opp.category && (
                    <Badge variant="secondary" className={`text-xs flex items-center gap-1 ${getCategoryColor(opp.category)}`}>
                      {getCategoryIcon(opp.category)}
                      {opp.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Learning */}
        {activeCourses.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Active Learning ({activeCourses.length})
            </h4>
            <div className="space-y-2">
              {activeCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="text-sm truncate flex-1">{course.course_title}</span>
                  <Badge variant="outline" className="text-xs">
                    {course.progress_percentage}%
                  </Badge>
                </div>
              ))}
              {activeCourses.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{activeCourses.length - 3} more courses
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {completedCourses.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recent Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              {completedCourses.slice(0, 5).map((course) => (
                <Badge key={course.id} variant="default" className="text-xs">
                  {course.course_title}
                </Badge>
              ))}
              {completedCourses.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{completedCourses.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.length === 0 && opportunities.length === 0 && activeCourses.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No development data available
          </p>
        )}
      </div>
    </CollapsibleCard>
  );
}