import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Target, 
  X,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Star,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  points_value: number;
  content_section_id: string;
}

interface TaskDecisionModalProps {
  task: Task;
  onProceed: () => void;
  onCancel: () => void;
  employeeId: string;
}

const CATEGORIES = {
  finance: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-50 to-emerald-50' },
  marketing: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-50 to-cyan-50' },
  hr: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-50 to-violet-50' },
  production: { icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-50 to-amber-50' },
  general: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-gray-50 to-slate-50' }
};

export default function TaskDecisionModal({ task, onProceed, onCancel, employeeId }: TaskDecisionModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const CategoryIcon = CATEGORIES[task.category as keyof typeof CATEGORIES]?.icon || Target;
  const categoryColor = CATEGORIES[task.category as keyof typeof CATEGORIES]?.color || 'text-gray-600';
  const categoryBg = CATEGORIES[task.category as keyof typeof CATEGORIES]?.bg || 'bg-gray-50';
  const categoryGradient = CATEGORIES[task.category as keyof typeof CATEGORIES]?.gradient || 'from-gray-50 to-slate-50';

  const getDifficultyDetails = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🟢',
          description: 'Quick and straightforward',
          timeEstimate: '2-3 minutes'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡',
          description: 'Moderate challenge',
          timeEstimate: '3-5 minutes'
        };
      case 'hard':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴',
          description: 'Advanced concepts',
          timeEstimate: '5-8 minutes'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚪',
          description: 'Standard challenge',
          timeEstimate: '3-5 minutes'
        };
    }
  };

  const difficultyDetails = getDifficultyDetails(task.difficulty_level);

  const handleProceed = async () => {
    setLoading(true);
    try {
      // Update interest score for proceeding (+2)
      await supabase
        .from('employee_interest_scores')
        .upsert({
          employee_id: employeeId,
          category: task.category,
          interest_score: 2, // This would be added to existing score in real implementation
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,category' });

      onProceed();
    } catch (error) {
      console.error('Error updating interest score:', error);
      onProceed(); // Continue anyway
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      // Update interest score for canceling (-1)
      await supabase
        .from('employee_interest_scores')
        .upsert({
          employee_id: employeeId,
          category: task.category,
          interest_score: -1, // This would be subtracted from existing score in real implementation
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,category' });

      onCancel();
    } catch (error) {
      console.error('Error updating interest score:', error);
      onCancel(); // Continue anyway
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-lg mx-auto bg-gradient-to-br ${categoryGradient} border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-200`}>
        <CardHeader className="relative">
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="space-y-4">
            {/* Category header */}
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${categoryBg}`}>
                <CategoryIcon className={`h-6 w-6 ${categoryColor}`} />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">
                  {(task.category || 'general').toUpperCase()}
                </Badge>
                <CardTitle className="text-xl">{task.title}</CardTitle>
              </div>
            </div>

            {/* Task description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {task.description}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Task details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-lg">{task.points_value}</span>
              </div>
              <div className="text-xs text-muted-foreground">Points Reward</div>
            </div>
            
            <div className="bg-white/60 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-lg">{difficultyDetails.timeEstimate}</span>
              </div>
              <div className="text-xs text-muted-foreground">Estimated Time</div>
            </div>
          </div>

          {/* Difficulty indicator */}
          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Difficulty Level</span>
              <Badge className={difficultyDetails.color}>
                {difficultyDetails.icon} {task.difficulty_level}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{difficultyDetails.description}</p>
          </div>

          {/* What you'll gain */}
          <div className="bg-white/60 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              What You'll Gain
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{task.points_value} points toward your learning progress</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Skill advancement in {task.category}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Puzzle piece unlock opportunity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Achievement badges for excellence</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 h-12 border-red-200 text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              NO - Skip This
            </Button>
            <Button 
              onClick={handleProceed}
              disabled={loading}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loading ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              GO - Start Mission!
            </Button>
          </div>

          {/* Interest impact notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 Your choice affects your personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}