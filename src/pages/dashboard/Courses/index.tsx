
import React, { useState, useEffect } from 'react';
import { EmployeeCourseAssignments } from '@/components/admin/CourseManagement/EmployeeCourseAssignments';
import { CourseGenerationSection } from '@/components/admin/CourseManagement/CourseGenerationSection';
import { GenerationHistoryTable } from '@/components/admin/CourseManagement/GenerationHistoryTable';
import { CourseOutlineApproval } from '@/components/admin/CourseManagement/CourseOutlineApproval';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  badge?: string | null;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, count, badge }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-1 py-2 font-medium text-sm border-b-2 transition-colors",
        active
          ? "text-foreground border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground"
      )}
    >
      <span className="flex items-center gap-2">
        {children}
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {count}
          </Badge>
        )}
        {badge && (
          <Badge variant="default" className="h-5 px-1.5 text-xs">
            {badge}
          </Badge>
        )}
      </span>
    </button>
  );
};

const CoursesPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'generate' | 'approvals' | 'history'>('assignments');
  const [activeAssignmentsCount, setActiveAssignmentsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const companyId = userProfile?.company_id;

  useEffect(() => {
    if (!companyId) return;

    // Fetch active assignments count
    const fetchCounts = async () => {
      // Get active assignments count
      const { count: assignmentsCount } = await supabase
        .from('course_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .in('status', ['assigned', 'in_progress']);
      
      setActiveAssignmentsCount(assignmentsCount || 0);

      // Get active jobs count
      const { count: jobsCount } = await supabase
        .from('course_generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .in('status', ['pending', 'processing']);
      
      setActiveJobsCount(jobsCount || 0);

      // Get pending approvals count
      const { data: companyEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId);
      
      const employeeIds = companyEmployees?.map(e => e.id) || [];
      
      if (employeeIds.length > 0) {
        const { count: approvalsCount } = await supabase
          .from('cm_course_plans')
          .select('*', { count: 'exact', head: true })
          .in('employee_id', employeeIds)
          .eq('status', 'completed')
          .eq('is_preview_mode', true)
          .eq('approval_status', 'pending_review');
        
        setPendingApprovalsCount(approvalsCount || 0);
      }
    };

    fetchCounts();

    // Subscribe to realtime updates for counts
    const channel = supabase
      .channel('course-counts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_assignments',
        filter: `company_id=eq.${companyId}`
      }, () => fetchCounts())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_generation_jobs',
        filter: `company_id=eq.${companyId}`
      }, () => fetchCounts())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cm_course_plans'
      }, () => fetchCounts())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [companyId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Course Management</h1>
        <p className="text-muted-foreground">
          Manage training programs, generate AI courses, and track learning progress
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <TabButton
            active={activeTab === 'assignments'}
            onClick={() => setActiveTab('assignments')}
            count={activeAssignmentsCount}
          >
            Active Training
          </TabButton>
          
          <TabButton
            active={activeTab === 'generate'}
            onClick={() => setActiveTab('generate')}
            badge={activeJobsCount > 0 ? `${activeJobsCount} running` : null}
          >
            Generate Courses
          </TabButton>

          <TabButton
            active={activeTab === 'approvals'}
            onClick={() => setActiveTab('approvals')}
            count={pendingApprovalsCount}
          >
            Course Approvals
          </TabButton>
          
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            Generation History
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'assignments' && <EmployeeCourseAssignments />}
        {activeTab === 'generate' && <CourseGenerationSection />}
        {activeTab === 'approvals' && <CourseOutlineApproval />}
        {activeTab === 'history' && <GenerationHistoryTable />}
      </div>
    </div>
  );
};

export default CoursesPage;
