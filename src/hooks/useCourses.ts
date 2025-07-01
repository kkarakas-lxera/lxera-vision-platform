import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  instructor: string;
  level: string;
  modules: { module_name: string }[];
  status?: string;
  started_at?: string;
  completed_at?: string;
}

export const useCourses = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      fetchCourses();
    }
  }, [userProfile]);

  const fetchCourses = async () => {
    if (!userProfile) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, get the user's company
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userProfile.id)
        .single();

      if (userError) throw userError;
      if (!userData?.company_id) {
        setError('No company associated with user');
        setLoading(false);
        return;
      }

      // Get employee record
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (employeeError) {
        console.error('Employee error:', employeeError);
        // If no employee record, fetch all company courses
        const { data: companyModules, error: modulesError } = await supabase
          .from('cm_module_content')
          .select(`
            content_id,
            module_name,
            employee_name,
            status,
            created_at,
            module_spec,
            introduction
          `)
          .eq('company_id', userData.company_id)
          .in('status', ['completed', 'draft', 'published', 'approved'])
          .order('created_at', { ascending: false });

        if (modulesError) throw modulesError;

        console.log('Fetched company modules:', companyModules);

        // Transform modules into course format
        const coursesData = (companyModules || []).map((module: any) => {
          const moduleSpec = module.module_spec || {};
          const learningObjectives = moduleSpec.learning_objectives || 
                                   moduleSpec.modules || 
                                   moduleSpec.topics || 
                                   [];
          
          // Extract modules/topics in different formats
          let modulesList = [];
          if (Array.isArray(learningObjectives)) {
            modulesList = learningObjectives.map((obj: any) => ({
              module_name: obj.skill || obj.title || obj.name || obj.topic || 'Module'
            }));
          } else if (moduleSpec.course_structure?.modules) {
            modulesList = moduleSpec.course_structure.modules.map((m: any) => ({
              module_name: m.title || m.name || 'Module'
            }));
          }
          
          return {
            id: module.content_id,
            title: module.module_name,
            description: module.introduction || moduleSpec.overview || moduleSpec.description || 'No description available',
            category: moduleSpec.category || 'General',
            duration: moduleSpec.duration || '4 hours',
            students: Math.floor(Math.random() * 100) + 50, // Mock data for now
            rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating between 3-5
            progress: 0,
            instructor: module.employee_name,
            level: moduleSpec.difficulty || moduleSpec.level || 'Intermediate',
            modules: modulesList.slice(0, 4), // Show max 4 modules
            status: module.status === 'draft' ? 'draft' : 'available',
            started_at: null,
            completed_at: null
          };
        });

        setCourses(coursesData);
        setLoading(false);
        return;
      }

      // If employee exists, get their course assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          progress_percentage,
          status,
          started_at,
          completed_at
        `)
        .eq('employee_id', employee.id)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Get all course modules for the company
      const { data: allModules, error: modulesError } = await supabase
        .from('cm_module_content')
        .select(`
          content_id,
          module_name,
          employee_name,
          status,
          created_at,
          module_spec,
          introduction
        `)
        .eq('company_id', userData.company_id)
        .in('status', ['completed', 'draft', 'published'])
        .order('created_at', { ascending: false });

      if (modulesError) throw modulesError;

      // Create a map of assignments by course_id
      const assignmentMap = new Map(
        (assignments || []).map(a => [a.course_id, a])
      );

      // Transform modules into course format with assignment data
      const coursesData = (allModules || []).map((module: any) => {
        const assignment = assignmentMap.get(module.content_id);
        const moduleSpec = module.module_spec || {};
        const learningObjectives = moduleSpec.learning_objectives || 
                                 moduleSpec.modules || 
                                 moduleSpec.topics || 
                                 [];
        
        // Extract modules/topics in different formats
        let modulesList = [];
        if (Array.isArray(learningObjectives)) {
          modulesList = learningObjectives.map((obj: any) => ({
            module_name: obj.skill || obj.title || obj.name || obj.topic || 'Module'
          }));
        } else if (moduleSpec.course_structure?.modules) {
          modulesList = moduleSpec.course_structure.modules.map((m: any) => ({
            module_name: m.title || m.name || 'Module'
          }));
        }
        
        return {
          id: module.content_id,
          title: module.module_name,
          description: module.introduction || moduleSpec.overview || moduleSpec.description || 'No description available',
          category: moduleSpec.category || 'General',
          duration: moduleSpec.duration || '4 hours',
          students: Math.floor(Math.random() * 100) + 50,
          rating: (Math.random() * 2 + 3).toFixed(1),
          progress: assignment?.progress_percentage || 0,
          instructor: module.employee_name,
          level: moduleSpec.difficulty || moduleSpec.level || 'Intermediate',
          modules: modulesList.slice(0, 4),
          status: assignment?.status || (module.status === 'draft' ? 'draft' : 'available'),
          started_at: assignment?.started_at,
          completed_at: assignment?.completed_at
        };
      });

      setCourses(coursesData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error.message || 'Failed to load courses');
      toast({
        title: 'Error',
        description: 'Failed to load courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
};