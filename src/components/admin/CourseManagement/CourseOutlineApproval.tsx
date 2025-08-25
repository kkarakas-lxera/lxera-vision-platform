import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, BookOpen, Calendar, Users } from 'lucide-react';

interface CourseStructure {
  title: string;
  duration_weeks: number;
  learning_objectives: string[];
  prerequisites?: string[];
  success_metrics?: string[];
  assessment_strategy?: {
    formative_assessments: string;
    summative_assessment: string;
    competency_validation: string;
  };
  engagement_methods?: string[];
  performance_indicators?: string[];
  modules: Array<{
    title: string;
    duration: string;
    topics: string[];
    priority: string;
    week: number;
    learning_outcomes?: string[];
    activities?: string[];
    practical_application?: string;
    time_commitment?: string;
    deliverable?: string;
  }>;
}

interface PendingOutline {
  plan_id: string;
  employee_id: string;
  employee_name: string;
  course_title: string;
  course_structure: CourseStructure;
  prioritized_gaps: any;
  created_at: string;
  total_modules: number;
  approval_status: 'pending_review' | 'approved' | 'rejected';
  approval_feedback?: string;
}

export const CourseOutlineApproval = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const companyId = userProfile?.company_id;
  
  const [pendingOutlines, setPendingOutlines] = useState<PendingOutline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutline, setSelectedOutline] = useState<PendingOutline | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchPendingOutlines();
    }
  }, [companyId]);

  const fetchPendingOutlines = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Get employee IDs for this company
      const { data: companyEmployees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId);
      
      if (empError) throw empError;
      
      const employeeIds = companyEmployees?.map(e => e.id) || [];
      
      if (employeeIds.length === 0) {
        setPendingOutlines([]);
        return;
      }

      // Fetch course plans that are pending approval
      const { data: outlines, error } = await supabase
        .from('cm_course_plans')
        .select(`
          plan_id,
          employee_id,
          employee_name,
          course_title,
          course_structure,
          prioritized_gaps,
          created_at,
          total_modules,
          approval_status,
          approval_feedback
        `)
        .in('employee_id', employeeIds)
        .eq('status', 'completed')
        .eq('is_preview_mode', true)
        .eq('approval_status', 'pending_review')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPendingOutlines(outlines || []);
    } catch (error) {
      console.error('Error fetching pending outlines:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending course outlines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (planId: string, approved: boolean, feedback: string = '') => {
    try {
      setActionLoading(planId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (approved) {
        // Approve and trigger Module 1 generation
        const { error: approvalError } = await supabase
          .from('cm_course_plans')
          .update({
            approval_status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            approval_feedback: feedback
          })
          .eq('plan_id', planId);

        if (approvalError) throw approvalError;

        // Create a course generation job for Module 1
        const outline = pendingOutlines.find(o => o.plan_id === planId);
        if (outline) {
          const { error: jobError } = await supabase
            .from('course_generation_jobs')
            .insert({
              company_id: companyId,
              initiated_by: user.id,
              total_employees: 1,
              employee_ids: [outline.employee_id],
              status: 'queued',
              current_phase: 'Waiting in queue for Module 1 generation',
              progress_percentage: 0,
              successful_courses: 0,
              failed_courses: 0,
              generation_mode: 'first_module',
              metadata: {
                priority: 'high',
                estimated_duration_seconds: 300,
                queued_at: new Date().toISOString(),
                is_approval: true,
                employee_plan_id_map: { [outline.employee_id]: planId },
                approved_outline_plan_id: planId
              }
            });

          if (jobError) throw jobError;
        }

        toast({
          title: 'Course Approved! 🎉',
          description: 'Module 1 generation has been queued and will start shortly.',
        });
      } else {
        // Reject with feedback for re-planning
        const { error: rejectionError } = await supabase
          .from('cm_course_plans')
          .update({
            approval_status: 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            approval_feedback: feedback
          })
          .eq('plan_id', planId);

        if (rejectionError) throw rejectionError;

        // Create a course generation job for re-planning
        const outline = pendingOutlines.find(o => o.plan_id === planId);
        if (outline) {
          const { error: jobError } = await supabase
            .from('course_generation_jobs')
            .insert({
              company_id: companyId,
              initiated_by: user.id,
              total_employees: 1,
              employee_ids: [outline.employee_id],
              status: 'queued',
              current_phase: 'Waiting in queue for re-planning',
              progress_percentage: 0,
              successful_courses: 0,
              failed_courses: 0,
              generation_mode: 'regenerate_with_feedback',
              metadata: {
                priority: 'high',
                estimated_duration_seconds: 180,
                queued_at: new Date().toISOString(),
                is_replanning: true,
                rejection_feedback: feedback,
                original_plan_id: planId
              }
            });

          if (jobError) throw jobError;
        }

        toast({
          title: 'Course Outline Rejected',
          description: 'Re-planning has been queued with your feedback.',
        });
      }

      // Remove from pending list
      setPendingOutlines(prev => prev.filter(o => o.plan_id !== planId));
      setSelectedOutline(null);
      setFeedback('');
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to process approval',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  if (pendingOutlines.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">All Course Outlines Approved</p>
        <p className="text-muted-foreground">
          No course outlines are currently waiting for approval
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Outline Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve course outlines before Module 1 generation
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {pendingOutlines.length} pending
        </Badge>
      </div>

      <div className="grid gap-3">
        {pendingOutlines.map((outline) => (
          <Card key={outline.plan_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base leading-tight">{outline.course_title}</CardTitle>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {outline.employee_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {outline.course_structure?.duration_weeks || 'N/A'} weeks
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {outline.total_modules} modules
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-2 w-2 mr-1" />
                  Pending Review
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {/* Learning Objectives & Enterprise Elements */}
              <div className="space-y-3">
                {/* Learning Objectives */}
                <div>
                  <h4 className="text-sm font-medium mb-1.5">Learning Objectives</h4>
                  {outline.course_structure?.learning_objectives && outline.course_structure.learning_objectives.length > 0 ? (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {outline.course_structure.learning_objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <span className="text-blue-500 mt-0.5 text-xs">•</span>
                          <span className="leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded border-muted-foreground/20">
                      <div className="text-center">
                        <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-medium text-muted-foreground">No Learning Objectives</p>
                        <p className="text-xs text-muted-foreground opacity-70">This course outline is missing learning objectives</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prerequisites */}
                {outline.course_structure?.prerequisites && outline.course_structure.prerequisites.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1.5">Prerequisites</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {outline.course_structure.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5 text-xs">✓</span>
                          <span className="leading-relaxed">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Success Metrics */}
                {outline.course_structure?.success_metrics && outline.course_structure.success_metrics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1.5">Success Metrics</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {outline.course_structure.success_metrics.map((metric, index) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5 text-xs">📊</span>
                          <span className="leading-relaxed">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Assessment Strategy */}
                {outline.course_structure?.assessment_strategy && (
                  <div>
                    <h4 className="text-sm font-medium mb-1.5">Assessment Strategy</h4>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Formative: </span>
                        {outline.course_structure.assessment_strategy.formative_assessments}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Summative: </span>
                        {outline.course_structure.assessment_strategy.summative_assessment}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Validation: </span>
                        {outline.course_structure.assessment_strategy.competency_validation}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Modules */}
              <div>
                <h4 className="text-sm font-medium mb-1.5">Course Structure</h4>
                {outline.course_structure?.modules && outline.course_structure.modules.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {outline.course_structure.modules.map((module, index) => (
                      <AccordionItem key={index} value={`module-${index}`} className="border-b border-border/50">
                        <AccordionTrigger className="text-xs py-2 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="font-medium">Module {index + 1}: {module.title}</span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                                Week {module.week}
                              </Badge>
                              <span className="text-xs">{module.duration}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={
                                module.priority === 'critical' || module.priority === 'Critical' ? 'destructive' :
                                module.priority === 'High' || module.priority === 'high' ? 'default' : 'secondary'
                              } className="text-xs px-1.5 py-0.5 h-auto">
                                {module.priority} Priority
                              </Badge>
                              {module.time_commitment && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                                  {module.time_commitment}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Learning Outcomes */}
                            {module.learning_outcomes && module.learning_outcomes.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Learning Outcomes:</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {module.learning_outcomes.map((outcome, outcomeIndex) => (
                                    <li key={outcomeIndex} className="flex items-start gap-1.5">
                                      <span className="text-green-500 mt-0.5 text-xs">✓</span>
                                      <span className="leading-relaxed">{outcome}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Activities */}
                            {module.activities && module.activities.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Learning Activities:</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {module.activities.map((activity, activityIndex) => (
                                    <li key={activityIndex} className="flex items-start gap-1.5">
                                      <span className="text-purple-500 mt-0.5 text-xs">⚡</span>
                                      <span className="leading-relaxed">{activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Practical Application */}
                            {module.practical_application && (
                              <div>
                                <p className="text-xs font-medium mb-1">Practical Application:</p>
                                <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                                  {module.practical_application}
                                </p>
                              </div>
                            )}

                            {/* Deliverable */}
                            {module.deliverable && (
                              <div>
                                <p className="text-xs font-medium mb-1">Module Deliverable:</p>
                                <p className="text-xs text-muted-foreground bg-green-50 p-2 rounded border-l-2 border-green-200">
                                  📋 {module.deliverable}
                                </p>
                              </div>
                            )}
                            
                            {/* Topics */}
                            <div>
                              <p className="text-xs font-medium mb-1">Topics Covered:</p>
                              {module.topics && module.topics.length > 0 ? (
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {module.topics.map((topic, topicIndex) => (
                                    <li key={topicIndex} className="flex items-start gap-1.5">
                                      <span className="text-blue-500 mt-0.5 text-xs">•</span>
                                      <span className="leading-relaxed">{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex items-center justify-center p-3 border border-dashed rounded border-muted-foreground/20">
                                  <div className="text-center">
                                    <FileText className="h-4 w-4 text-muted-foreground mx-auto mb-0.5" />
                                    <p className="text-xs text-muted-foreground">No topics defined for this module</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="flex items-center justify-center p-6 border border-dashed rounded border-muted-foreground/20">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground mb-0.5">No Course Modules</p>
                      <p className="text-xs text-muted-foreground opacity-70">This course outline is missing module definitions</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOutline(outline)}
                    >
                      <XCircle className="h-3 w-3 mr-1.5" />
                      Reject & Request Changes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Course Outline</DialogTitle>
                      <DialogDescription>
                        Provide feedback for re-planning the course outline for {outline.employee_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="feedback">Feedback for Re-planning</Label>
                        <Textarea
                          id="feedback"
                          placeholder="Explain what needs to be changed or improved in the course outline..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            if (feedback.trim()) {
                              handleApproval(outline.plan_id, false, feedback);
                            } else {
                              toast({
                                title: 'Feedback Required',
                                description: 'Please provide feedback for re-planning',
                                variant: 'destructive',
                              });
                            }
                          }}
                          disabled={actionLoading === outline.plan_id || !feedback.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {actionLoading === outline.plan_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Submit Rejection
                        </Button>
                        <Button variant="outline" onClick={() => setFeedback('')}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => handleApproval(outline.plan_id, true)}
                  disabled={actionLoading === outline.plan_id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === outline.plan_id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                  )}
                  Approve & Generate Module 1
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};