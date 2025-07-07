import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  FileText, 
  Target, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Upload,
  MessageSquare 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      name: 'Knowledge Check Quiz',
      icon: Brain,
      description: '5 multiple choice questions to test understanding',
      weight: 25,
      color: 'text-blue-500'
    },
    {
      id: 'practical_exercise',
      name: 'Practical Exercise',
      icon: FileText,
      description: 'Hands-on tasks with spreadsheet work',
      weight: 25,
      color: 'text-green-500'
    },
    {
      id: 'self_assessment',
      name: 'Self-Assessment',
      icon: Target,
      description: 'Rate your confidence in key skills',
      weight: 15,
      color: 'text-yellow-500'
    },
    {
      id: 'application_challenge',
      name: 'Application Challenge',
      icon: TrendingUp,
      description: 'CEO performance report scenario',
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assessment Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-2xl font-bold text-primary">{overallScore}%</span>
            </div>
            <Progress value={overallScore} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {assessmentTypes.filter(type => assessmentProgress[type.id]?.completed).length} of {assessmentTypes.length} assessments completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessmentTypes.map((type) => {
          const progress = assessmentProgress[type.id];
          const IconComponent = type.icon;
          
          return (
            <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => setActiveTab(type.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${type.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Badge variant={progress?.completed ? 'default' : 'secondary'}>
                    {progress?.completed ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Weight: {type.weight}%</span>
                    {progress?.completed && (
                      <span className="font-medium">
                        Score: {progress.score}/{progress.maxScore}
                      </span>
                    )}
                  </div>
                  
                  {progress?.completed ? (
                    <div className="space-y-2">
                      <Progress value={(progress.score || 0) / (progress.maxScore || 100) * 100} />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Completed {progress.lastAttempt?.toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full">
                      Start Assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Peer Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Peer Review Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Reviews to Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Reviews Received</div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('peer_review')}>
            View Peer Reviews
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assessments</h2>
          <p className="text-muted-foreground">
            Complete all assessments to demonstrate your understanding
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {overallScore}% Complete
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knowledge_quiz">Quiz</TabsTrigger>
          <TabsTrigger value="practical_exercise">Exercise</TabsTrigger>
          <TabsTrigger value="self_assessment">Self-Check</TabsTrigger>
          <TabsTrigger value="application_challenge">Challenge</TabsTrigger>
          <TabsTrigger value="peer_review">Peer Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="knowledge_quiz" className="mt-6">
          <KnowledgeCheckQuiz 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.knowledge_quiz}
          />
        </TabsContent>

        <TabsContent value="practical_exercise" className="mt-6">
          <PracticalExercise 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.practical_exercise}
          />
        </TabsContent>

        <TabsContent value="self_assessment" className="mt-6">
          <SelfAssessmentChecklist 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.self_assessment}
          />
        </TabsContent>

        <TabsContent value="application_challenge" className="mt-6">
          <ApplicationChallenge 
            moduleId={moduleId}
            employeeId={employeeId}
            onComplete={fetchAssessmentProgress}
            currentProgress={assessmentProgress.application_challenge}
          />
        </TabsContent>

        <TabsContent value="peer_review" className="mt-6">
          <PeerReviewPanel 
            moduleId={moduleId}
            employeeId={employeeId}
            onUpdate={fetchAssessmentProgress}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}