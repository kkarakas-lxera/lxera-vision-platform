
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Clock, Target, User, Calendar } from 'lucide-react';
import ModuleNavigation from './components/ModuleNavigation';
import CourseContentSection from './components/CourseContentSection';
import VideoPlayer from './components/VideoPlayer';

interface CourseData {
  id: string;
  course_id: string;
  plan_id: string;
  progress_percentage: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  course_plan: {
    course_structure: {
      title: string;
      description?: string;
      modules: Array<{
        week: number;
        title: string;
        topics: string[];
        duration: string;
        priority: string;
      }>;
    };
  };
}

interface SectionData {
  section_name: string;
  section_content: string;
  word_count: number;
  section_id?: string;
}

interface Section {
  section_name: string;
  content: string;
  section_id: string;
}

interface Module {
  id: string;
  content_id: string | null;
  module_number: number;
  module_title: string;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  is_placeholder?: boolean;
}

export default function CourseDisplay() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSection, setCurrentSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && userProfile) {
      fetchCourseData();
    }
  }, [courseId, userProfile]);

  const fetchCourseData = async () => {
    if (!courseId || !userProfile) return;

    try {
      setLoading(true);
      
      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (!employee) {
        throw new Error('Employee profile not found');
      }

      // Fetch course content directly from cm_module_content
      const { data: moduleContent, error: moduleError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', courseId)
        .single();

      if (moduleError || !moduleContent) {
        throw new Error('Course content not found');
      }

      // Check if this content is assigned to the employee
      const { data: assignment, error: assignmentError } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('course_id', courseId)
        .eq('employee_id', employee.id)
        .single();

      if (assignmentError || !assignment) {
        throw new Error('Course not assigned to this employee');
      }

      // Parse the course structure from module spec with proper type checking
      const moduleSpec = moduleContent.module_spec;
      let courseStructure;
      
      if (moduleSpec && typeof moduleSpec === 'object' && moduleSpec !== null) {
        const spec = moduleSpec as any;
        courseStructure = {
          title: moduleContent.module_name,
          description: spec.description || '',
          modules: spec.learning_objectives && Array.isArray(spec.learning_objectives) ? 
            spec.learning_objectives.map((obj: any, index: number) => ({
              week: index + 1,
              title: obj.skill || `Module ${index + 1}`,
              topics: [obj.skill],
              duration: '2 hours',
              priority: obj.importance || 'medium'
            })) : [{
              week: 1,
              title: moduleContent.module_name,
              topics: ['Course Content'],
              duration: '2 hours',
              priority: 'high'
            }]
        };
      } else {
        courseStructure = {
          title: moduleContent.module_name,
          description: '',
          modules: [{
            week: 1,
            title: moduleContent.module_name,
            topics: ['Course Content'],
            duration: '2 hours',
            priority: 'high'
          }]
        };
      }

      const formattedCourse: CourseData = {
        id: assignment.id,
        course_id: assignment.course_id,
        plan_id: assignment.plan_id || '',
        progress_percentage: assignment.progress_percentage || 0,
        status: assignment.status,
        started_at: assignment.started_at || assignment.assigned_at,
        completed_at: assignment.completed_at,
        course_plan: {
          course_structure: courseStructure
        }
      };

      setCourseData(formattedCourse);

      // Load first module content
      if (courseStructure.modules && courseStructure.modules.length > 0) {
        await fetchModuleContent(assignment.id, 0);
      }

    } catch (error: any) {
      console.error('Error fetching course data:', error);
      setError(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleContent = async (assignmentId: string, moduleIndex: number) => {
    try {
      // For now, we'll create mock content since the content system is complex
      // In a real implementation, this would fetch from cm_module_content
      const mockSection: SectionData = {
        section_name: 'Introduction',
        section_content: `Welcome to ${courseData?.course_plan.course_structure.title || 'this course'}! This is module ${moduleIndex + 1}.`,
        word_count: 50,
        section_id: `section_${moduleIndex}_intro`
      };
      
      setCurrentSection(mockSection);
    } catch (error) {
      console.error('Error fetching module content:', error);
    }
  };

  const handleModuleChange = (moduleIndex: number) => {
    setCurrentModule(moduleIndex);
    if (courseData) {
      fetchModuleContent(courseData.id, moduleIndex);
    }
  };

  const handleSectionProgress = (section: Section) => {
    // Convert Section to SectionData format
    const sectionData: SectionData = {
      section_name: section.section_name,
      section_content: section.content,
      word_count: section.content.split(' ').length,
      section_id: section.section_id
    };
    setCurrentSection(sectionData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Course</h1>
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <Button onClick={() => navigate('/learner/my-courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentModuleData = courseData.course_plan.course_structure.modules[currentModule];
  
  // Convert course structure modules to Module interface format
  const modules: Module[] = courseData.course_plan.course_structure.modules.map((module, index) => ({
    id: `module_${index}`,
    content_id: null,
    module_number: index + 1,
    module_title: module.title,
    is_unlocked: index === 0 || index <= currentModule,
    is_completed: false,
    progress_percentage: index < currentModule ? 100 : (index === currentModule ? 50 : 0),
    is_placeholder: false
  }));

  const sections: { section_id: string; section_name: string; is_completed?: boolean }[] = [
    { section_id: 'intro', section_name: 'introduction', is_completed: false },
    { section_id: 'content', section_name: 'core_content', is_completed: false },
    { section_id: 'practical', section_name: 'practical_applications', is_completed: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/learner/my-courses')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{courseData.course_plan.course_structure.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Module {currentModule + 1} of {courseData.course_plan.course_structure.modules.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={courseData.status === 'completed' ? 'default' : 'secondary'}>
                {courseData.status}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium">{courseData.progress_percentage}% Complete</p>
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${courseData.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Navigation */}
          <div className="lg:col-span-1">
            <ModuleNavigation
              modules={modules}
              currentModule={modules[currentModule] || null}
              onModuleSelect={(module) => handleModuleChange(module.module_number - 1)}
              sections={sections}
              currentSection={sections[0] || null}
              onSectionSelect={(section) => console.log('Section selected:', section)}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Module Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {currentModuleData.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {currentModuleData.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {currentModuleData.priority} priority
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Week {currentModuleData.week}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">Topics Covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentModuleData.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Player */}
            <VideoPlayer
              videoUrl=""
              title={currentModuleData.title}
              onFeedback={(isPositive) => console.log('Feedback:', isPositive)}
            />

            {/* Course Content */}
            {currentSection && (
              <CourseContentSection
                section={{
                  ...currentSection,
                  section_id: currentSection.section_id || 'default_section',
                  is_completed: false
                }}
                onComplete={() => console.log('Section completed')}
                isLastSection={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
