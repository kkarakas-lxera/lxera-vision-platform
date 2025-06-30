import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  Circle,
  PlayCircle, 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  ChevronRight,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import CourseContentSection from './components/CourseContentSection';
import ModuleNavigation from './components/ModuleNavigation';
import VideoPlayer from './components/VideoPlayer';

interface CourseData {
  id: string;
  plan_id: string;
  status: string;
  progress_percentage: number;
  total_modules: number;
  modules_completed: number;
  current_module_id: string | null;
  plan: {
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

interface ModuleData {
  id: string;
  content_id: string;
  module_number: number;
  module_title: string;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
}

interface SectionData {
  section_id: string;
  section_name: string;
  section_content: string;
  word_count: number;
  is_completed?: boolean;
  completed_at?: string | null;
}

export default function CourseDisplay() {
  const { courseId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [currentModule, setCurrentModule] = useState<ModuleData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionData | null>(null);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (userProfile && courseId) {
      fetchCourseData();
      setupRealtimeSubscription();
    }
  }, [userProfile, courseId]);

  const setupRealtimeSubscription = () => {
    // Subscribe to real-time updates for course progress
    const subscription = supabase
      .channel(`course-progress-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_assignments',
          filter: `course_id=eq.${courseId}`
        },
        (payload) => {
          console.log('Course progress updated:', payload);
          fetchCourseData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Get employee ID
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id);
      
      const employee = employees?.[0];
      if (!employee) {
        toast.error('Employee profile not found');
        navigate('/learner');
        return;
      }

      // Fetch course assignment with plan
      const { data: assignment, error: assignmentError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          plan_id,
          status,
          progress_percentage,
          total_modules,
          modules_completed,
          current_module_id
        `)
        .eq('employee_id', employee.id)
        .eq('course_id', courseId)
        .single();

      if (assignmentError) throw assignmentError;

      // Fetch course plan details
      const { data: plan } = await supabase
        .from('cm_course_plans')
        .select('course_structure')
        .eq('plan_id', assignment.plan_id)
        .single();

      setCourseData({
        ...assignment,
        plan
      });

      // Fetch course modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('assignment_id', assignment.id)
        .order('module_number');

      if (modulesError) throw modulesError;
      
      setModules(modulesData || []);
      
      // Set current module
      const activeModule = modulesData?.find(m => !m.is_completed) || modulesData?.[0];
      if (activeModule) {
        setCurrentModule(activeModule);
        fetchModuleSections(activeModule.content_id);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleSections = async (contentId: string) => {
    try {
      const { data: sectionsData, error } = await supabase
        .from('cm_content_sections')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at');

      if (error) throw error;

      // Fetch completion status for sections
      const sectionsWithStatus = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { data: progress } = await supabase
            .from('course_section_progress')
            .select('is_completed, completed_at')
            .eq('section_id', section.section_id)
            .eq('user_id', userProfile?.id)
            .single();

          return {
            ...section,
            is_completed: progress?.is_completed || false,
            completed_at: progress?.completed_at
          };
        })
      );

      setSections(sectionsWithStatus);
      setCurrentSection(sectionsWithStatus[0] || null);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load module content');
    }
  };

  const handleModuleSelect = (module: ModuleData) => {
    if (!module.is_unlocked) {
      toast.error('Complete previous modules to unlock this one');
      return;
    }
    setCurrentModule(module);
    fetchModuleSections(module.content_id);
  };

  const handleSectionComplete = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('course_section_progress')
        .upsert({
          section_id: sectionId,
          user_id: userProfile?.id,
          module_id: currentModule?.id,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setSections(prev => prev.map(s => 
        s.section_id === sectionId 
          ? { ...s, is_completed: true, completed_at: new Date().toISOString() }
          : s
      ));

      toast.success('Section completed!');
      
      // Move to next section if available
      const currentIndex = sections.findIndex(s => s.section_id === sectionId);
      if (currentIndex < sections.length - 1) {
        setCurrentSection(sections[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Error marking section complete:', error);
      toast.error('Failed to save progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96" />
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Course not found</h3>
              <p className="text-muted-foreground mb-4">
                The course you're looking for doesn't exist or you don't have access.
              </p>
              <Button onClick={() => navigate('/learner/courses')}>
                Back to My Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const courseTitle = courseData.plan?.course_structure?.title || 'Course';
  const totalModules = courseData.plan?.course_structure?.modules?.length || 0;
  const totalWeeks = courseData.plan?.course_structure?.modules?.reduce(
    (acc, mod) => acc + parseInt(mod.duration || '1'), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/learner/courses')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Courses
            </Button>
          </div>
          
          <div className="mt-4 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseTitle}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalModules} Modules
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {totalWeeks} weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  125 learners
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  4.8 rating
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(courseData.progress_percentage)}%
                </span>
              </div>
              <Progress value={courseData.progress_percentage} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent border-0">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2">
                Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:border-b-2">
                Content
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:border-b-2">
                Resources
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:border-b-2">
                Progress
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Course overview content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This comprehensive course equips you with advanced software engineering skills 
                  for creating effective business performance reports. Learn to leverage data, 
                  create visualizations, and deliver actionable insights.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Module Navigation Sidebar */}
            <div className="lg:col-span-1">
              <ModuleNavigation
                modules={modules}
                currentModule={currentModule}
                onModuleSelect={handleModuleSelect}
                sections={sections}
                currentSection={currentSection}
                onSectionSelect={setCurrentSection}
              />
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {currentModule && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentModule.module_title}</CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Video Player Placeholder */}
                  <VideoPlayer
                    videoUrl=""
                    title={currentSection?.section_name || ''}
                    onFeedback={(isPositive) => {
                      console.log('Feedback:', isPositive ? 'positive' : 'negative');
                    }}
                  />

                  {/* Course Content */}
                  {currentSection && (
                    <CourseContentSection
                      section={currentSection}
                      onComplete={() => handleSectionComplete(currentSection.section_id)}
                      isLastSection={sections.indexOf(currentSection) === sections.length - 1}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            {/* Resources content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">📚 Reading Materials</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>Business Intelligence Fundamentals (PDF)</span>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Progress tracking content */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Overall Completion</span>
                      <span>{Math.round(courseData.progress_percentage)}%</span>
                    </div>
                    <Progress value={courseData.progress_percentage} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}