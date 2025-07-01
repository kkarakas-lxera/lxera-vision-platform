import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, TrendingUp, Star, BookOpen, Home, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GameResultsProps {
  results: {
    questionsAnswered: number;
    correctAnswers: number;
    pointsEarned: number;
    timeSpent: number;
    accuracy: number;
    skillImprovements: { [skill: string]: number };
  };
  missionTitle: string;
  onContinue: () => void;
  onReturnToCourse: () => void;
  onViewProgress: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function GameResults({ 
  results, 
  missionTitle, 
  onContinue, 
  onReturnToCourse, 
  onViewProgress 
}: GameResultsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    checkForAchievements();
    if (results.accuracy >= 75) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [results]);

  const checkForAchievements = () => {
    const unlockedAchievements: Achievement[] = [];

    // Perfect Score Achievement
    if (results.accuracy === 100) {
      unlockedAchievements.push({
        id: 'perfect_score',
        name: 'Perfect Score',
        description: '100% accuracy on mission',
        icon: '🎯',
        unlocked: true
      });
    }

    // Speed Achievement
    if (results.timeSpent < 120) { // Under 2 minutes
      unlockedAchievements.push({
        id: 'speed_learner',
        name: 'Speed Learner',
        description: 'Completed mission in under 2 minutes',
        icon: '⚡',
        unlocked: true
      });
    }

    // High Accuracy Achievement
    if (results.accuracy >= 75 && results.accuracy < 100) {
      unlockedAchievements.push({
        id: 'high_achiever',
        name: 'High Achiever',
        description: '75%+ accuracy achieved',
        icon: '🌟',
        unlocked: true
      });
    }

    // Skill Master Achievement (if improved multiple skills)
    if (Object.keys(results.skillImprovements).length >= 2) {
      unlockedAchievements.push({
        id: 'skill_master',
        name: 'Skill Master',
        description: 'Improved multiple skills in one mission',
        icon: '🎓',
        unlocked: true
      });
    }

    setAchievements(unlockedAchievements);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (results.accuracy === 100) {
      return "🏆 Outstanding! Perfect mission completion!";
    } else if (results.accuracy >= 75) {
      return "🎉 Excellent work! You've mastered this content!";
    } else if (results.accuracy >= 50) {
      return "👏 Good effort! Keep practicing to improve!";
    } else {
      return "💪 Don't give up! Review the content and try again!";
    }
  };

  const getAccuracyColor = () => {
    if (results.accuracy >= 75) return 'text-green-600';
    if (results.accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="text-center py-8">
          <div className="text-6xl animate-bounce mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-primary animate-pulse">
            Mission Complete!
          </h2>
        </div>
      )}

      {/* Main Results Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <div className="mb-2">
            <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
          </div>
          <CardTitle className="text-xl">
            🏆 Mission Complete!
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {missionTitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Message */}
          <div className="text-center bg-white/50 p-4 rounded-lg">
            <p className="font-semibold text-lg">
              {getPerformanceMessage()}
            </p>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-4 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getAccuracyColor()}`}>
                {results.correctAnswers}/{results.questionsAnswered}
              </div>
              <div className="text-xs text-muted-foreground">Questions Correct</div>
              <div className={`text-lg font-semibold ${getAccuracyColor()}`}>
                {Math.round(results.accuracy)}%
              </div>
            </div>
            
            <div className="bg-white/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Trophy className="h-6 w-6" />
                {results.pointsEarned}
              </div>
              <div className="text-xs text-muted-foreground">Points Earned</div>
            </div>
            
            <div className="bg-white/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Clock className="h-6 w-6" />
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>
            
            <div className="bg-white/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-6 w-6" />
                {Object.keys(results.skillImprovements).length}
              </div>
              <div className="text-xs text-muted-foreground">Skills Improved</div>
            </div>
          </div>

          {/* Skill Improvements */}
          {Object.keys(results.skillImprovements).length > 0 && (
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Skills Development
              </h4>
              <div className="space-y-2">
                {Object.entries(results.skillImprovements).map(([skill, improvement]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-sm">{skill}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(improvement / results.questionsAnswered) * 100} className="w-16 h-2" />
                      <Badge variant="secondary" className="text-xs">
                        +{improvement}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievements Unlocked!
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                    <span className="text-lg">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Puzzle Progress Placeholder */}
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">🧩 Puzzle Progress</h4>
            <div className="text-center">
              <div className="inline-grid grid-cols-3 gap-1 p-3 bg-white rounded">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs">💰</div>
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs">📊</div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">2/9 pieces collected</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={onContinue}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              📖 Continue to Next Section
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={onViewProgress}
                variant="outline"
                className="h-10"
              >
                📊 View Progress
              </Button>
              <Button 
                onClick={onReturnToCourse}
                variant="outline"
                className="h-10"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 Your mission results have been saved and count toward course completion!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}