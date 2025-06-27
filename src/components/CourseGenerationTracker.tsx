import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_employees: number;
  processed_employees: number;
  successful_courses: number;
  failed_courses: number;
  current_employee_name?: string;
  current_phase?: string;
  progress_percentage: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface CourseGenerationTrackerProps {
  jobId?: string;
  onComplete?: () => void;
}

const CourseGenerationTracker: React.FC<CourseGenerationTrackerProps> = ({ jobId, onComplete }) => {
  const { user } = useAuth();
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJob();
      subscribeToUpdates();
    } else {
      checkForActiveJobs();
    }

    return () => {
      // Cleanup subscription
    };
  }, [jobId]);

  const fetchJob = async () => {
    if (!jobId) return;

    const { data, error } = await supabase
      .from('course_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return;
    }

    setJob(data);
    setIsVisible(true);

    // If job is complete, call onComplete after a delay
    if (data.status === 'completed' && onComplete) {
      setTimeout(onComplete, 2000);
    }
  };

  const checkForActiveJobs = async () => {
    if (!user?.id) return;
    
    // Check for any active jobs created by this user
    const { data, error } = await supabase
      .from('course_generation_jobs')
      .select('*')
      .eq('created_by', user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return;
    }

    setJob(data[0]);
    setIsVisible(true);
    subscribeToUpdates(data[0].id);
  };

  const subscribeToUpdates = (jobIdToSubscribe?: string) => {
    const idToUse = jobIdToSubscribe || jobId;
    if (!idToUse) return;

    const channel = supabase
      .channel(`generation-job-${idToUse}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_generation_jobs',
          filter: `id=eq.${idToUse}`
        },
        (payload) => {
          setJob(payload.new as GenerationJob);
          
          // Show toast for important status changes
          if (payload.new.status === 'completed') {
            toast.success('Course generation completed!');
            if (onComplete) {
              setTimeout(onComplete, 2000);
            }
          } else if (payload.new.status === 'failed') {
            toast.error('Course generation failed: ' + payload.new.error_message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const getStatusIcon = () => {
    switch (job?.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
  };

  const getStatusText = () => {
    switch (job?.status) {
      case 'pending':
        return 'Preparing...';
      case 'processing':
        return job.current_phase || 'Processing...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (!isVisible || !job) return null;

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300",
        isMinimized
          ? "bottom-4 right-4 w-80"
          : "bottom-4 right-4 w-96"
      )}
    >
      <Card className={cn(
        "shadow-lg border-2",
        job.status === 'failed' && "border-red-200",
        job.status === 'completed' && "border-green-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-sm">Course Generation</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-7 w-7 p-0"
              disabled={job.status === 'processing'}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {job.processed_employees} of {job.total_employees} employees
                </span>
                <span className="font-medium">{Math.round(job.progress_percentage)}%</span>
              </div>
              <Progress value={job.progress_percentage} className="h-2" />
            </div>

            {/* Current Status */}
            {job.status === 'processing' && (
              <div className="space-y-2">
                {job.current_employee_name && (
                  <>
                    <p className="text-sm font-medium">Currently processing:</p>
                    <p className="text-sm text-muted-foreground">{job.current_employee_name}</p>
                  </>
                )}
                {job.current_phase && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">{job.current_phase}</span>
                  </div>
                )}
                {/* Phase indicators */}
                <div className="space-y-1 mt-3">
                  {getPhaseStatus(job.current_phase).map((phase, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {phase.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : phase.active ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-muted" />
                      )}
                      <span className={cn(
                        phase.completed && "text-green-600",
                        phase.active && "text-primary font-medium",
                        !phase.completed && !phase.active && "text-muted-foreground"
                      )}>
                        {phase.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(job.successful_courses > 0 || job.failed_courses > 0) && (
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>{job.successful_courses} successful</span>
                </div>
                {job.failed_courses > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span>{job.failed_courses} failed</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {job.error_message && (
              <div className="p-2 bg-red-50 rounded text-sm text-red-700">
                {job.error_message}
              </div>
            )}

            {/* Completion Time */}
            {job.completed_at && (
              <div className="text-xs text-muted-foreground">
                Completed in {calculateDuration(job.created_at, job.completed_at)}
              </div>
            )}
          </div>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="px-4 pb-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{getStatusText()}</span>
              <span className="text-sm text-muted-foreground">
                {job.processed_employees}/{job.total_employees}
              </span>
            </div>
            <Progress value={job.progress_percentage} className="h-1 mt-2" />
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper function to get phase status
function getPhaseStatus(currentPhase?: string): Array<{name: string, completed: boolean, active: boolean}> {
  const phases = [
    'Retrieving employee data',
    'Retrieving skills gap analysis',
    'Creating personalized course plan',
    'Researching relevant content',
    'Generating course content with AI',
    'Enhancing content quality',
    'Storing course content',
    'Creating course assignment',
    'Course generation complete'
  ];

  const currentIndex = currentPhase ? phases.findIndex(p => p === currentPhase) : -1;
  
  return phases.map((phase, index) => ({
    name: phase,
    completed: currentIndex > index,
    active: currentIndex === index
  }));
}

// Helper function to calculate duration
function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'less than a minute';
  if (diffMins === 1) return '1 minute';
  if (diffMins < 60) return `${diffMins} minutes`;
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours === 1 && mins === 0) return '1 hour';
  if (hours === 1) return `1 hour ${mins} minutes`;
  if (mins === 0) return `${hours} hours`;
  return `${hours} hours ${mins} minutes`;
}

export default CourseGenerationTracker;