
import { supabase } from '@/integrations/supabase/client';

export interface CourseGenerationParams {
  courseTitle: string;
  courseDescription: string;
  targetAudience: string;
  learningObjectives: string;
  estimatedDuration: string;
  additionalNotes?: string;
  employeeId: string;
  companyId: string;
}

export const generateCourse = async (params: CourseGenerationParams) => {
  try {
    // Create a course generation job
    const { data, error } = await supabase
      .from('course_generation_jobs')
      .insert([
        {
          company_id: params.companyId,
          initiated_by: params.employeeId,
          total_employees: 1,
          employee_ids: [params.employeeId],
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, jobId: data.id };
  } catch (error) {
    console.error('Error generating course:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};
