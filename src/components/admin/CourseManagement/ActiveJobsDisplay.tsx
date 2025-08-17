import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  CheckCircle, 
  Circle, 
  Loader2,
  AlertCircle,
  Clock,
  User,
  Pause,
  Play,
  X
} from 'lucide-react';
import { AgentPipelineProgress } from './AgentPipelineProgress';

interface Job {
  id: string;
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  total_employees: number;
  successful_courses: number;
  failed_courses: number;
  progress_percentage: number;
  current_phase: string;
  current_employee_name?: string;
  current_agent?: string;
  completed_agents?: string[];
  employee_progress?: EmployeeProgress[];
  created_at: string;
  updated_at: string;
  initiated_by?: string;
  error_message?: string;
  multimedia_status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  multimedia_progress?: number;
  multimedia_session_id?: string;
  metadata?: {
    priority?: string;
    generation_mode?: string;
    estimated_duration_seconds?: number;
    queued_at?: string;
    processing_started_at?: string;
  };
}

interface EmployeeProgress {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export const ActiveJobsDisplay = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const companyId = userProfile?.company_id;
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifiedJobs, setNotifiedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!companyId) return;

    fetchActiveJobs();

    // Subscribe to job updates
    const channel = supabase
      .channel('active-jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_generation_jobs',
        filter: `company_id=eq.${companyId}`
      }, (payload) => {
        handleJobUpdate(payload);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [companyId]);

  const fetchActiveJobs = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('course_generation_jobs')
        .select(`
          *,
          users:initiated_by (
            full_name
          )
        `)
        .eq('company_id', companyId)
        .in('status', ['queued', 'pending', 'processing', 'paused'])
        .order('created_at', { ascending: false });

      // Also fetch recent completed/failed jobs for better UX
      const { data: recentData, error: recentError } = await supabase
        .from('course_generation_jobs')
        .select(`
          *,
          users:initiated_by (
            full_name
          )
        `)
        .eq('company_id', companyId)
        .in('status', ['completed', 'failed'])
        .gte('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
        .order('updated_at', { ascending: false })
        .limit(3);

      if (recentError) throw recentError;

      if (error) throw error;

      // Process employee progress from employee_ids array
      const processedJobs = data?.map(job => {
        // Parse employee progress if stored as JSON
        let employeeProgress: EmployeeProgress[] = [];
        if (job.employee_ids && Array.isArray(job.employee_ids)) {
          // We would need to fetch actual employee names and statuses
          // For now, creating mock progress
          employeeProgress = job.employee_ids.map((id: string, index: number) => ({
            id,
            name: `Employee ${index + 1}`, // Would fetch actual names
            status: index < job.successful_courses ? 'completed' : 
                   index === job.successful_courses ? 'processing' : 'pending'
          }));
        }

        return {
          ...job,
          employee_progress: employeeProgress
        };
      }) || [];

      setActiveJobs(processedJobs);
      
      // Process recent jobs similarly
      const processedRecentJobs = recentData?.map(job => {
        let employeeProgress: EmployeeProgress[] = [];
        if (job.employee_ids && Array.isArray(job.employee_ids)) {
          employeeProgress = job.employee_ids.map((id: string, index: number) => ({
            id,
            name: `Employee ${index + 1}`,
            status: index < job.successful_courses ? 'completed' : 
                   index < job.successful_courses + job.failed_courses ? 'failed' : 'pending'
          }));
        }
        return { ...job, employee_progress: employeeProgress };
      }) || [];
      
      setRecentJobs(processedRecentJobs);
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      fetchActiveJobs();
    } else if (payload.eventType === 'UPDATE') {
      const updatedJob = payload.new;
      
      // Show completion notification
      if ((updatedJob.status === 'completed' || updatedJob.status === 'failed') && 
          !notifiedJobs.has(updatedJob.id)) {
        
        setNotifiedJobs(prev => new Set([...prev, updatedJob.id]));
        
        if (updatedJob.status === 'completed') {
          toast({
            title: 'Course Generation Complete! 🎉',
            description: `Successfully generated courses for ${updatedJob.successful_courses} employee${updatedJob.successful_courses !== 1 ? 's' : ''}`,
          });
        } else if (updatedJob.status === 'failed') {
          toast({
            title: 'Course Generation Failed',
            description: `Generation failed: ${updatedJob.error_message || 'Unknown error'}`,
            variant: 'destructive',
          });
        }
        
        // Refresh to move job to recent jobs
        setTimeout(() => fetchActiveJobs(), 1000);
      }
      
      setActiveJobs(prev => prev.map(job => 
        job.id === updatedJob.id 
          ? { ...job, ...updatedJob }
          : job
      ));
    } else if (payload.eventType === 'DELETE') {
      setActiveJobs(prev => prev.filter(job => job.id !== payload.old.id));
    }
  };

  const pauseJob = async (jobId: string) => {
    try {
      await supabase
        .from('course_generation_jobs')
        .update({ status: 'paused' })
        .eq('id', jobId);
    } catch (error) {
      console.error('Error pausing job:', error);
    }
  };

  const resumeJob = async (jobId: string) => {
    try {
      await supabase
        .from('course_generation_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);
    } catch (error) {
      console.error('Error resuming job:', error);
    }
  };

  const cancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    
    try {
      await supabase
        .from('course_generation_jobs')
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', jobId);
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show component if there are active jobs OR recent jobs to display
  if (activeJobs.length === 0 && recentJobs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Course Generation Jobs
        </h3>
        <div className="flex items-center gap-2">
          {activeJobs.length > 0 && (
            <Badge variant="default">
              {activeJobs.length} active
            </Badge>
          )}
          {recentJobs.length > 0 && (
            <Badge variant="outline">
              {recentJobs.length} recent
            </Badge>
          )}
        </div>
      </div>
      
      {/* Active Jobs */}
      {activeJobs.map(job => (
        <Card key={job.id} className="overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedJobId(
              expandedJobId === job.id ? null : job.id
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Progress Circle */}
                <div className="relative">
                  {job.status === 'processing' ? (
                    <div className="relative">
                      <svg className="h-10 w-10 -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${job.progress_percentage} 100`}
                          className="text-blue-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {job.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  ) : job.status === 'queued' ? (
                    <Clock className="h-10 w-10 text-gray-400" />
                  ) : job.status === 'pending' ? (
                    <Clock className="h-10 w-10 text-yellow-500" />
                  ) : (
                    <Pause className="h-10 w-10 text-gray-500" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium">
                    Generating for {job.total_employees} employee{job.total_employees !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.current_phase}
                    {job.current_employee_name && (
                      <span> • Processing {job.current_employee_name}</span>
                    )}
                  </p>
                  {/* Multimedia Status */}
                  {job.multimedia_status && job.multimedia_status !== 'not_started' && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={
                          job.multimedia_status === 'completed' ? 'success' :
                          job.multimedia_status === 'in_progress' ? 'secondary' :
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {job.multimedia_status === 'in_progress' && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        Multimedia: {job.multimedia_status}
                        {job.multimedia_progress && job.multimedia_status === 'in_progress' && (
                          <span className="ml-1">({Math.round(job.multimedia_progress)}%)</span>
                        )}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {job.status === 'queued' ? (
                      <>
                        <span>Priority: {job.metadata?.priority || 'normal'}</span>
                        {job.metadata?.estimated_duration_seconds && (
                          <span>Est. {Math.ceil(job.metadata.estimated_duration_seconds / 60)} min</span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {job.successful_courses} completed
                        </span>
                        {job.failed_courses > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            {job.failed_courses} failed
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {job.status === 'processing' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => pauseJob(job.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : job.status === 'paused' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resumeJob(job.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : null}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelJob(job.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Badge variant={
                  job.status === 'processing' ? 'default' : 
                  job.status === 'queued' ? 'outline' :
                  job.status === 'paused' ? 'secondary' :
                  'outline'
                }>
                  {job.status}
                </Badge>
                
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedJobId === job.id && "rotate-180"
                )} />
              </div>
            </div>
          </div>
          
          {expandedJobId === job.id && (
            <div className="border-t px-4 py-3 bg-muted/30">
              {/* Agent Pipeline Visualization */}
              {job.current_agent && (
                <AgentPipelineProgress 
                  currentAgent={job.current_agent}
                  completedAgents={job.completed_agents || []}
                />
              )}
              
              {/* Employee Progress List */}
              {job.employee_progress && job.employee_progress.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium mb-2">Employee Progress</p>
                  <div className="space-y-1">
                    {job.employee_progress.map(emp => (
                      <div key={emp.id} className="flex items-center gap-2 text-sm">
                        {emp.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : emp.status === 'processing' ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        ) : emp.status === 'failed' ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={cn(
                          emp.status === 'processing' && "font-medium"
                        )}>
                          {emp.name}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {emp.status === 'completed' ? 'Complete' :
                           emp.status === 'processing' ? 'Processing...' :
                           emp.status === 'failed' ? 'Failed' :
                           'Pending'}
                        </span>
                        {emp.error && (
                          <span className="text-xs text-red-500 ml-auto">
                            {emp.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {job.error_message && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded text-sm text-red-600 dark:text-red-400">
                  {job.error_message}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
      
      {/* Recent Completed/Failed Jobs */}
      {recentJobs.length > 0 && (
        <>
          {activeJobs.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Recently Completed
              </h4>
            </div>
          )}
          {recentJobs.map(job => (
            <Card key={job.id} className="overflow-hidden opacity-75">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="relative">
                      {job.status === 'completed' ? (
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      ) : (
                        <AlertCircle className="h-10 w-10 text-red-500" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">
                        Generated for {job.total_employees} employee{job.total_employees !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.status === 'completed' ? 'Completed successfully' : 'Generation failed'}
                        {job.current_employee_name && (
                          <span> • Last: {job.current_employee_name}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {job.successful_courses} completed
                        </span>
                        {job.failed_courses > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            {job.failed_courses} failed
                          </span>
                        )}
                        <span>
                          {new Date(job.updated_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={
                    job.status === 'completed' ? 'success' : 'destructive'
                  }>
                    {job.status}
                  </Badge>
                </div>
                
                {/* Error Message for Failed Jobs */}
                {job.status === 'failed' && job.error_message && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded text-sm text-red-600 dark:text-red-400">
                    {job.error_message}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};