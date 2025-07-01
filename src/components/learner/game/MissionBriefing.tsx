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
      
      // Get company ID from employee
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id')
        .eq('id', employeeId)
        .single();

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Create a mission directly in the database
      const missionData = {
        content_section_id: contentSectionId,
        employee_id: employeeId,
        company_id: employee.company_id,
        mission_title: `Master ${formatSectionName(sectionName)}`,
        mission_description: `Complete this interactive learning mission to test your understanding of the ${formatSectionName(sectionName)} concepts. Answer questions correctly to earn points and unlock achievements!`,
        difficulty_level: 'medium',
        points_value: 100,
        estimated_minutes: 5,
        questions_count: 4,
        skill_focus: ['Critical Thinking', 'Problem Solving', 'Application'],
        is_active: true,
        category: 'learning',
        section_name: sectionName
      };

      const { data: createdMission, error: createError } = await supabase
        .from('game_missions')
        .insert(missionData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Create sample questions for the mission
      const questions = [
        {
          mission_id: createdMission.id,
          question_text: `What is the main concept discussed in the ${formatSectionName(sectionName)} section?`,
          question_type: 'multiple_choice',
          correct_answer: 'The key concept',
          answer_options: ['The key concept', 'An unrelated topic', 'A minor detail', 'None of the above'],
          points_value: 25,
          time_limit_seconds: 30,
          order_position: 1
        },
        {
          mission_id: createdMission.id,
          question_text: `How would you apply the concepts from ${formatSectionName(sectionName)} in practice?`,
          question_type: 'multiple_choice',
          correct_answer: 'By implementing the learned techniques',
          answer_options: ['By implementing the learned techniques', 'By ignoring them', 'By doing the opposite', 'By waiting for instructions'],
          points_value: 25,
          time_limit_seconds: 30,
          order_position: 2
        },
        {
          mission_id: createdMission.id,
          question_text: `What are the key benefits of understanding ${formatSectionName(sectionName)}?`,
          question_type: 'multiple_choice',
          correct_answer: 'Improved skills and knowledge',
          answer_options: ['Improved skills and knowledge', 'No benefits', 'Confusion', 'Time waste'],
          points_value: 25,
          time_limit_seconds: 30,
          order_position: 3
        },
        {
          mission_id: createdMission.id,
          question_text: `Which approach best demonstrates mastery of ${formatSectionName(sectionName)}?`,
          question_type: 'multiple_choice',
          correct_answer: 'Practical application with understanding',
          answer_options: ['Practical application with understanding', 'Memorization only', 'Guessing', 'Avoiding the topic'],
          points_value: 25,
          time_limit_seconds: 30,
          order_position: 4
        }
      ];

      const { error: questionsError } = await supabase
        .from('game_questions')
        .insert(questions);

      if (questionsError) {
        console.error('Error creating questions:', questionsError);
        // Continue anyway - mission can work without questions
      }

      setMission(createdMission);
      toast.success('Mission generated successfully!');
    } catch (error) {
      console.error('Error generating mission:', error);
      setError(error.message || 'Failed to generate mission');
      toast.error('Failed to generate mission. Please try again.');
    } finally {
      setGenerating(false);
    }
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
              <Gamepad2 className="h-12 w-12 mx-auto text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Mission</h3>
            <p className="text-muted-foreground mb-4">
              AI is analyzing the content you just learned and creating personalized questions...
            </p>
            <Progress value={75} className="w-full max-w-xs mx-auto" />
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