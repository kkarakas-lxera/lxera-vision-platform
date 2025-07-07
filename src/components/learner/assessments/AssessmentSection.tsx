import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FileText, 
  Target, 
  Users, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Import individual assessment components
import KnowledgeCheckQuiz from './KnowledgeCheckQuiz';
import PracticalExercise from './PracticalExercise';
import ApplicationChallenge from './ApplicationChallenge';
import SelfAssessmentChecklist from './SelfAssessmentChecklist';
import PeerReviewPanel from './PeerReviewPanel';

interface AssessmentSectionProps {
  moduleId: string;
  employeeId: string;
  courseContent: any;
}

interface AssessmentProgress {
  type: string;
  completed: boolean;
  score?: number;
  maxScore?: number;
  lastAttempt?: Date;
  dueDate?: Date;
}

export default function AssessmentSection({ moduleId, employeeId, courseContent }: AssessmentSectionProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [assessmentProgress, setAssessmentProgress] = useState<Record<string, AssessmentProgress>>({});
  const [overallScore, setOverallScore] = useState(0);

  // Assessment types configuration
  const assessmentTypes = [
    {
      id: 'knowledge_quiz',
      name: 'Quiz',
      icon: Brain,
      description: '5 questions',
      weight: 25,
      color: 'text-blue-500'
    },
    {
      id: 'practical_exercise',
      name: 'Exercise',
      icon: FileText,
      description: 'Hands-on task',
      weight: 25,
      color: 'text-green-500'
    },
    {
      id: 'self_assessment',
      name: 'Self-Check',
      icon: Target,
      description: 'Skills review',
      weight: 15,
      color: 'text-orange-500'
    },
    {
      id: 'application_challenge',
      name: 'Challenge',
      icon: Users,
      description: 'Final project',
      weight: 35,
      color: 'text-purple-500'
    }
  ];

  useEffect(() => {
    fetchAssessmentProgress();
  }, [moduleId, employeeId]);

  const fetchAssessmentProgress = async () => {
    try {
      setLoading(true);
      
      // Get assessment progress from course_section_progress table
      const { data: progressData, error } = await supabase
        .from('course_section_progress')
        .select('*')
        .eq('assignment_id', moduleId)
        .eq('section_name', 'assessments')
        .or(`assessment_type.eq.knowledge_quiz,assessment_type.eq.practical_exercise,assessment_type.eq.self_assessment,assessment_type.eq.application_challenge`);

      if (error) {
        console.error('Error fetching assessment progress:', error);
        return;
      }

      const progressMap: Record<string, AssessmentProgress> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      assessmentTypes.forEach(type => {
        const progress = progressData?.find(p => p.assessment_type === type.id);
        progressMap[type.id] = {
          type: type.id,
          completed: progress?.completed || false,
          score: progress?.score || 0,
          maxScore: progress?.max_score || 100,
          lastAttempt: progress?.updated_at ? new Date(progress.updated_at) : undefined
        };

        if (progress?.completed && progress?.score) {
          totalWeightedScore += (progress.score / (progress.max_score || 100)) * type.weight;
          totalWeight += type.weight;
        }
      });

      setAssessmentProgress(progressMap);
      setOverallScore(totalWeight > 0 ? Math.round(totalWeightedScore) : 0);
    } catch (error) {
      console.error('Error in fetchAssessmentProgress:', error);
      toast.error('Failed to load assessment progress');
    } finally {
      setLoading(false);
    }
  };

  const renderCompactOverview = () => {
    const completedCount = assessmentTypes.filter(type => assessmentProgress[type.id]?.completed).length;
    
    return (
      <div className="space-y-3">
        {/* Progress Summary */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Progress</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-2" />
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {completedCount} of {assessmentTypes.length} completed
          </div>
        </div>

        {/* Assessment List */}
        <div className="space-y-2">
          {assessmentTypes.map((type) => {
            const progress = assessmentProgress[type.id];
            const IconComponent = type.icon;
            
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left",
                  progress?.completed 
                    ? "bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50"
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-md bg-white dark:bg-gray-900 shadow-sm", type.color)}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {progress?.completed ? (
                    <>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        {Math.round((progress.score || 0) / (progress.maxScore || 100) * 100)}%
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If a specific assessment is selected, show it
  if (activeTab !== 'overview') {
    const renderActiveComponent = () => {
      switch (activeTab) {
        case 'knowledge_quiz':
          return <KnowledgeCheckQuiz 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.knowledge_quiz}
            onBack={() => setActiveTab('overview')}
          />;
        case 'practical_exercise':
          return <PracticalExercise 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.practical_exercise}
            onBack={() => setActiveTab('overview')}
          />;
        case 'self_assessment':
          return <SelfAssessmentChecklist 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.self_assessment}
            onBack={() => setActiveTab('overview')}
          />;
        case 'application_challenge':
          return <ApplicationChallenge 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.application_challenge}
            onBack={() => setActiveTab('overview')}
          />;
        case 'peer_review':
          return <PeerReviewPanel 
            moduleId={moduleId}
            employeeId={employeeId}
            onUpdate={fetchAssessmentProgress}
            onBack={() => setActiveTab('overview')}
          />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to assessments
          </button>
        </div>
        {renderActiveComponent()}
      </div>
    );
  }

  // Overview with compact design
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assessments</h3>
          <p className="text-sm text-muted-foreground">
            Test your knowledge and skills
          </p>
        </div>
        {overallScore > 0 && (
          <Badge variant="outline" className="text-sm">
            {overallScore}%
          </Badge>
        )}
      </div>

      {renderCompactOverview()}
    </div>
  );
}