import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Clock, Target, BookOpen, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MissionBriefingProps {
  contentSectionId: string;
  sectionName: string;
  onMissionStart: (missionId: string) => void;
  onContinue: () => void;
}

interface Mission {
  id: string;
  mission_title: string;
  mission_description: string;
  difficulty_level: string;
  points_value: number;
  estimated_minutes: number;
  questions_count: number;
  skill_focus: string[];
}

export default function MissionBriefing({ 
  contentSectionId, 
  sectionName, 
  onMissionStart, 
  onContinue 
}: MissionBriefingProps) {
  const { userProfile } = useAuth();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && contentSectionId) {
      initializeMission();
    }
  }, [userProfile, contentSectionId]);

  const initializeMission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (!employee) {
        throw new Error('Employee profile not found');
      }

      setEmployeeId(employee.id);

      // Check if mission already exists for this content section and employee
      const { data: existingMission } = await supabase
        .from('game_missions')
        .select('*')
        .eq('content_section_id', contentSectionId)
        .eq('employee_id', employee.id)
        .eq('is_active', true)
        .single();

      if (existingMission) {
        setMission(existingMission);
      } else {
        // Generate new mission
        await generateMission(employee.id);
      }
    } catch (error) {
      console.error('Error initializing mission:', error);
      setError(error.message || 'Failed to load mission');
    } finally {
      setLoading(false);
    }
  };

  const generateMission = async (employeeId: string) => {
    try {
      setGenerating(true);
      
      // Call the OpenAI edge function to generate mission and questions
      const { data, error } = await supabase.functions.invoke('generate-mission-questions', {
        body: {
          employee_id: employeeId,
          content_section_id: contentSectionId,
          section_name: sectionName,
          difficulty_level: 'medium',
          questions_count: 4,
          category: inferCategoryFromSection(sectionName),
          task_title: `Master ${formatSectionName(sectionName)}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate mission');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate mission');
      }

      // Fetch the created mission
      const { data: createdMission, error: fetchError } = await supabase
        .from('game_missions')
        .select('*')
        .eq('id', data.mission_id)
        .single();

      if (fetchError) {
        console.error('Error fetching created mission:', fetchError);
        throw fetchError;
      }

      setMission(createdMission);
      toast.success(`🎮 Mission Generated! ${data.questions_generated} questions created.`);
    } catch (error) {
      console.error('Error generating mission:', error);
      setError(error.message || 'Failed to generate mission');
      toast.error('Failed to generate mission. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to infer category from section name
  const inferCategoryFromSection = (section: string): string => {
    const sectionLower = section.toLowerCase();
    if (sectionLower.includes('finance') || sectionLower.includes('budget') || sectionLower.includes('cost')) {
      return 'finance';
    }
    if (sectionLower.includes('market') || sectionLower.includes('sales') || sectionLower.includes('brand')) {
      return 'marketing';
    }
    if (sectionLower.includes('hr') || sectionLower.includes('people') || sectionLower.includes('team')) {
      return 'hr';
    }
    if (sectionLower.includes('production') || sectionLower.includes('operations') || sectionLower.includes('process')) {
      return 'production';
    }
    return 'general';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const formatSectionName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Preparing your personalized mission...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => initializeMission()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generating) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="relative">
                <Gamepad2 className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Mission</h3>
            <p className="text-muted-foreground mb-4">
              Analyzing your course content and generating personalized questions...
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground">• Reading course content</div>
              <div className="text-sm text-muted-foreground">• Generating personalized questions</div>
              <div className="text-sm text-muted-foreground">• Creating difficulty-appropriate challenges</div>
            </div>
            <Progress value={75} className="w-full max-w-xs mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">This may take 5-10 seconds...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mission) {
    return (
      <Card className="w-full">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No mission available for this section.</p>
            <Button onClick={onContinue} variant="outline">
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="text-center">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            🎮 Mission Unlocked!
          </Badge>
        </div>
        <CardTitle className="text-xl">
          {mission.mission_title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on: {formatSectionName(sectionName)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mission Description */}
        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Mission Objective
          </h4>
          <p className="text-sm text-muted-foreground">
            {mission.mission_description}
          </p>
        </div>

        {/* Mission Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg">
              {getDifficultyEmoji(mission.difficulty_level)} {mission.difficulty_level}
            </div>
            <div className="text-xs text-muted-foreground">Difficulty</div>
          </div>
          
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4" />
              {mission.points_value}
            </div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
          
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {mission.estimated_minutes}m
            </div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg flex items-center justify-center gap-1">
              <BookOpen className="h-4 w-4" />
              {mission.questions_count}
            </div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </div>

        {/* Skills Focus */}
        {mission.skill_focus && mission.skill_focus.length > 0 && (
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Skills Focus:</h4>
            <div className="flex flex-wrap gap-2">
              {mission.skill_focus.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mission Rewards */}
        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Mission Rewards:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {mission.points_value} points toward your learning progress</li>
            <li>• Skill level progression in focus areas</li>
            <li>• Puzzle piece unlock for completion</li>
            <li>• Achievement badges for perfect scores</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={() => onMissionStart(mission.id)}
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            🚀 Start Mission
          </Button>
          <Button 
            onClick={onContinue}
            variant="outline"
            className="h-12"
            size="lg"
          >
            📖 Continue Learning
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-center text-muted-foreground">
          💡 Mission progress counts toward section completion!
        </p>
      </CardContent>
    </Card>
  );
}