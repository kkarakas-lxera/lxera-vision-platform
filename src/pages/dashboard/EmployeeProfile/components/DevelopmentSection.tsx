import React from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, BookOpen, Award, ChevronRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
      daily_tasks?: {
        selected?: string[];
      };
      tools_technologies?: {
        selected?: string[];
      };
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
  // Support both old field names and new field names
  const challenges = employee.profile_data?.professional_challenges || 
    (employee.profile_data?.daily_tasks?.selected?.map(task => ({ challenge: task }))) || [];
  const opportunities = employee.profile_data?.growth_opportunities || 
    (employee.profile_data?.tools_technologies?.selected?.map(tech => ({ opportunity: tech }))) || [];
  const activeCourses = employee.courses?.filter(c => c.status === 'in_progress') || [];
  const completedCourses = employee.courses?.filter(c => c.status === 'completed') || [];

  const summary = `${challenges.length} challenges • ${opportunities.length} growth areas • ${activeCourses.length} active courses`;

  return (
    <CollapsibleCard
      title="Development & Growth"
      icon={<Target className="h-5 w-5" />}
      summary={summary}
    >
      <div className="space-y-4">
        {/* Professional Challenges - Compact List */}
        {challenges.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Professional Challenges
            </h4>
            <div className="space-y-1">
              {challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-tight flex-1">
                    {challenge.challenge}
                  </p>
                  {challenge.category && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200">
                      {challenge.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Opportunities - Compact List */}
        {opportunities.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Growth Opportunities
            </h4>
            <div className="space-y-1">
              {opportunities.map((opp, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-tight flex-1">
                    {opp.opportunity}
                  </p>
                  {opp.category && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200">
                      {opp.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Learning - Compact Progress */}
        {activeCourses.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />
              Active Learning <span className="normal-case text-gray-500">({activeCourses.length})</span>
            </h4>
            <div className="space-y-1.5">
              {activeCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="group">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-gray-700 truncate flex-1 group-hover:text-gray-900 transition-colors">
                      {course.course_title}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {course.progress_percentage}%
                    </span>
                  </div>
                  <Progress value={course.progress_percentage} className="h-1" />
                </div>
              ))}
              {activeCourses.length > 3 && (
                <p className="text-[10px] text-muted-foreground pt-1">
                  +{activeCourses.length - 3} more courses in progress
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recent Achievements - Compact Badges */}
        {completedCourses.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3 w-3" />
              Completed Courses
            </h4>
            <div className="flex flex-wrap gap-1">
              {completedCourses.slice(0, 4).map((course) => (
                <Badge key={course.id} variant="secondary" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-2.5 w-2.5 mr-1" />
                  {course.course_title}
                </Badge>
              ))}
              {completedCourses.length > 4 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-gray-200">
                  +{completedCourses.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.length === 0 && opportunities.length === 0 && activeCourses.length === 0 && (
          <div className="text-center py-6">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No development data available
            </p>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}