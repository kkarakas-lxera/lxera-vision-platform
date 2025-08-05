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
import { ProfileJourneySection } from './components/ProfileJourneySection';
import { SkillsProfileSection } from './components/SkillsProfileSection';
import { ExperienceSection } from './components/ExperienceSection';
import { DevelopmentSection } from './components/DevelopmentSection';

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
  profile_data?: any;
  profileCompletion?: {
    completed: number;
    total: number;
  };
  profileSections?: any[];
  verifiedSkills?: {
    count: number;
    total: number;
    avgScore: number;
  };
  verifiedSkillsRaw?: any[];
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

      // Fetch profile sections - try multiple approaches
      let profileSections = null;
      let profileSectionsError = null;
      
      // Try with order by
      const result1 = await supabase
        .from('employee_profile_sections')
        .select('*')
        .eq('employee_id', employeeId)
        .order('section_order', { ascending: true });
      
      if (result1.error) {
        console.error('Profile sections query error (with order):', result1.error);
        
        // Try without order by
        const result2 = await supabase
          .from('employee_profile_sections')
          .select('*')
          .eq('employee_id', employeeId);
          
        if (result2.error) {
          console.error('Profile sections query error (no order):', result2.error);
          profileSectionsError = result2.error;
        } else {
          profileSections = result2.data;
          console.log('Profile sections found without order by:', result2.data?.length);
        }
      } else {
        profileSections = result1.data;
        console.log('Profile sections found with order by:', result1.data?.length);
      }

      // Fetch profile data from sections (not from employees.profile_data which is null)
      const profileDataFromSections = profileSections?.reduce((acc: any, section: any) => {
        if (section.section_data) {
          acc[section.section_name] = section.section_data;
        }
        return acc;
      }, {});

      // Fetch skills verification data
      const { data: verifiedSkills, error: skillsValidationError } = await supabase
        .from('employee_skills_validation')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (skillsValidationError) {
        console.error('Skills validation query error:', skillsValidationError);
      }

      // Debug logging
      console.log('=== PROFILE DEBUG DATA ===');
      console.log('Employee ID:', employeeId);
      console.log('Profile Sections:', profileSections);
      console.log('Profile Data From Sections:', profileDataFromSections);
      console.log('Verified Skills:', verifiedSkills);
      console.log('Skills Profile:', skillsProfile);

      // Fetch course assignments
      const { data: courseAssignments } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      // Fetch course plans for the assignments
      const coursePlansMap = new Map();
      if (courseAssignments && courseAssignments.length > 0) {
        const planIds = [...new Set(courseAssignments.map(a => a.plan_id).filter(Boolean))];
        if (planIds.length > 0) {
          const { data: plansData } = await supabase
            .from('cm_course_plans')
            .select('*')
            .in('plan_id', planIds);
            
          if (plansData) {
            plansData.forEach(plan => {
              coursePlansMap.set(plan.plan_id, plan);
            });
          }
        }
      }
      
      // Fetch module content for the assignments
      const moduleContentMap = new Map();
      if (courseAssignments && courseAssignments.length > 0) {
        const courseIds = [...new Set(courseAssignments.map(a => a.course_id).filter(Boolean))];
        if (courseIds.length > 0) {
          const { data: contentData } = await supabase
            .from('cm_module_content')
            .select('content_id, module_name')
            .in('content_id', courseIds);
            
          if (contentData) {
            contentData.forEach(content => {
              moduleContentMap.set(content.content_id, content);
            });
          }
        }
      }

      // Calculate profile completion - use actual completed sections from database
      const mainProfileSections = profileSections?.filter(s => 
        !['certifications', 'languages', 'profile_builder_state'].includes(s.section_name)
      ) || [];
      const completedSections = mainProfileSections.filter(s => s.is_complete).length;
      const totalSections = Math.max(mainProfileSections.length, 7); // At least 7 for the standard profile

      console.log('=== PROFILE COMPLETION DEBUG ===');
      console.log('All Profile Sections:', profileSections?.map(s => ({ name: s.section_name, complete: s.is_complete })));
      console.log('Main Profile Sections:', mainProfileSections.map(s => ({ name: s.section_name, complete: s.is_complete })));
      console.log('Completed Sections:', completedSections);
      console.log('Total Sections:', totalSections);

      // Calculate verified skills stats - use skills profile data since validation table has all zeros
      // Include all skills with valid proficiency levels (0-3 scale: 0=None, 1=Learning, 2=Using, 3=Expert)
      const skillsWithProficiency = skillsProfile?.extracted_skills?.filter((s: any) => 
        s.proficiency_level !== null && s.proficiency_level !== undefined
      ) || [];
      const verifiedSkillsStats = {
        count: skillsWithProficiency.length,
        total: skillsProfile?.extracted_skills?.length || 0,
        avgScore: skillsWithProficiency.length > 0 
          ? Math.round(skillsWithProficiency.reduce((acc: number, s: any) => acc + ((s.proficiency_level || 0) * 33.33), 0) / skillsWithProficiency.length) // Convert 0-3 scale to percentage
          : 0
      };

      console.log('=== SKILLS VERIFICATION DEBUG ===');
      console.log('Raw Verified Skills (validation table):', verifiedSkills?.map(v => ({ 
        skill: v.skill_name, 
        score: v.verification_score,
        hasScore: (v.verification_score || 0) > 0 
      })));
      console.log('All Extracted Skills:', skillsProfile?.extracted_skills?.map((s, index) => {
        console.log(`Skill ${index}:`, s); // Log full object structure
        return {
          skill: s.skill_name,
          proficiency: s.proficiency_level,
          hasLevel: (s.proficiency_level || 0) > 0,
          allFields: Object.keys(s)
        };
      }));
      console.log('Skills With Proficiency (profile table):', skillsWithProficiency.map(s => ({
        skill: s.skill_name,
        proficiency: s.proficiency_level,
        percentage: Math.round(s.proficiency_level * 33.33) // 0-3 scale to percentage
      })));
      console.log('Verified Skills With Score:', skillsWithProficiency.length);
      console.log('Skills Profile Extracted:', skillsProfile?.extracted_skills?.length);
      console.log('Verification Stats:', verifiedSkillsStats);

      // Use skills profile data for verification since validation table has all zeros
      const skillsAsVerificationData = (Array.isArray(skillsProfile?.extracted_skills) ? skillsProfile.extracted_skills : []).map((skill: any) => ({
        skill_name: skill.skill_name,
        verification_score: (skill.proficiency_level || 0) / 3, // Convert 0-3 scale to 0-1 scale
        proficiency_level: skill.proficiency_level,
        is_from_cv: true,
        created_at: skillsProfile.analyzed_at
      })) || [];

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
        profile_data: profileDataFromSections,
        profileCompletion: {
          completed: completedSections,
          total: totalSections
        },
        profileSections: mainProfileSections.map(section => {
          const displayNameMap: Record<string, string> = {
            'cv_upload': 'Upload Your CV',
            'work_experience': 'Work Experience',
            'education': 'Education Background',
            'skills': 'Skills Review',
            'current_work': 'Current Projects',
            'daily_tasks': 'Professional Challenges', 
            'tools_technologies': 'Growth Opportunities',
            'profile_verification': 'Profile Verification'
          };
          
          return {
            name: section.section_name,
            displayName: displayNameMap[section.section_name] || section.section_name.split('_').map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            isComplete: section.is_complete,
            completedAt: section.completed_at,
            summary: section.section_data?.summary
          };
        }),
        verifiedSkills: verifiedSkillsStats,
        verifiedSkillsRaw: skillsAsVerificationData,
        skills_profile: skillsProfile ? {
          id: skillsProfile.id,
          skills_match_score: skillsProfile.skills_match_score,
          career_readiness_score: skillsProfile.career_readiness_score,
          analyzed_at: skillsProfile.analyzed_at,
          extracted_skills: Array.isArray(skillsProfile.extracted_skills) 
            ? (skillsProfile.extracted_skills as any[])
            : [],
          cv_summary: skillsProfile.cv_summary
        } : undefined,
        courses: courseAssignments?.map(ca => {
          const coursePlan = ca.plan_id ? coursePlansMap.get(ca.plan_id) : null;
          const moduleContent = ca.course_id ? moduleContentMap.get(ca.course_id) : null;
          const courseTitle = coursePlan?.course_title || moduleContent?.module_name || 'Course';
          
          return {
            id: ca.id,
            course_id: ca.course_id,
            course_title: courseTitle,
            status: ca.status,
            progress_percentage: ca.progress_percentage || 0,
            assigned_at: ca.created_at,
            due_date: ca.due_date,
            completed_at: ca.completed_at,
            quiz_score: ca.quiz_score
          };
        })
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

      {/* Profile Journey Section */}
      <ProfileJourneySection 
        sections={employee.profileSections || []}
        lastUpdated={employee.profileSections?.find(s => s.isComplete)?.completedAt}
      />

      {/* Skills Profile Section */}
      <SkillsProfileSection 
        employee={employee}
        onRefresh={handleRefreshAnalysis}
        refreshing={refreshing}
      />

      {/* Experience Section */}
      <ExperienceSection employee={employee} />

      {/* Development & Growth Section */}
      <DevelopmentSection employee={employee} />
    </div>
  );
}