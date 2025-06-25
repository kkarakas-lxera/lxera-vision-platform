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
  [key: string]: any; // Add index signature for Json compatibility
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
  status: string; // Change to string to match database
  priority_level: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  total_word_count?: number;
  module_spec?: any; // Change to any for Json compatibility
  assigned_to?: string;
}

export class ContentManager {
  private companyId: string | null;
  private userId: string;
  private isSuperAdmin: boolean;

  constructor(companyId: string | null, userId: string, isSuperAdmin: boolean = false) {
    this.companyId = companyId;
    this.userId = userId;
    this.isSuperAdmin = isSuperAdmin;
  }

  async get_analytics() {
    try {
      let query = supabase
        .from('cm_module_content')
        .select('*');
      
      if (!this.isSuperAdmin && this.companyId) {
        query = query.eq('company_id', this.companyId);
      }
      
      const { data, error } = await query;

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
      let modulesQuery = supabase
        .from('cm_module_content')
        .select('*');
      
      if (!this.isSuperAdmin && this.companyId) {
        modulesQuery = modulesQuery.eq('company_id', this.companyId);
      }
      
      const { data: modules } = await modulesQuery;

      // Fetch quality assessments
      let qualityQuery = supabase
        .from('cm_quality_assessments')
        .select('*');
      
      if (!this.isSuperAdmin && this.companyId) {
        qualityQuery = qualityQuery.eq('company_id', this.companyId);
      }
      
      const { data: quality } = await qualityQuery;

      // Fetch enhancement sessions
      let enhancementsQuery = supabase
        .from('cm_enhancement_sessions')
        .select('*');
      
      if (!this.isSuperAdmin && this.companyId) {
        enhancementsQuery = enhancementsQuery.eq('company_id', this.companyId);
      }
      
      const { data: enhancements } = await enhancementsQuery;

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
      let query = supabase
        .from('course_assignments')
        .select(`
          *,
          employees!inner(id, user_id, department, position)
        `);
      
      if (!this.isSuperAdmin && this.companyId) {
        query = query.eq('company_id', this.companyId);
      }

      if (employeeId) {
        query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch module content separately to avoid join issues
      const assignmentsWithModules = await Promise.all(
        (data || []).map(async (assignment) => {
          const { data: moduleData } = await supabase
            .from('cm_module_content')
            .select('module_name, status')
            .eq('content_id', assignment.course_id)
            .single();

          return {
            ...assignment,
            cm_module_content: moduleData
          };
        })
      );

      return assignmentsWithModules;
    } catch (error) {
      console.error('Error fetching employee progress:', error);
      throw error;
    }
  }

  async get_department_analytics() {
    try {
      let query = supabase
        .from('employees')
        .select(`
          department,
          courses_completed,
          total_learning_hours,
          last_activity
        `)
        .eq('is_active', true);
      
      if (!this.isSuperAdmin && this.companyId) {
        query = query.eq('company_id', this.companyId);
      }
      
      const { data: employees } = await query;

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
      let query = supabase
        .from('cm_module_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!this.isSuperAdmin && this.companyId) {
        query = query.eq('company_id', this.companyId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as ModuleContent[];
    } catch (error) {
      console.error('Error listing modules:', error);
      throw error;
    }
  }

  async create_module_content(moduleSpec: ModuleSpec): Promise<ModuleContent> {
    try {
      if (!this.companyId && !this.isSuperAdmin) {
        throw new Error('Company ID is required to create module content');
      }
      
      const newModule = {
        company_id: this.companyId!,
        module_name: moduleSpec.module_name,
        employee_name: moduleSpec.employee_name,
        session_id: `session_${Date.now()}`,
        status: 'draft' as const,
        priority_level: moduleSpec.priority_level,
        created_by: this.userId,
        module_spec: moduleSpec as any, // Cast to any for Json compatibility
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
      return data as unknown as ModuleContent;
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
      return data as unknown as ModuleContent;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }
}

export const useContentManager = () => {
  const { userProfile } = useAuth();

  const contentManager = useMemo(() => {
    if (!userProfile?.id) {
      return null;
    }
    
    const isSuperAdmin = userProfile.role === 'super_admin';
    const companyId = userProfile.company_id || null;
    
    return new ContentManager(companyId, userProfile.id, isSuperAdmin);
  }, [userProfile?.company_id, userProfile?.id, userProfile?.role]);

  if (!contentManager) {
    throw new Error('ContentManager not initialized. User must be authenticated.');
  }

  return contentManager;
};
