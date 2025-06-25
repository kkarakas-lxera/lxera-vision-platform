import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useMemo } from 'react';

export interface ModuleSpec {
  module_name: string;
  employee_name: string;
  current_role: string;
  career_goal: string;
  key_tools: string[];
  personalization_level: 'basic' | 'standard' | 'advanced';
  priority_level: 'low' | 'medium' | 'high';
}

export interface ModuleContent {
  content_id: string;
  company_id: string;
  module_name: string;
  employee_name: string;
  session_id?: string;
  introduction?: string;
  core_content?: string;
  practical_applications?: string;
  case_studies?: string;
  assessments?: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  priority_level: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  total_word_count?: number;
  module_spec?: ModuleSpec;
  assigned_to?: string;
}

export class ContentManager {
  private companyId: string;
  private userId: string;

  constructor(companyId: string, userId: string) {
    this.companyId = companyId;
    this.userId = userId;
  }

  async get_analytics() {
    try {
      const { data, error } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('company_id', this.companyId);

      if (error) throw error;

      const totalModules = data?.length || 0;
      const publishedModules = data?.filter(m => m.status === 'published').length || 0;
      const totalWordCount = data?.reduce((sum, m) => sum + (m.total_word_count || 0), 0) || 0;
      const avgWordCount = totalModules > 0 ? Math.round(totalWordCount / totalModules) : 0;

      return {
        total_modules: totalModules,
        published_modules: publishedModules,
        total_word_count: totalWordCount,
        avg_word_count: avgWordCount
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async get_company_analytics() {
    try {
      // Fetch modules
      const { data: modules } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('company_id', this.companyId);

      // Fetch quality assessments
      const { data: quality } = await supabase
        .from('cm_quality_assessments')
        .select('*')
        .eq('company_id', this.companyId);

      // Fetch enhancement sessions
      const { data: enhancements } = await supabase
        .from('cm_enhancement_sessions')
        .select('*')
        .eq('company_id', this.companyId);

      return {
        modules: modules || [],
        quality: quality || [],
        enhancements: enhancements || []
      };
    } catch (error) {
      console.error('Error fetching company analytics:', error);
      throw error;
    }
  }

  async get_employee_progress(employeeId?: string) {
    try {
      const query = supabase
        .from('course_assignments')
        .select(`
          *,
          employees!inner(id, user_id, department, position),
          cm_module_content!inner(module_name, status)
        `)
        .eq('company_id', this.companyId);

      if (employeeId) {
        query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching employee progress:', error);
      throw error;
    }
  }

  async get_department_analytics() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select(`
          department,
          courses_completed,
          total_learning_hours,
          last_activity
        `)
        .eq('company_id', this.companyId)
        .eq('is_active', true);

      if (!employees) return {};

      const departmentStats = employees.reduce((acc: Record<string, {
        total_employees: number;
        total_courses_completed: number;
        total_learning_hours: number;
        avg_courses_per_employee: number;
        avg_hours_per_employee: number;
      }>, emp) => {
        const dept = emp.department || 'Unassigned';
        if (!acc[dept]) {
          acc[dept] = {
            total_employees: 0,
            total_courses_completed: 0,
            total_learning_hours: 0,
            avg_courses_per_employee: 0,
            avg_hours_per_employee: 0
          };
        }
        
        acc[dept].total_employees++;
        acc[dept].total_courses_completed += emp.courses_completed || 0;
        acc[dept].total_learning_hours += emp.total_learning_hours || 0;
        
        return acc;
      }, {});

      // Calculate averages
      Object.keys(departmentStats).forEach(dept => {
        const stats = departmentStats[dept];
        stats.avg_courses_per_employee = stats.total_employees > 0 
          ? Math.round((stats.total_courses_completed / stats.total_employees) * 10) / 10 
          : 0;
        stats.avg_hours_per_employee = stats.total_employees > 0 
          ? Math.round((stats.total_learning_hours / stats.total_employees) * 10) / 10 
          : 0;
      });

      return departmentStats;
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      throw error;
    }
  }

  async list_company_modules(): Promise<ModuleContent[]> {
    try {
      const { data, error } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('company_id', this.companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing modules:', error);
      throw error;
    }
  }

  async create_module_content(moduleSpec: ModuleSpec): Promise<ModuleContent> {
    try {
      const newModule = {
        company_id: this.companyId,
        module_name: moduleSpec.module_name,
        employee_name: moduleSpec.employee_name,
        session_id: `session_${Date.now()}`,
        status: 'draft' as const,
        priority_level: moduleSpec.priority_level,
        created_by: this.userId,
        module_spec: moduleSpec,
        introduction: `Introduction for ${moduleSpec.module_name}`,
        core_content: `Core content for ${moduleSpec.module_name}`,
        practical_applications: `Practical applications for ${moduleSpec.module_name}`,
        total_word_count: 1000
      };

      const { data, error } = await supabase
        .from('cm_module_content')
        .insert(newModule)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  async get_module_by_id(contentId: string): Promise<ModuleContent | null> {
    try {
      const { data, error } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', contentId)
        .eq('company_id', this.companyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }
}

export const useContentManager = () => {
  const { userProfile } = useAuth();

  const contentManager = useMemo(() => {
    if (!userProfile?.company_id || !userProfile?.id) {
      return null;
    }
    return new ContentManager(userProfile.company_id, userProfile.id);
  }, [userProfile?.company_id, userProfile?.id]);

  if (!contentManager) {
    throw new Error('ContentManager not initialized. User must be authenticated with a company.');
  }

  return contentManager;
};