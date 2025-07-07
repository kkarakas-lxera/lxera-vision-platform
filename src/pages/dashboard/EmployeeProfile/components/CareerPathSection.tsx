import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareerPathSectionProps {
  employee: {
    id: string;
    full_name: string;
    position: string;
    current_position_title?: string;
    target_position_title?: string;
    current_position_id?: string;
    target_position_id?: string;
    skills_profile?: {
      skills_match_score: number;
      career_readiness_score: number | null;
      extracted_skills?: any[];
      cv_summary?: string;
    };
    courses?: any[];
  };
}

export function CareerPathSection({ employee }: CareerPathSectionProps) {
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [weeklyInsights, setWeeklyInsights] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  
  const currentPosition = employee.current_position_title || employee.position;
  const targetPosition = employee.target_position_title || 'Not set';
  const matchScore = employee.skills_profile?.skills_match_score || 0;
  // Handle null career_readiness_score
  const readinessScore = employee.skills_profile?.career_readiness_score ?? matchScore;
  
  // Check if current and target positions are the same
  const hasCareerPath = employee.current_position_id !== employee.target_position_id && 
                       employee.target_position_id !== null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateWeeklyInsights = async () => {
    setLoadingInsights(true);
    try {
      // Prepare employee data for OpenAI
      const employeeData = {
        name: employee.full_name,
        currentPosition: currentPosition,
        targetPosition: hasCareerPath ? targetPosition : null,
        matchScore: matchScore,
        readinessScore: readinessScore,
        skillsCount: employee.skills_profile?.extracted_skills?.length || 0,
        skills: employee.skills_profile?.extracted_skills?.slice(0, 10).map((s: any) => ({
          name: s.skill_name,
          level: s.proficiency_level
        })) || [],
        recentCourses: employee.courses?.filter((c: any) => c.status === 'in_progress').length || 0,
        completedCourses: employee.courses?.filter((c: any) => c.status === 'completed').length || 0
      };

      const { data, error } = await supabase.functions.invoke('generate-employee-insights', {
        body: { employeeData }
      });

      if (error) throw error;

      setWeeklyInsights(data.insights);
      setShowInsights(true);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights. Please try again.');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Career Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Path */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">Current Position</Badge>
            <p className="font-medium text-lg">{currentPosition}</p>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          
          <div className="flex-1 text-right">
            <Badge variant="outline" className="mb-2 bg-blue-50">Target Position</Badge>
            <p className="font-medium text-lg">{targetPosition}</p>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Career Readiness</span>
              <span className={`text-sm font-bold ${getScoreColor(readinessScore)}`}>
                {readinessScore}%
              </span>
            </div>
            <Progress value={readinessScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall readiness for target position
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Skills Match</span>
              <span className={`text-sm font-bold ${getScoreColor(matchScore)}`}>
                {Math.round(matchScore)}%
              </span>
            </div>
            <Progress value={matchScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Current skills alignment with target position
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          {!showInsights ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-700">
                      {!hasCareerPath 
                        ? "No target position set yet."
                        : matchScore >= 80 
                        ? "Excellent progress! You're well-positioned for advancement."
                        : matchScore >= 60
                        ? "Good progress. Focus on key skill gaps to reach your target."
                        : "Keep developing your skills. Consider targeted learning paths."}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={generateWeeklyInsights}
                  disabled={loadingInsights}
                  className="text-xs"
                >
                  {loadingInsights ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <p className="font-medium text-purple-900">Weekly Performance Insights</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInsights(false)}
                  className="text-xs"
                >
                  Hide
                </Button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{weeklyInsights}</p>
              <p className="text-xs text-muted-foreground mt-3">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}