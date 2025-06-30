
import { supabase } from '@/integrations/supabase/client';

export interface GenerationProgress {
  phase: string;
  employee: string;
  progress: number;
  completed: boolean;
  error?: string;
}

export interface CourseGenerationResult {
  success: boolean;
  courseId?: string;
  planId?: string;
  error?: string;
}

export class CourseGenerationPipeline {
  private jobId: string;
  private companyId: string;
  private employeeIds: string[];
  private onProgress?: (progress: GenerationProgress) => void;

  constructor(
    jobId: string,
    companyId: string,
    employeeIds: string[],
    onProgress?: (progress: GenerationProgress) => void
  ) {
    this.jobId = jobId;
    this.companyId = companyId;
    this.employeeIds = employeeIds;
    this.onProgress = onProgress;
  }

  async execute(): Promise<CourseGenerationResult[]> {
    const results: CourseGenerationResult[] = [];

    try {
      // Update job status to processing
      await this.updateJobStatus('processing', 0);

      for (let i = 0; i < this.employeeIds.length; i++) {
        const employeeId = this.employeeIds[i];
        const progress = Math.round(((i + 1) / this.employeeIds.length) * 100);

        try {
          // Get employee details
          const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('*, users!inner(full_name)')
            .eq('id', employeeId)
            .single();

          if (employeeError) throw employeeError;

          const employeeName = employee.users?.full_name || 'Unknown Employee';

          // Update progress
          await this.updateJobStatus('processing', progress, employeeName, 'Generating course plan');
          
          this.onProgress?.({
            phase: 'Planning',
            employee: employeeName,
            progress,
            completed: false
          });

          // Generate course for this employee
          const result = await this.generateCourseForEmployee(employeeId, employeeName);
          results.push(result);

          // Update job progress
          await this.updateJobProgress(i + 1, result.success ? 1 : 0, result.error ? 1 : 0);

        } catch (error: any) {
          console.error(`Error generating course for employee ${employeeId}:`, error);
          results.push({
            success: false,
            error: error.message
          });

          await this.updateJobProgress(i + 1, 0, 1);
        }
      }

      // Mark job as completed
      await this.updateJobStatus('completed', 100);

      return results;

    } catch (error: any) {
      console.error('Course generation pipeline error:', error);
      await this.updateJobStatus('failed', 0, undefined, undefined, error.message);
      throw error;
    }
  }

  private async generateCourseForEmployee(employeeId: string, employeeName: string): Promise<CourseGenerationResult> {
    try {
      // This would integrate with the actual course generation API
      // For now, we'll create a placeholder course plan
      
      const { data: coursePlan, error } = await supabase
        .from('cm_course_plans')
        .insert({
          employee_id: employeeId,
          employee_name: employeeName,
          session_id: `gen-${this.jobId}-${employeeId}`,
          course_title: `Personalized Course for ${employeeName}`,
          course_structure: {
            modules: [
              {
                id: 'M01',
                name: 'Introduction Module',
                duration: '1 week'
              }
            ]
          },
          prioritized_gaps: [],
          research_strategy: { queries: [] },
          learning_path: { path: [] },
          employee_profile: {},
          total_modules: 1,
          course_duration_weeks: 4
        })
        .select()
        .single();

      if (error) throw error;

      // Create course assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('course_assignments')
        .insert({
          employee_id: employeeId,
          course_id: coursePlan.plan_id,
          plan_id: coursePlan.plan_id,
          company_id: this.companyId,
          total_modules: 1,
          status: 'assigned'
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      return {
        success: true,
        courseId: assignment.id,
        planId: coursePlan.plan_id
      };

    } catch (error: any) {
      console.error('Error generating course for employee:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async updateJobStatus(
    status: string,
    progress: number,
    currentEmployee?: string,
    currentPhase?: string,
    errorMessage?: string
  ) {
    const updates: any = {
      status,
      progress_percentage: progress,
      updated_at: new Date().toISOString()
    };

    if (currentEmployee) updates.current_employee_name = currentEmployee;
    if (currentPhase) updates.current_phase = currentPhase;
    if (errorMessage) updates.error_message = errorMessage;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    await supabase
      .from('course_generation_jobs')
      .update(updates)
      .eq('id', this.jobId);
  }

  private async updateJobProgress(processed: number, successful: number, failed: number) {
    await supabase
      .from('course_generation_jobs')
      .update({
        processed_employees: processed,
        successful_courses: successful,
        failed_courses: failed,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.jobId);
  }
}
