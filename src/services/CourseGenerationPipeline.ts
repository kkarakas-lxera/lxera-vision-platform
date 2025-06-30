
import { supabase } from '@/integrations/supabase/client';

export class CourseGenerationPipeline {
  private sessionId: string;
  private companyId: string;
  private employeeName: string;
  private contentId: string;

  constructor(sessionId: string, companyId: string, employeeName: string, contentId: string) {
    this.sessionId = sessionId;
    this.companyId = companyId;
    this.employeeName = employeeName;
    this.contentId = contentId;
  }

  async createMultimediaSession(moduleName: string) {
    try {
      const { data, error } = await supabase
        .from('mm_multimedia_sessions')
        .insert({
          content_id: this.contentId,
          company_id: this.companyId,
          session_type: 'full_generation',
          module_name: moduleName,
          employee_name: this.employeeName,
          content_sections: ['introduction', 'core_content', 'practical_applications'],
          status: 'started',
          total_assets_generated: 0,
          slides_generated: 0,
          audio_files_generated: 0,
          video_files_generated: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating multimedia session:', error);
      throw error;
    }
  }

  async createMultimediaAssets(assets: Array<{
    asset_type: string;
    file_name: string;
    file_path: string;
    file_size: number;
    duration_seconds: number;
  }>) {
    try {
      const assetsWithRequiredFields = assets.map(asset => ({
        session_id: this.sessionId,
        content_id: this.contentId,
        company_id: this.companyId,
        asset_name: asset.file_name,
        asset_type: asset.asset_type,
        file_path: asset.file_path,
        file_size_bytes: asset.file_size,
        duration_seconds: asset.duration_seconds
      }));

      const { data, error } = await supabase
        .from('mm_multimedia_assets')
        .insert(assetsWithRequiredFields);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating multimedia assets:', error);
      throw error;
    }
  }

  async updateCourseGenerationJob(updates: any) {
    try {
      const { data, error } = await supabase
        .from('course_generation_jobs')
        .update(updates)
        .eq('content_id', this.contentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating course generation job:', error);
      throw error;
    }
  }

  async logLlmStep(
    serviceType: string,
    modelUsed: string,
    inputTokens: any,
    outputTokens: any,
    success: boolean = true
  ) {
    try {
      const costEstimate = (inputTokens * 0.0015 + outputTokens * 0.002) / 1000;

      const { data, error } = await supabase
        .from('st_llm_usage_metrics')
        .insert({
          company_id: this.companyId,
          service_type: serviceType,
          model_used: modelUsed,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_estimate: costEstimate,
          success: success
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging LLM step:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in logLlmStep:', error);
      throw error;
    }
  }

  async generateCoursePlan(employeeSkills: string): Promise<string> {
    try {
      const prompt = `Given the following employee skills and experience: ${employeeSkills}, create a personalized course plan with a list of modules and topics tailored to improve their skills.`;
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          max_tokens: 2048,
          model: 'gpt-4'
        }
      });

      if (error) {
        console.error('Error generating course plan:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in generateCoursePlan:', error);
      throw new Error(error.message || 'Failed to generate course plan');
    }
  }

  async researchRelevantContent(coursePlan: string): Promise<string> {
    try {
      const prompt = `Given the following course plan: ${coursePlan}, research and gather relevant content, articles, and resources for each module and topic.`;
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          max_tokens: 2048,
          model: 'gpt-4'
        }
      });

      if (error) {
        console.error('Error researching relevant content:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in researchRelevantContent:', error);
      throw new Error(error.message || 'Failed to research relevant content');
    }
  }

  async generateCourseContent(coursePlan: string): Promise<string> {
    try {
      const prompt = `Given the following course plan: ${coursePlan}, generate detailed course content for each module and topic, including explanations, examples, and exercises.`;
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          max_tokens: 4096,
          model: 'gpt-4'
        }
      });

      if (error) {
        console.error('Error generating course content:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in generateCourseContent:', error);
      throw new Error(error.message || 'Failed to generate course content');
    }
  }

  async enhanceContentQuality(courseContent: string): Promise<string> {
    try {
      const prompt = `Improve the quality, clarity, and engagement of the following course content: ${courseContent}.`;
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: prompt,
          max_tokens: 2048,
          model: 'gpt-4'
        }
      });

      if (error) {
        console.error('Error enhancing content quality:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in enhanceContentQuality:', error);
      throw new Error(error.message || 'Failed to enhance content quality');
    }
  }

  async storeCourseContent(courseContent: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('cm_module_content')
        .update({
          introduction: courseContent,
          core_content: courseContent,
          practical_applications: courseContent,
          case_studies: courseContent,
          assessments: courseContent,
          status: 'completed'
        })
        .eq('content_id', this.contentId)
        .select()
        .single();

      if (error) {
        console.error('Error storing course content:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in storeCourseContent:', error);
      throw new Error(error.message || 'Failed to store course content');
    }
  }

  async createCourseAssignment(employeeId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('course_assignments')
        .insert({
          employee_id: employeeId,
          course_id: this.contentId,
          company_id: this.companyId,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating course assignment:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in createCourseAssignment:', error);
      throw new Error(error.message || 'Failed to create course assignment');
    }
  }

  async generateCoursesForEmployees(employeeIds: string[], assignedById: string) {
    // Implementation for generating courses for multiple employees
    const results = [];
    
    for (const employeeId of employeeIds) {
      try {
        const assignment = await this.createCourseAssignment(employeeId);
        results.push({ employeeId, success: true, assignmentId: assignment.id });
      } catch (error) {
        results.push({ employeeId, success: false, error: error.message });
      }
    }
    
    return results;
  }
}
