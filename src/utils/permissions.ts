import { supabase } from '@/integrations/supabase/client';

export interface CompanyPermissions {
  planType: string;
  maxEmployees: number;
  maxCourses: number;
  isSkillsGapUser: boolean;
  canGenerateCourses: boolean;
  canAccessAdvancedFeatures: boolean;
}

export async function getCompanyPermissions(companyId: string): Promise<CompanyPermissions | null> {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('plan_type, max_employees, max_courses')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company permissions:', error);
      return null;
    }

    const isSkillsGapUser = company.plan_type === 'free_skills_gap';
    
    return {
      planType: company.plan_type,
      maxEmployees: company.max_employees || 10,
      maxCourses: company.max_courses || 0,
      isSkillsGapUser,
      canGenerateCourses: !isSkillsGapUser,
      canAccessAdvancedFeatures: !isSkillsGapUser,
    };
  } catch (error) {
    console.error('Error checking company permissions:', error);
    return null;
  }
}

export async function checkEmployeeLimit(companyId: string): Promise<{ canAdd: boolean; current: number; max: number }> {
  try {
    const [companyResult, employeeResult] = await Promise.all([
      supabase
        .from('companies')
        .select('max_employees')
        .eq('id', companyId)
        .single(),
      supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId)
    ]);

    const maxEmployees = companyResult.data?.max_employees || 10;
    const currentEmployees = employeeResult.data?.length || 0;

    return {
      canAdd: currentEmployees < maxEmployees,
      current: currentEmployees,
      max: maxEmployees
    };
  } catch (error) {
    console.error('Error checking employee limit:', error);
    return { canAdd: false, current: 0, max: 0 };
  }
}