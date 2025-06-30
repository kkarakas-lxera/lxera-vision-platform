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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import GreetingVideoPlayer from './components/GreetingVideoPlayer';

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
  content_id: string | null;
  module_number: number;
  module_title: string;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  started_at?: string | null;
  completed_at?: string | null;
  is_placeholder?: boolean;
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
  const [showVideoGreeting, setShowVideoGreeting] = useState(false);
  const [hasSeenGreeting, setHasSeenGreeting] = useState(false);

  useEffect(() => {
    if (userProfile && courseId) {
      fetchCourseData();
      setupRealtimeSubscription();
    }
  }, [userProfile, courseId]);

  // Check if user has seen greeting for this course
  useEffect(() => {
    if (courseId) {
      const greetingKey = `course_greeting_seen_${courseId}`;
      const hasSeenPreviously = localStorage.getItem(greetingKey) === 'true';
      setHasSeenGreeting(hasSeenPreviously);
    }
  }, [courseId]);

  // Show greeting video when introduction section is loaded for the first time
  useEffect(() => {
    if (!loading && currentSection?.section_name === 'introduction' && !hasSeenGreeting && courseId) {
      setShowVideoGreeting(true);
      setHasSeenGreeting(true);
      // Remember that user has seen the greeting
      localStorage.setItem(`course_greeting_seen_${courseId}`, 'true');
    }
  }, [currentSection, loading, hasSeenGreeting, courseId]);

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

      // Get modules from the course plan
      const planModules = plan?.course_structure?.modules || [];
      
      // Check if we have course content
      const companyId = userProfile?.company_id;
      console.log('Looking for course content with content_id:', assignment.course_id, 'and company_id:', companyId);
      
      const { data: courseContent, error: contentError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', assignment.course_id)
        .eq('company_id', companyId)
        .single();
      
      if (contentError) {
        console.error('Error fetching course content:', contentError);
      } else {
        console.log('Course content found:', courseContent);
      }

      // Fetch existing modules from database
      const { data: existingModules } = await supabase
        .from('course_modules')
        .select('*')
        .eq('assignment_id', assignment.id)
        .order('module_number');

      console.log('Existing modules in DB:', existingModules);

      // Create module list from plan, using real module IDs when available
      const combinedModules = planModules.map((planModule: {
        week: number;
        title: string;
        topics: string[];
        duration: string;
        priority: string;
      }, index: number) => {
        const moduleNumber = index + 1;
        
        // Check if we have a real module in the database
        const existingModule = existingModules?.find(m => m.module_number === moduleNumber);
        
        // For now, we have content for the entire course, not individual modules
        // Mark first module as having content if course content exists
        const hasContent = courseContent && moduleNumber === 1;
        
        return {
          id: existingModule?.id || `module-${moduleNumber}`,
          assignment_id: assignment.id,
          content_id: hasContent ? assignment.course_id : null,
          module_number: moduleNumber,
          module_title: planModule.title,
          is_unlocked: existingModule?.is_unlocked ?? (moduleNumber === 1),
          is_completed: existingModule?.is_completed ?? false,
          progress_percentage: existingModule?.progress_percentage ?? 0,
          is_placeholder: !hasContent // Flag to identify modules without content
        };
      });

      setModules(combinedModules);
      
      // Set first module as current and load sections if content exists
      if (combinedModules.length > 0) {
        const firstModule = combinedModules[0];
        setCurrentModule(firstModule);
        
        if (firstModule.content_id && courseContent) {
          console.log('Fetching sections for first module:', firstModule.content_id);
          fetchModuleSections(firstModule.content_id, courseContent, assignment.id);
        } else {
          console.log('No content_id for first module or no course content found');
          console.log('First module content_id:', firstModule.content_id);
          console.log('Course content exists:', !!courseContent);
        }
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleSections = async (contentId: string, moduleContentData?: any, assignmentId?: string) => {
    try {
      console.log('Fetching sections for contentId:', contentId);

      // Use the passed moduleContentData if available, otherwise try to fetch
      let content = moduleContentData;
      
      if (!content) {
        // Try to use the learner RPC function first to get the module content
        const { data: moduleContent, error: moduleError } = await supabase
          .rpc('get_module_content_for_learner', {
            p_content_id: contentId
          });

        if (moduleError) {
          console.error('Error fetching module content:', moduleError);
          // Continue to try fetching sections directly
        } else {
          console.log('Module content fetched:', moduleContent);
          content = moduleContent?.[0];
        }
      }

      // For sections, we need to create an RPC function or work around the RLS
      // For now, let's create the sections from the module content
      const sectionsData = [];
      
      if (content) {
        
        // Create sections from the module content fields
        if (content.introduction) {
          sectionsData.push({
            section_id: 'intro-' + contentId,
            section_name: 'introduction',
            section_content: content.introduction,
            word_count: content.introduction.split(' ').length,
            content_id: contentId
          });
        }
        
        if (content.practical_applications) {
          sectionsData.push({
            section_id: 'practical-' + contentId,
            section_name: 'practical_applications',
            section_content: content.practical_applications,
            word_count: content.practical_applications.split(' ').length,
            content_id: contentId
          });
        }
        
        if (content.case_studies) {
          sectionsData.push({
            section_id: 'cases-' + contentId,
            section_name: 'case_studies',
            section_content: content.case_studies,
            word_count: content.case_studies.split(' ').length,
            content_id: contentId
          });
        }
        
        if (content.assessments) {
          sectionsData.push({
            section_id: 'assess-' + contentId,
            section_name: 'assessments',
            section_content: content.assessments,
            word_count: content.assessments.split(' ').length,
            content_id: contentId
          });
        }
      }

      console.log('Constructed sections data:', sectionsData);
      console.log('Number of sections:', sectionsData.length);

      // Fetch completion status for sections
      const sectionsWithStatus = await Promise.all(
        (sectionsData || []).map(async (section) => {
          // Check if we have progress for this section
          if (assignmentId) {
            const { data: progress } = await supabase
              .from('course_section_progress')
              .select('completed, completed_at')
              .eq('assignment_id', assignmentId)
              .eq('section_name', section.section_name)
              .single();

            return {
              ...section,
              is_completed: progress?.completed || false,
              completed_at: progress?.completed_at
            };
          }
          
          return {
            ...section,
            is_completed: false,
            completed_at: null
          };
        })
      );

      setSections(sectionsWithStatus);
      setCurrentSection(sectionsWithStatus[0] || null);
      
      if (sectionsWithStatus.length === 0) {
        console.warn('No sections found for content_id:', contentId);
        toast.info('Content sections are being prepared. Please check back later.');
      }
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
    if (module.is_placeholder) {
      toast.info('This module content is coming soon');
      return;
    }
    setCurrentModule(module);
    if (module.content_id) {
      // For now, we'll fetch without the content data
      fetchModuleSections(module.content_id, null, courseData?.id);
    }
  };

  const handleSectionComplete = async (sectionId: string) => {
    try {
      // Find the section to get its name
      const section = sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      // We need the assignment_id for this progress record
      const assignmentId = courseData?.id;
      if (!assignmentId) {
        console.error('No assignment ID found');
        toast.error('Unable to save progress - assignment not found');
        return;
      }

      console.log('Marking section complete:', {
        assignment_id: assignmentId,
        section_name: section.section_name,
        module_id: currentModule?.id
      });

      // For constructed modules, we need to find or create the actual module in DB
      let actualModuleId = currentModule?.id;
      
      // If this is a placeholder module, try to find the real module in DB
      if (currentModule?.id?.startsWith('module-')) {
        const { data: realModule } = await supabase
          .from('course_modules')
          .select('id')
          .eq('assignment_id', assignmentId)
          .eq('module_number', currentModule.module_number)
          .single();
        
        if (realModule) {
          actualModuleId = realModule.id;
        } else {
          // Module doesn't exist in DB, skip module_id
          actualModuleId = null;
        }
      }

      const progressData: any = {
        assignment_id: assignmentId,
        section_name: section.section_name,
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent_seconds: 0 // For now, we'll track this later
      };

      // Only add module_id if we have a valid one
      if (actualModuleId && !actualModuleId.startsWith('module-')) {
        progressData.module_id = actualModuleId;
      }

      console.log('Saving progress with data:', progressData);

      // First, try to update existing record
      const { data: existingProgress } = await supabase
        .from('course_section_progress')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('section_name', section.section_name)
        .single();

      let error;
      
      // Try using RPC function first (more reliable)
      try {
        const { error: rpcError } = await supabase
          .rpc('upsert_section_progress', {
            p_assignment_id: assignmentId,
            p_section_name: section.section_name,
            p_module_id: actualModuleId && !actualModuleId.startsWith('module-') ? actualModuleId : null,
            p_completed: true,
            p_time_spent_seconds: 0
          });
        
        error = rpcError;
      } catch (rpcErr) {
        console.error('RPC function failed, falling back to direct insert/update:', rpcErr);
        
        // Fallback to direct insert/update
        if (existingProgress) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('course_section_progress')
            .update({
              completed: true,
              completed_at: new Date().toISOString(),
              time_spent_seconds: progressData.time_spent_seconds,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
          
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('course_section_progress')
            .insert(progressData);
          
          error = insertError;
        }
      }

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
        // Scroll to top of content area
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // All sections completed
        toast.success('Module completed! 🎉');
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
                  ~{totalWeeks * 2} hours
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-blue-500" />
                  Advanced Analytics
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Business Intelligence
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

                  {currentModule.is_placeholder ? (
                    // Show coming soon message for placeholder modules
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Module Content Coming Soon</h3>
                        <p className="text-muted-foreground">
                          This module is part of your learning path but the content is still being prepared. 
                          Check back soon!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Show welcome video button for introduction section */}
                      {currentSection?.section_name === 'introduction' && (
                        <div className="relative mb-6 overflow-hidden rounded-xl">
                          {/* Striking gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
                          <div className="absolute inset-0 bg-black/20"></div>
                          
                          {/* Animated background elements */}
                          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-75"></div>
                          
                          <div className="relative p-8 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 flex-1">
                                {/* Video Thumbnail */}
                                <div className="relative w-32 h-20 bg-black/30 rounded-lg overflow-hidden backdrop-blur-sm border border-white/20">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                                      <PlayCircle className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  {/* Simulated video preview */}
                                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/20 rounded-full">
                                    <div className="h-full w-1/3 bg-white/60 rounded-full"></div>
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-100">Course Welcome Message</h3>
                                      <p className="text-gray-200 text-sm">
                                        Personal greeting from your instructor
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-gray-100 mb-4 max-w-lg">
                                    Start your learning journey with a personalized welcome message designed 
                                    specifically for your role and learning path.
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      ~2 min
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      Personalized
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-6">
                                <Button 
                                  onClick={() => setShowVideoGreeting(true)}
                                  size="lg"
                                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                                  variant="outline"
                                >
                                  <PlayCircle className="h-5 w-5 mr-2" />
                                  Watch Welcome Video
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video Player Placeholder for other sections */}
                      <VideoPlayer
                        videoUrl=""
                        title={currentSection?.section_name || ''}
                        onFeedback={(isPositive) => {
                          console.log('Feedback:', isPositive ? 'positive' : 'negative');
                        }}
                      />

                      {/* Course Content */}
                      {currentSection ? (
                        <CourseContentSection
                          section={currentSection}
                          onComplete={() => handleSectionComplete(currentSection.section_id)}
                          isLastSection={sections.indexOf(currentSection) === sections.length - 1}
                        />
                      ) : sections.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Content Not Available</h3>
                            <p className="text-muted-foreground">
                              Course content sections are currently being prepared. 
                              Please check back later or contact your administrator.
                            </p>
                          </CardContent>
                        </Card>
                      ) : null}
                    </>
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

      {/* Course Greeting Video Modal */}
      <Dialog open={showVideoGreeting} onOpenChange={setShowVideoGreeting}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Welcome to {courseTitle}
            </DialogTitle>
            <DialogDescription>
              Let's start your learning journey with a personal message from your instructor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <GreetingVideoPlayer
              videoId="e11be856835644f4802cefbd23136885"
              title="Course Welcome Message"
              onFeedback={(isPositive) => {
                console.log('Greeting video feedback:', isPositive ? 'positive' : 'negative');
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              You can always replay this welcome message by clicking on the introduction section.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowVideoGreeting(false)}>
                Skip for now
              </Button>
              <Button onClick={() => setShowVideoGreeting(false)}>
                Start Learning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}