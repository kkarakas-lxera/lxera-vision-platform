
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GenerationJob {
  id: string;
  company_id: string;
  initiated_by: string;
  total_employees: number;
  processed_employees: number;
  successful_courses: number;
  failed_courses: number;
  progress_percentage: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_phase: string | null;
  current_employee_name: string | null;
  employee_ids: string[];
  error_message: string | null;
  results: any[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface CourseGenerationTrackerProps {
  jobId: string;
  onComplete?: () => void;
}

const CourseGenerationTracker: React.FC<CourseGenerationTrackerProps> = ({
  jobId,
  onComplete
}) => {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('course_generation_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;

        if (data) {
          // Type assertion to ensure proper typing
          const typedJob: GenerationJob = {
            ...data,
            status: data.status as 'pending' | 'processing' | 'completed' | 'failed'
          };
          setJob(typedJob);

          if (data.status === 'completed' && onComplete) {
            onComplete();
          }
        }
      } catch (err: any) {
        console.error('Error fetching job status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchJobStatus();

    // Set up polling for updates
    const interval = setInterval(fetchJobStatus, 2000);

    // Set up real-time subscription
    const subscription = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_generation_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          if (payload.new) {
            const typedJob: GenerationJob = {
              ...payload.new as any,
              status: (payload.new as any).status as 'pending' | 'processing' | 'completed' | 'failed'
            };
            setJob(typedJob);

            if ((payload.new as any).status === 'completed' && onComplete) {
              onComplete();
            }
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [jobId, onComplete]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading job status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Job not found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Course Generation Progress</span>
          <Badge className={getStatusColor(job.status)}>
            {getStatusIcon(job.status)}
            <span className="ml-1 capitalize">{job.status}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Generating courses for {job.total_employees} employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(job.progress_percentage)}%</span>
          </div>
          <Progress value={job.progress_percentage} className="w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Processed: {job.processed_employees}/{job.total_employees}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Successful: {job.successful_courses}</span>
          </div>
        </div>

        {job.current_phase && (
          <div className="text-sm text-gray-600">
            <strong>Current Phase:</strong> {job.current_phase}
          </div>
        )}

        {job.current_employee_name && (
          <div className="text-sm text-gray-600">
            <strong>Processing:</strong> {job.current_employee_name}
          </div>
        )}

        {job.failed_courses > 0 && (
          <div className="text-sm text-red-600">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {job.failed_courses} course(s) failed to generate
          </div>
        )}

        {job.error_message && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {job.error_message}
          </div>
        )}

        {job.status === 'completed' && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            Course generation completed successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseGenerationTracker;
