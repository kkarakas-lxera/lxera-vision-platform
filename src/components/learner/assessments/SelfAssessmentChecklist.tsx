import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  BookOpen,
  Users 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SelfAssessmentItem {
  id: string;
  statement: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

interface SelfAssessmentChecklistProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
}

// Self-assessment checklist items
const assessmentItems: SelfAssessmentItem[] = [
  {
    id: 'financial_metrics',
    statement: 'I can identify key financial metrics relevant to business performance.',
    category: 'Knowledge',
    importance: 'high'
  },
  {
    id: 'spreadsheet_skills',
    statement: 'I am able to use spreadsheet software to calculate basic financial metrics.',
    category: 'Technical Skills',
    importance: 'high'
  },
  {
    id: 'charts_graphs',
    statement: 'I can create and interpret charts and graphs that represent business data.',
    category: 'Technical Skills',
    importance: 'medium'
  },
  {
    id: 'trend_analysis',
    statement: 'I understand how to perform trend analysis using historical business performance data.',
    category: 'Analytical Skills',
    importance: 'high'
  },
  {
    id: 'insights_summary',
    statement: 'I can summarize business performance insights clearly and concisely.',
    category: 'Communication',
    importance: 'medium'
  }
];

const categories = [
  { id: 'Knowledge', icon: Brain, color: 'text-blue-500' },
  { id: 'Technical Skills', icon: Target, color: 'text-green-500' },
  { id: 'Analytical Skills', icon: TrendingUp, color: 'text-purple-500' },
  { id: 'Communication', icon: Users, color: 'text-orange-500' }
];

export default function SelfAssessmentChecklist({ moduleId, employeeId, onComplete, currentProgress }: SelfAssessmentChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [confidenceLevels, setConfidenceLevels] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Load existing progress if available
    if (currentProgress?.completed && currentProgress?.assessment_data) {
      const data = currentProgress.assessment_data;
      setCheckedItems(data.checkedItems || {});
      setConfidenceLevels(data.confidenceLevels || {});
      setNotes(data.notes || {});
      setIsCompleted(true);
    }
  }, [currentProgress]);

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleConfidenceChange = (itemId: string, confidence: number) => {
    setConfidenceLevels(prev => ({ ...prev, [itemId]: confidence }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const calculateOverallConfidence = () => {
    const checkedItemIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
    if (checkedItemIds.length === 0) return 0;
    
    const totalConfidence = checkedItemIds.reduce((sum, id) => {
      return sum + (confidenceLevels[id] || 50);
    }, 0);
    
    return Math.round(totalConfidence / checkedItemIds.length);
  };

  const getCompletionPercentage = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedCount / assessmentItems.length) * 100);
  };

  const getStrengths = () => {
    return assessmentItems.filter(item => 
      checkedItems[item.id] && (confidenceLevels[item.id] || 0) >= 70
    );
  };

  const getAreasForImprovement = () => {
    return assessmentItems.filter(item => 
      !checkedItems[item.id] || (confidenceLevels[item.id] || 0) < 50
    );
  };

  const submitAssessment = async () => {
    try {
      setLoading(true);
      const overallConfidence = calculateOverallConfidence();
      const completionPercentage = getCompletionPercentage();

      // Save to course_section_progress
      const { error } = await supabase
        .from('course_section_progress')
        .upsert({
          assignment_id: moduleId,
          section_name: 'assessments',
          assessment_type: 'self_assessment',
          assessment_data: {
            checkedItems,
            confidenceLevels,
            notes,
            overallConfidence,
            strengths: getStrengths().map(s => s.statement),
            areasForImprovement: getAreasForImprovement().map(a => a.statement)
          },
          score: overallConfidence,
          max_score: 100,
          completed: true,
          completed_at: new Date().toISOString(),
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error submitting self-assessment:', error);
        toast.error('Failed to submit self-assessment');
        return;
      }

      setIsCompleted(true);
      toast.success('Self-assessment completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error in submitAssessment:', error);
      toast.error('Failed to submit self-assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setCheckedItems({});
    setConfidenceLevels({});
    setNotes({});
    setIsCompleted(false);
  };

  const renderCompletedView = () => {
    const overallConfidence = calculateOverallConfidence();
    const strengths = getStrengths();
    const improvements = getAreasForImprovement();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Self-Assessment Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{overallConfidence}%</div>
                <div className="text-sm text-muted-foreground">Overall Confidence</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{getCompletionPercentage()}%</div>
                <div className="text-sm text-muted-foreground">Skills Mastered</div>
              </div>
            </div>
            <Progress value={overallConfidence} className="h-3" />
          </CardContent>
        </Card>

        {strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strengths.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{item.statement}</span>
                    <Badge variant="outline">{confidenceLevels[item.id]}% confidence</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {improvements.map(item => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{item.statement}</span>
                    </div>
                    <div className="ml-6 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        <strong>Recommendation:</strong> {getRecommendation(item.category)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={resetAssessment} variant="outline">
            Retake Assessment
          </Button>
          <Button onClick={onComplete}>
            Continue to Next Assessment
          </Button>
        </div>
      </div>
    );
  };

  const getRecommendation = (category: string) => {
    const recommendations = {
      'Knowledge': 'Review the core content and financial metrics section to strengthen foundational knowledge.',
      'Technical Skills': 'Practice with spreadsheet exercises and data visualization tools.',
      'Analytical Skills': 'Work through more trend analysis examples and case studies.',
      'Communication': 'Practice summarizing findings and presenting insights clearly.'
    };
    return recommendations[category as keyof typeof recommendations] || 'Focus on additional practice in this area.';
  };

  if (isCompleted) {
    return renderCompletedView();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Self-Assessment Checklist
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Rate your confidence and competency in each area</span>
          <span>{Object.values(checkedItems).filter(Boolean).length} of {assessmentItems.length} completed</span>
        </div>
        <Progress value={getCompletionPercentage()} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryItems = assessmentItems.filter(item => item.category === category.id);
          const IconComponent = category.icon;
          
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <IconComponent className={`h-5 w-5 ${category.color}`} />
                <h3 className="font-medium">{category.id}</h3>
              </div>
              
              <div className="space-y-4 ml-7">
                {categoryItems.map(item => (
                  <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={item.id}
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                          {item.statement}
                        </label>
                        {item.importance === 'high' && (
                          <Badge variant="destructive" className="text-xs">High Priority</Badge>
                        )}
                      </div>
                    </div>
                    
                    {checkedItems[item.id] && (
                      <div className="ml-6 space-y-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Confidence Level: {confidenceLevels[item.id] || 50}%
                          </label>
                          <Slider
                            value={[confidenceLevels[item.id] || 50]}
                            onValueChange={(value) => handleConfidenceChange(item.id, value[0])}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Personal Notes</label>
                          <Textarea
                            placeholder="Add your thoughts, examples, or areas you want to improve..."
                            value={notes[item.id] || ''}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {getCompletionPercentage() > 0 && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Progress Summary</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Overall Confidence: {calculateOverallConfidence()}%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {getCompletionPercentage() === 100 ? 'Ready to submit!' : `${getCompletionPercentage()}% of skills assessed`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            onClick={submitAssessment}
            disabled={getCompletionPercentage() === 0 || loading}
            className="min-w-[200px]"
          >
            {loading ? 'Submitting...' : 'Submit Self-Assessment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}