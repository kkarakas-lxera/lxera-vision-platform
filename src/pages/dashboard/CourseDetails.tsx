import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  BookOpen, 
  Target, 
  Award, 
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Download,
  BarChart3,
  Printer,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseContentSection } from '@/components/CourseContentSection';
import { EditableSection } from '@/components/EditableSection';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CourseAssignment {
  id: string;
  employee_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  total_modules: number;
  modules_completed: number;
  is_preview?: boolean;
  approval_status?: string;
  approval_feedback?: string;
  approved_by?: string;
  approved_at?: string;
  employee: {
    full_name: string;
    email: string;
    position: string;
    department: string;
  };
}

interface CourseContent {
  content_id: string;
  module_name: string;
  total_word_count: number;
  status: string;
  priority_level: string;
  introduction?: string;
  core_content?: string;
  practical_applications?: string;
  case_studies?: string;
  assessments?: string;
  version_number?: number;
  last_edited_by?: string;
  last_edited_at?: string;
}

interface CoursePlan {
  plan_id: string;
  course_title: string;
  course_structure: any;
  total_modules: number;
  course_duration_weeks: number;
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [content, setContent] = useState<CourseContent | null>(null);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [contentVersion, setContentVersion] = useState(1);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (userProfile?.company_id && courseId) {
      fetchCourseData();
    }
  }, [userProfile, courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      console.log('UserProfile company_id:', userProfile?.company_id);
      console.log('CourseId:', courseId);

      // Fetch all assignments for this course
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          *,
          employees!inner (
            id,
            position,
            department,
            users!inner (
              full_name,
              email
            )
          )
        `)
        .eq('course_id', courseId)
        .eq('company_id', userProfile?.company_id);

      if (assignmentsError) throw assignmentsError;

      // Transform the data
      const transformedAssignments = assignmentsData?.map(assignment => ({
        ...assignment,
        employee: {
          full_name: assignment.employees?.users?.full_name || 'Unknown',
          email: assignment.employees?.users?.email || '',
          position: assignment.employees?.position || '',
          department: assignment.employees?.department || ''
        }
      })) || [];

      setAssignments(transformedAssignments);

      // Fetch module content
      console.log('Fetching content for courseId:', courseId);
      console.log('UserProfile:', userProfile);
      
      // The RLS policy requires company_id in JWT, but we can work around this
      // by using a service role key or by ensuring the query matches the RLS policy
      
      try {
        // Use different functions based on user role
        let contentData, contentError;
        
        if (userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin') {
          // Use the admin function
          const result = await supabase
            .rpc('get_module_content_for_admin', {
              p_content_id: courseId,
              p_company_id: userProfile?.company_id
            });
          contentData = result.data;
          contentError = result.error;
        } else if (userProfile?.role === 'learner') {
          // Use the learner function
          const result = await supabase
            .rpc('get_module_content_for_learner', {
              p_content_id: courseId
            });
          contentData = result.data;
          contentError = result.error;
        }

        console.log('Content query result:', { 
          contentData, 
          contentError,
          courseId,
          company_id: userProfile?.company_id,
          role: userProfile?.role,
          dataLength: contentData?.length
        });

        if (!contentError && contentData && contentData.length > 0) {
          setContent(contentData[0]);
          setContentVersion(contentData[0].version_number || 1);
          console.log('Content set successfully:', contentData[0].module_name);
        } else {
          console.log('No content found or error:', contentError);
          
          // If no content found, it might be an RLS issue
          // For now, we know the content exists, so let's set a message
          console.warn('Content exists in database but RLS policy may be blocking access');
        }
      } catch (error) {
        console.error('Error in content fetch:', error);
      }

      // Fetch course plan if available
      if (assignmentsData?.[0]?.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from('cm_course_plans')
          .select('*')
          .eq('plan_id', assignmentsData[0].plan_id)
          .single();

        if (!planError && planData) {
          setCoursePlan(planData);
        }
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { label: 'Assigned', variant: 'outline' as const, icon: AlertCircle },
      in_progress: { label: 'In Progress', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
      failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.assigned;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateMetrics = () => {
    const totalAssignments = assignments.length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const avgProgress = assignments.reduce((sum, a) => sum + (a.progress_percentage || 0), 0) / (totalAssignments || 1);
    
    return {
      totalAssignments,
      inProgress,
      completed,
      avgProgress,
      completionRate: totalAssignments > 0 ? (completed / totalAssignments) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

  const isPreviewCourse = assignments.some(a => a.is_preview);
  const isAwaitingApproval = assignments.some(a => a.is_preview && (a.approval_status === 'pending' || a.approval_status === 'revision_requested'));
  const isRevisionRequested = assignments.some(a => a.is_preview && a.approval_status === 'revision_requested');
  const existingFeedback = assignments.find(a => a.is_preview && a.approval_feedback)?.approval_feedback;

  const handleApprove = async () => {
    if (!courseId || !userProfile?.id) return;
    
    try {
      // Update approval status
      const { error } = await supabase
        .from('course_assignments')
        .update({
          approval_status: 'approved',
          approved_by: userProfile.id,
          approved_at: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .eq('is_preview', true);

      if (error) throw error;

      // Trigger resume generation
      const { error: resumeError } = await supabase.functions.invoke('resume-course-generation', {
        body: { 
          course_id: courseId,
          plan_id: coursePlan?.plan_id
        }
      });

      if (resumeError) throw resumeError;

      toast.success('Course approved! Full generation has been queued.');
      await fetchCourseData();
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error('Failed to approve course');
    }
  };

  const handleRequestChanges = () => {
    setFeedbackText('');
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!courseId || !userProfile?.id || !feedbackText.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      
      // Update approval status to revision_requested with feedback
      const { error } = await supabase
        .from('course_assignments')
        .update({
          approval_status: 'revision_requested',
          approval_feedback: feedbackText,
          approved_by: userProfile.id,
          approved_at: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .eq('is_preview', true);

      if (error) throw error;

      // Trigger course regeneration with feedback
      const { error: regenerateError } = await supabase.functions.invoke('generate-course', {
        body: { 
          employee_id: assignments[0]?.employee_id,
          company_id: userProfile?.company_id,
          assigned_by_id: userProfile.id,
          course_id: courseId,
          plan_id: coursePlan?.plan_id,
          generation_mode: 'regenerate_with_feedback',
          feedback_context: feedbackText
        }
      });

      if (regenerateError) {
        console.warn('Regeneration may have failed:', regenerateError);
        // Don't throw - feedback was saved successfully
      }

      toast.success('Feedback submitted! Course regeneration has been queued.');
      setShowFeedbackDialog(false);
      setFeedbackText('');
      await fetchCourseData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading course details...</div>
      </div>
    );
  }

  const courseTitle = coursePlan?.course_title || content?.module_name || 'Course Details';

  return (
    <div className="space-y-6">
      {/* Preview/Approval Banner */}
      {isPreviewCourse && (
        <div className={cn(
          "border rounded-lg p-4",
          isRevisionRequested 
            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
            : isAwaitingApproval 
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800" 
              : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className={cn(
                "h-5 w-5",
                isRevisionRequested
                  ? "text-orange-600 dark:text-orange-400"
                  : isAwaitingApproval 
                    ? "text-yellow-600 dark:text-yellow-400" 
                    : "text-green-600 dark:text-green-400"
              )} />
              <div>
                <p className="font-medium">
                  {isRevisionRequested 
                    ? 'Preview Course - Changes Requested' 
                    : isAwaitingApproval 
                      ? 'Preview Course - Awaiting Approval' 
                      : 'Preview Course - Approved'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRevisionRequested
                    ? 'Course regeneration is in progress based on your feedback.'
                    : isAwaitingApproval 
                      ? 'Review the course content below. You can edit sections inline before approving.'
                      : 'This preview has been approved. Full course generation is in progress.'}
                </p>
                {existingFeedback && (
                  <p className="text-xs text-orange-600 mt-1">
                    Previous feedback: "{existingFeedback}"
                  </p>
                )}
              </div>
            </div>
            {isAwaitingApproval && !isRevisionRequested && (userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin') && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleRequestChanges} 
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Generate Full Course
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/courses')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{courseTitle}</h1>
            <p className="text-muted-foreground">
              Course ID: {courseId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin') && coursePlan && (
            <Button 
              onClick={() => navigate(`/dashboard/courses/${coursePlan.plan_id}/edit`)}
              className="bg-business-black hover:bg-business-black/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          )}
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.totalAssignments}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.inProgress}</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.completed}</span>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.avgProgress.toFixed(1)}%</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</span>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learners">Learners ({assignments.length})</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursePlan && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {coursePlan.course_structure?.learning_objectives?.join(', ') || 'No description available'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Modules</p>
                      <p className="font-medium">{coursePlan.total_modules}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{coursePlan.course_duration_weeks} weeks</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Word Count</p>
                      <p className="font-medium">{content?.total_word_count?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reading Time</p>
                      <p className="font-medium">{Math.ceil((content?.total_word_count || 0) / 150)} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{content?.status || 'Draft'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learners Tab */}
        <TabsContent value="learners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Learners</CardTitle>
              <CardDescription>Track individual learner progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{assignment.employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.employee.position} • {assignment.employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground">{assignment.employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{assignment.modules_completed}/{assignment.total_modules} modules</p>
                        <Progress value={assignment.progress_percentage || 0} className="w-32 mt-1" />
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {content ? (
            <div className="space-y-4">
              {/* Content Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>

              {/* Content Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{content.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
                      <p className="font-medium">{content.priority_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Words</p>
                      <p className="font-medium">{content.total_word_count?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Reading Time</p>
                      <p className="font-medium">{Math.ceil((content.total_word_count || 0) / 150)} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Module</p>
                      <p className="font-medium">{content.module_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Introduction Section */}
              {content.introduction && (
                userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin' ? (
                  <EditableSection
                    title="Introduction"
                    content={content.introduction}
                    contentId={content.content_id}
                    sectionKey="introduction"
                    icon={<BookOpen className="h-5 w-5" />}
                    defaultExpanded={true}
                    versionNumber={contentVersion}
                    onVersionUpdate={setContentVersion}
                  />
                ) : (
                  <CourseContentSection
                    title="Introduction"
                    content={content.introduction}
                    icon={<BookOpen className="h-5 w-5" />}
                    defaultExpanded={true}
                  />
                )
              )}

              {/* Core Content Section */}
              {content.core_content && (
                userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin' ? (
                  <EditableSection
                    title="Core Content"
                    content={content.core_content}
                    contentId={content.content_id}
                    sectionKey="core_content"
                    icon={<FileText className="h-5 w-5" />}
                    versionNumber={contentVersion}
                    onVersionUpdate={setContentVersion}
                  />
                ) : (
                  <CourseContentSection
                    title="Core Content"
                    content={content.core_content}
                    icon={<FileText className="h-5 w-5" />}
                  />
                )
              )}

              {/* Practical Applications Section */}
              {content.practical_applications && (
                userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin' ? (
                  <EditableSection
                    title="Practical Applications"
                    content={content.practical_applications}
                    contentId={content.content_id}
                    sectionKey="practical_applications"
                    icon={<Target className="h-5 w-5" />}
                    versionNumber={contentVersion}
                    onVersionUpdate={setContentVersion}
                  />
                ) : (
                  <CourseContentSection
                    title="Practical Applications"
                    content={content.practical_applications}
                    icon={<Target className="h-5 w-5" />}
                  />
                )
              )}

              {/* Case Studies Section */}
              {content.case_studies && (
                userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin' ? (
                  <EditableSection
                    title="Case Studies"
                    content={content.case_studies}
                    contentId={content.content_id}
                    sectionKey="case_studies"
                    icon={<BarChart3 className="h-5 w-5" />}
                    versionNumber={contentVersion}
                    onVersionUpdate={setContentVersion}
                  />
                ) : (
                  <CourseContentSection
                    title="Case Studies"
                    content={content.case_studies}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                )
              )}

              {/* Assessments Section */}
              {content.assessments && (
                userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin' ? (
                  <EditableSection
                    title="Assessments"
                    content={content.assessments}
                    contentId={content.content_id}
                    sectionKey="assessments"
                    icon={<CheckCircle className="h-5 w-5" />}
                    versionNumber={contentVersion}
                    onVersionUpdate={setContentVersion}
                  />
                ) : (
                  <CourseContentSection
                    title="Assessments"
                    content={content.assessments}
                    icon={<CheckCircle className="h-5 w-5" />}
                  />
                )
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No content generated yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Analytics coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Course Changes</DialogTitle>
            <DialogDescription>
              Describe what changes you'd like to see in this course. The AI will regenerate the content based on your feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Feedback</label>
              <Textarea
                placeholder="e.g., 'Too basic for senior developers - add more advanced concepts and real-world examples', 'Focus more on practical applications', 'Add leadership and team management skills'..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                The AI will analyze your feedback and regenerate the course content accordingly.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackDialog(false)}
                  disabled={isSubmittingFeedback}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim() || isSubmittingFeedback}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Submit & Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}