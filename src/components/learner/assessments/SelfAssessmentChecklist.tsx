import React, { useState, useEffect } from 'react';
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
  Users,
  ChevronDown,
  ChevronUp
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
  onBack?: () => void;
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

export default function SelfAssessmentChecklist({ moduleId, employeeId, onComplete, currentProgress, onBack }: SelfAssessmentChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [confidenceLevels, setConfidenceLevels] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
      <div className="space-y-3">
        {/* Compact Results */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-900 dark:text-green-100">Complete</span>
            </div>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">{overallConfidence}%</span>
          </div>
          <Progress value={overallConfidence} className="h-2" />
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {getCompletionPercentage()}% of skills assessed
          </div>
        </div>

        {/* Progressive Disclosure - Strengths */}
        {strengths.length > 0 && (
          <div className="border rounded-lg">
            <button
              onClick={() => setExpandedCategories(prev => ({ ...prev, strengths: !prev.strengths }))}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Strengths ({strengths.length})</span>
              </div>
              {expandedCategories.strengths ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedCategories.strengths && (
              <div className="px-3 pb-3 space-y-2 border-t">
                {strengths.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="flex-1">{item.statement}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">{confidenceLevels[item.id]}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progressive Disclosure - Improvements */}
        {improvements.length > 0 && (
          <div className="border rounded-lg">
            <button
              onClick={() => setExpandedCategories(prev => ({ ...prev, improvements: !prev.improvements }))}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Areas to improve ({improvements.length})</span>
              </div>
              {expandedCategories.improvements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedCategories.improvements && (
              <div className="px-3 pb-3 space-y-2 border-t">
                {improvements.map(item => (
                  <div key={item.id} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span>{item.statement}</span>
                    </div>
                    <div className="ml-5 p-2 bg-orange-50 dark:bg-orange-950/50 rounded text-orange-700 dark:text-orange-300">
                      {getRecommendation(item.category)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={resetAssessment} variant="outline" size="sm">
            Retake
          </Button>
          <Button onClick={onBack} variant="outline" size="sm">
            Back
          </Button>
          <Button onClick={onComplete} size="sm" className="flex-1">
            Continue
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
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Self-Assessment</h3>
        <div className="text-xs text-muted-foreground">
          {Object.values(checkedItems).filter(Boolean).length}/{assessmentItems.length}
        </div>
      </div>
      
      <Progress value={getCompletionPercentage()} className="h-2" />

      {/* Compact Categories with Progressive Disclosure */}
      <div className="space-y-2">
        {categories.map(category => {
          const categoryItems = assessmentItems.filter(item => item.category === category.id);
          const IconComponent = category.icon;
          const isExpanded = expandedCategories[category.id];
          const categoryProgress = categoryItems.filter(item => checkedItems[item.id]).length;
          
          return (
            <div key={category.id} className="border rounded-lg">
              <button
                onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-4 w-4 ${category.color}`} />
                  <span className="text-sm font-medium">{category.id}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {categoryProgress}/{categoryItems.length}
                  </Badge>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t">
                  {categoryItems.map(item => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={item.id}
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.id} className="text-sm cursor-pointer block">
                            {item.statement}
                          </label>
                          {item.importance === 'high' && (
                            <Badge variant="destructive" className="text-xs mt-1">Key Skill</Badge>
                          )}
                        </div>
                      </div>
                      
                      {checkedItems[item.id] && (
                        <div className="ml-6 space-y-2 pt-2 border-t">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Confidence: {confidenceLevels[item.id] || 50}%
                            </label>
                            <Slider
                              value={[confidenceLevels[item.id] || 50]}
                              onValueChange={(value) => handleConfidenceChange(item.id, value[0])}
                              max={100}
                              step={10}
                              className="w-full mt-1"
                            />
                          </div>
                          
                          <div>
                            <Textarea
                              placeholder="Quick notes..."
                              value={notes[item.id] || ''}
                              onChange={(e) => handleNoteChange(item.id, e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact Progress Summary */}
      {getCompletionPercentage() > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Progress: {calculateOverallConfidence()}% confidence
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {getCompletionPercentage() === 100 ? 'Ready to submit!' : `${getCompletionPercentage()}% complete`}
          </div>
        </div>
      )}

      {/* Compact Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={onBack} variant="outline" size="sm">
          Back
        </Button>
        <Button
          onClick={submitAssessment}
          disabled={getCompletionPercentage() === 0 || loading}
          size="sm"
          className="flex-1"
        >
          {loading ? 'Saving...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}