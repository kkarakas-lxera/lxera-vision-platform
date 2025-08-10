import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Eye, Users, Clock, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface JobHistory {
  id: string;
  created_at: string;
  updated_at: string;
  initiated_by: string;
  initiated_by_name?: string;
  total_employees: number;
  successful_courses: number;
  failed_courses: number;
  status: 'completed' | 'failed' | 'cancelled';
  duration_seconds?: number;
  error_message?: string;
  employee_ids: string[];
  metadata?: any;
}

interface JobDetails {
  job: JobHistory;
  employees: Array<{
    id: string;
    name: string;
    email: string;
    status: 'completed' | 'failed';
    error?: string;
    course_id?: string;
  }>;
}

export const GenerationHistoryTable = () => {
  const { userProfile } = useAuth();
  const companyId = userProfile?.company_id;
  const [historyJobs, setHistoryJobs] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchHistory();
    }
  }, [companyId]);

  const fetchHistory = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('course_generation_jobs')
        .select(`
          *,
          users:initiated_by (
            full_name
          )
        `)
        .eq('company_id', companyId)
        .in('status', ['completed', 'failed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const processedJobs = data?.map(job => {
        // Calculate duration if both created_at and updated_at exist
        let duration_seconds = 0;
        if (job.created_at && job.updated_at) {
          const start = new Date(job.created_at);
          const end = new Date(job.updated_at);
          duration_seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
        }

        return {
          ...job,
          initiated_by_name: job.users?.full_name || 'Unknown',
          duration_seconds,
          status: job.error_message?.includes('Cancelled') ? 'cancelled' : job.status
        };
      }) || [];

      setHistoryJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const viewDetails = async (jobId: string) => {
    const job = historyJobs.find(j => j.id === jobId);
    if (!job) return;

    // Fetch employee details for this job
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select(`
          id,
          users!inner (
            full_name,
            email
          )
        `)
        .in('id', job.employee_ids);

      const employeeDetails = employees?.map(emp => {
        // Check if this employee has a course from this job
        // This would need to check course_assignments table
        const successIndex = job.successful_courses > 0 ? 
          job.employee_ids.indexOf(emp.id) : -1;
        
        return {
          id: emp.id,
          name: emp.users?.full_name || 'Unknown',
          email: emp.users?.email || '',
          status: successIndex >= 0 && successIndex < job.successful_courses ? 
            'completed' : 'failed',
          error: undefined,
          course_id: undefined
        };
      }) || [];

      setSelectedJob({
        job,
        employees: employeeDetails
      });
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const exportJobReport = (job: JobHistory) => {
    // Create CSV content
    const csvContent = [
      ['Job Report'],
      [''],
      ['Job ID', job.id],
      ['Date', format(new Date(job.created_at), 'yyyy-MM-dd HH:mm:ss')],
      ['Initiated By', job.initiated_by_name],
      ['Total Employees', job.total_employees],
      ['Successful', job.successful_courses],
      ['Failed', job.failed_courses],
      ['Duration', formatDuration(job.duration_seconds || 0)],
      ['Status', job.status],
      [''],
      ['Employee Details'],
      ['Employee ID', 'Status']
    ];

    job.employee_ids.forEach((id, index) => {
      csvContent.push([
        id,
        index < job.successful_courses ? 'Completed' : 'Failed'
      ]);
    });

    // Convert to CSV string
    const csv = csvContent.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course_generation_report_${job.id}_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading generation history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course Generation History</CardTitle>
          <CardDescription>
            View past course generation jobs and their outcomes
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {historyJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No generation history yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Initiated By</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {historyJobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {format(new Date(job.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(job.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{job.initiated_by_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{job.total_employees}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress 
                          value={(job.successful_courses / job.total_employees) * 100} 
                          className="w-20 h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {job.successful_courses}/{job.total_employees}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDuration(job.duration_seconds || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'cancelled' ? 'secondary' :
                        'destructive'
                      }>
                        {job.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {job.status === 'failed' && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewDetails(job.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => exportJobReport(job)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generation Job Details</DialogTitle>
            <DialogDescription>
              Job ID: {selectedJob?.job.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Job Summary */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Initiated By</p>
                    <p className="font-medium">{selectedJob.job.initiated_by_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedJob.job.created_at), 'PPp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {formatDuration(selectedJob.job.duration_seconds || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-medium">
                      {Math.round((selectedJob.job.successful_courses / selectedJob.job.total_employees) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Employee List */}
                <div>
                  <h4 className="font-medium mb-2">Employees ({selectedJob.employees.length})</h4>
                  <div className="space-y-2">
                    {selectedJob.employees.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {emp.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                        <Badge variant={emp.status === 'completed' ? 'default' : 'destructive'}>
                          {emp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {selectedJob.job.error_message && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {selectedJob.job.error_message}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};