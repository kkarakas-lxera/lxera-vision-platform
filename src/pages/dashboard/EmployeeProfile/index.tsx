import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Mail,
  Building,
  Briefcase,
  Calendar,
  RefreshCw,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmployeeProfileHeader } from './components/EmployeeProfileHeader';
import { CareerPathSection } from './components/CareerPathSection';
import { SkillsProfileSection } from './components/SkillsProfileSection';
import { LearningSection } from './components/LearningSection';
import { SkillsGapSection } from './components/SkillsGapSection';
import { ActionsBar } from './components/ActionsBar';

interface EmployeeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  department: string;
  position: string;
  current_position_id?: string;
  target_position_id?: string;
  current_position_title?: string;
  target_position_title?: string;
  is_active: boolean;
  cv_file_path?: string;
  employee_since: string;
  skills_profile?: {
    id: string;
    skills_match_score: number;
    career_readiness_score: number;
    analyzed_at: string;
    extracted_skills: Array<{
      skill_id: string;
      skill_name: string;
      proficiency_level: number;
      skill_type?: string;
      category?: string;
      years_experience?: number;
    }>;
    experience_years?: number;
    education_level?: string;
    certifications?: any[];
    languages?: any[];
    cv_summary?: string;
  };
  courses?: Array<{
    id: string;
    course_id: string;
    course_title: string;
    status: string;
    progress_percentage: number;
    assigned_at: string;
    due_date?: string;
    completed_at?: string;
    quiz_score?: number;
  }>;
}

export default function EmployeeProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (employeeId && userProfile?.company_id) {
      fetchEmployeeData();
    }
  }, [employeeId, userProfile]);

  const fetchEmployeeData = async () => {
    if (!employeeId || !userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employee basic data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          department,
          position,
          is_active,
          cv_file_path,
          current_position_id,
          target_position_id,
          created_at,
          users!inner(
            full_name,
            email,
            avatar_url
          ),
          current_position:st_company_positions!employees_current_position_id_fkey(
            position_title
          ),
          target_position:st_company_positions!employees_target_position_id_fkey(
            position_title
          )
        `)
        .eq('id', employeeId)
        .eq('company_id', userProfile.company_id)
        .single();

      if (employeeError) throw employeeError;

      // Fetch skills profile separately
      const { data: skillsProfile } = await supabase
        .from('st_employee_skills_profile')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      // Fetch course assignments
      const { data: courseAssignments } = await supabase
        .from('course_assignments')
        .select(`
          *,
          courses!inner(
            title,
            description
          )
        `)
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false });

      // Transform the data
      const transformedEmployee: EmployeeProfile = {
        id: employeeData.id,
        user_id: employeeData.user_id,
        full_name: employeeData.users.full_name,
        email: employeeData.users.email,
        avatar_url: employeeData.users.avatar_url,
        department: employeeData.department || 'Not assigned',
        position: employeeData.position || 'Not assigned',
        current_position_id: employeeData.current_position_id,
        target_position_id: employeeData.target_position_id,
        current_position_title: employeeData.current_position?.position_title,
        target_position_title: employeeData.target_position?.position_title,
        is_active: employeeData.is_active,
        cv_file_path: employeeData.cv_file_path,
        employee_since: employeeData.created_at,
        skills_profile: skillsProfile ? {
          ...skillsProfile,
          extracted_skills: Array.isArray(skillsProfile.extracted_skills) 
            ? skillsProfile.extracted_skills 
            : []
        } : undefined,
        courses: courseAssignments?.map(ca => ({
          id: ca.id,
          course_id: ca.course_id,
          course_title: ca.courses.title,
          status: ca.status,
          progress_percentage: ca.progress_percentage || 0,
          assigned_at: ca.assigned_at,
          due_date: ca.due_date,
          completed_at: ca.completed_at,
          quiz_score: ca.quiz_score
        }))
      };

      setEmployee(transformedEmployee);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    setRefreshing(true);
    // TODO: Implement CV re-analysis
    toast.info('CV re-analysis feature coming soon');
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Employee not found</h2>
          <p className="text-muted-foreground mb-4">
            The employee you're looking for doesn't exist or you don't have access to view their profile.
          </p>
          <Button onClick={() => navigate('/dashboard/employees')}>
            Back to Employees
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard/employees')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Button>

      {/* Employee Header */}
      <EmployeeProfileHeader employee={employee} />

      {/* Career Path Section */}
      <CareerPathSection employee={employee} />

      {/* Skills Profile Section */}
      <SkillsProfileSection 
        employee={employee}
        onRefresh={handleRefreshAnalysis}
        refreshing={refreshing}
      />

      {/* Learning & Development Section */}
      <LearningSection employee={employee} />

      {/* Skills Gap Analysis Section */}
      <SkillsGapSection employee={employee} />

      {/* Actions Bar */}
      <ActionsBar employee={employee} />
    </div>
  );
}