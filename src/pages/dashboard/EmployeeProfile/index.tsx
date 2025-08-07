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
  current_position_requirements?: {
    required_skills?: Array<{
      skill_id: string;
      skill_name: string;
      is_mandatory: boolean;
      proficiency_level: number;
    }>;
    nice_to_have_skills?: Array<{
      skill_id: string;
      skill_name: string;
      proficiency_level: number;
    }>;
    description?: string;
  };
  target_position_requirements?: {
    required_skills?: Array<{
      skill_id: string;
      skill_name: string;
      is_mandatory: boolean;
      proficiency_level: number;
    }>;
    nice_to_have_skills?: Array<{
      skill_id: string;
      skill_name: string;
      proficiency_level: number;
    }>;
    description?: string;
  };
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
    strongest?: {
      name: string;
      score: number;
    } | null;
    weakest?: {
      name: string;
      score: number;
    } | null;
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
            position_title,
            required_skills,
            nice_to_have_skills,
            description
          ),
          target_position:st_company_positions!employees_target_position_id_fkey(
            position_title,
            required_skills,
            nice_to_have_skills,
            description
          )
        `)
        .eq('id', employeeId)
        .eq('company_id', userProfile.company_id)
        .single();

      if (employeeError) throw employeeError;

      // Fetch skills data from unified employee_skills table
      const { data: employeeSkills } = await supabase
        .from('employee_skills')
        .select('*')
        .eq('employee_id', employeeId);

      // Create skills profile compatible structure
      const skillsProfile = {
        employee_id: employeeId,
        // Only include CV-sourced skills in extracted_skills
        extracted_skills: employeeSkills?.filter(skill => skill.source === 'cv').map(skill => ({
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency, // Already 0-3
          source: skill.source,
          confidence: skill.confidence || 1.0
        })) || [],
        skills_match_score: employee?.cv_analysis_data?.skills_match_score || 0,
        career_readiness_score: employee?.cv_analysis_data?.career_readiness_score || 0
      };

      // Fetch profile sections - try multiple approaches
      let profileSections = null;
      let profileSectionsError = null;
      
      // Try with order by
      const result1 = await supabase
        .from('employee_profile_sections')
        .select('*')
        .eq('employee_id', employeeId)
        .order('section_name', { ascending: true });
      
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
        if (section.data) {
          acc[section.section_name] = section.data;
        }
        return acc;
      }, {});

      // Use the same employee skills data for verification info
      // Fetch skill assessment history for detailed assessment data
      const { data: assessmentHistory } = await supabase
        .from('skill_assessment_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assessment_date', { ascending: false });

      // Create a map of skill assessments for easy lookup
      const assessmentMap = new Map();
      assessmentHistory?.forEach(assessment => {
        const key = assessment.skill_name.toLowerCase();
        if (!assessmentMap.has(key) || new Date(assessment.assessment_date) > new Date(assessmentMap.get(key).assessment_date)) {
          assessmentMap.set(key, assessment);
        }
      });

      const verifiedSkills = employeeSkills?.map(skill => {
        const assessment = assessmentMap.get(skill.skill_name.toLowerCase());
        return {
          id: skill.id,
          employee_id: skill.employee_id,
          skill_name: skill.skill_name,
          skill_id: skill.skill_id,
          proficiency_level: skill.proficiency, // Already 0-3
          is_from_cv: skill.source === 'cv',
          is_from_position: skill.source === 'position_requirement',
          verification_score: assessment?.context?.verification_score !== undefined 
            ? assessment.context.verification_score 
            : (skill.confidence !== undefined ? skill.confidence : 1.0),
          questions_asked: assessment?.questions || [],
          responses: assessment?.responses || [],
          time_taken: assessment?.time_taken,
          assessment_date: assessment?.assessment_date,
          verified_at: skill.source === 'verified' ? skill.updated_at : assessment?.assessment_date || null,
          created_at: skill.created_at
        };
      }) || [];
      
      const skillsValidationError = null; // No error since we're using the same data


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


      // Calculate assessed and verified skills stats
      const assessedSkills = verifiedSkills || [];
      const assessedWithScore = assessedSkills.filter((s: any) => {
        const score = s.verification_score as number | string | null;
        return score !== null && score !== undefined && Number(score) > 0;
      });
      const verifiedSkillsList = assessedSkills.filter((s: any) => {
        const score = s.verification_score as number | string | null;
        return score !== null && score !== undefined && Number(score) >= 0.8; // 80% or higher
      });
      
      // Find strongest and weakest skills (from those with scores > 0)
      let strongestSkill = null;
      let weakestSkill = null;
      
      if (assessedWithScore.length > 0) {
        const sortedByScore = [...assessedWithScore].sort((a: any, b: any) => 
          Number(b.verification_score) - Number(a.verification_score)
        );
        strongestSkill = {
          name: sortedByScore[0].skill_name,
          score: Math.round(Number(sortedByScore[0].verification_score) * 100)
        };
        weakestSkill = {
          name: sortedByScore[sortedByScore.length - 1].skill_name,
          score: Math.round(Number(sortedByScore[sortedByScore.length - 1].verification_score) * 100)
        };
      }
      
      const verifiedSkillsStats = {
        assessed: assessedSkills.length,  // Total assessed (including 0 scores)
        withScore: assessedWithScore.length, // Assessed with score > 0
        verified: verifiedSkillsList.length, // Verified (score >= 80%)
        total: assessedSkills.length,
        avgScore: assessedWithScore.length > 0 
          ? Math.round(assessedWithScore.reduce((acc: number, s: any) => 
              acc + (Number(s.verification_score) * 100), 0) / assessedWithScore.length)
          : 0,
        strongest: strongestSkill,
        weakest: weakestSkill
      };


      // Use validation data directly
      const skillsAsVerificationData = verifiedSkills || [];

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
        current_position_requirements: employeeData.current_position ? {
          required_skills: employeeData.current_position.required_skills as Array<{
            skill_id: string;
            skill_name: string;
            is_mandatory: boolean;
            proficiency_level: number;
          }> || [],
          nice_to_have_skills: employeeData.current_position.nice_to_have_skills as Array<{
            skill_id: string;
            skill_name: string;
            proficiency_level: number;
          }> || [],
          description: employeeData.current_position.description
        } : undefined,
        target_position_requirements: employeeData.target_position ? {
          required_skills: employeeData.target_position.required_skills as Array<{
            skill_id: string;
            skill_name: string;
            is_mandatory: boolean;
            proficiency_level: number;
          }> || [],
          nice_to_have_skills: employeeData.target_position.nice_to_have_skills as Array<{
            skill_id: string;
            skill_name: string;
            proficiency_level: number;
          }> || [],
          description: employeeData.target_position.description
        } : undefined,
        is_active: employeeData.is_active,
        cv_file_path: employeeData.cv_file_path,
        employee_since: employeeData.created_at,
        profile_data: profileDataFromSections,
        profileCompletion: {
          completed: completedSections,
          total: totalSections
        },
        profileSections: mainProfileSections.map((section: any) => {
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