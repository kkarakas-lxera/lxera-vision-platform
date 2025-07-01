import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  FileText, 
  Target, 
  BookOpen, 
  Menu, 
  Lock,
  ChevronRight,
  ChevronDown,
  Home,
  Book,
  Lightbulb,
  Users,
  ClipboardCheck,
  ExternalLink,
  FileDown,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import VideoPlayer from '@/components/learner/VideoPlayer';
import { cn } from '@/lib/utils';
import MissionBriefing from '@/components/learner/game/MissionBriefing';
import GameScreen from '@/components/learner/game/GameScreen';
import GameResults from '@/components/learner/game/GameResults';
import TaskRolodex from '@/components/learner/game/TaskRolodex';
import TaskDecisionModal from '@/components/learner/game/TaskDecisionModal';
import PuzzleProgress from '@/components/learner/game/PuzzleProgress';

interface CourseContent {
  content_id: string;
  module_name: string;
  introduction: string | null;
  core_content: string | null;
  case_studies: string | null;
  practical_applications: string | null;
  assessments: string | null;
  research_context?: any;
  module_spec?: any;
}

interface CoursePlan {
  plan_id: string;
  course_title: string;
  course_structure: {
    modules: Array<{
      module: number;
      title: string;
      topics: string[];
      status?: string;
    }>;
  };
  total_modules: number;
}

interface ResearchResults {
  research_findings: {
    topics: Array<{
      topic: string;
      sources: Array<{
        title: string;
        url: string;
        type: string;
        summary: string;
      }>;
      synthesis: string;
      key_findings: string[];
    }>;
  };
  content_library: {
    primary_sources: any[];
    practice_resources: any[];
    supplementary_materials: any[];
  };
}

interface CourseAssignment {
  id: string;
  progress_percentage: number;
  status: string;
  current_section: string | null;
}

interface SectionProgress {
  section_name: string;
  completed: boolean;
  completed_at: string | null;
}

const COURSE_SECTIONS = [
  { id: 'introduction', name: 'Introduction', icon: BookOpen, color: 'text-blue-400' },
  { id: 'core_content', name: 'Core Content', icon: Book, color: 'text-green-400' },
  { id: 'practical_applications', name: 'Practical Applications', icon: Lightbulb, color: 'text-yellow-400' },
  { id: 'case_studies', name: 'Case Studies', icon: Users, color: 'text-purple-400' },
  { id: 'assessments', name: 'Assessments', icon: ClipboardCheck, color: 'text-red-400' }
];

export default function CourseViewer() {
  const { courseId, moduleId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  // Removed sectionContents - using cm_module_content directly
  const [availableSections, setAvailableSections] = useState<typeof COURSE_SECTIONS>([]);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [currentSection, setCurrentSection] = useState('introduction');
  const [sectionProgress, setSectionProgress] = useState<Record<string, boolean>>({});
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<{ currentModule: number; totalModules: number } | null>(null);
  const [moduleHierarchyExpanded, setModuleHierarchyExpanded] = useState(true);
  const [researchSources, setResearchSources] = useState<any[]>([]);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [researchResults, setResearchResults] = useState<ResearchResults | null>(null);
  const [contentExpanded, setContentExpanded] = useState(true);
  const [researchExpanded, setResearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'research'>('content');
  
  // Game state
  const [showMissionBriefing, setShowMissionBriefing] = useState(false);
  const [gameMode, setGameMode] = useState<'none' | 'briefing' | 'rolodex' | 'decision' | 'playing' | 'results' | 'puzzle'>('none');
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    if (userProfile && courseId) {
      fetchCourseData();
    }
  }, [userProfile, courseId]);

  const fetchCourseData = async () => {
    try {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (!employee) {
        toast.error('Employee profile not found');
        navigate('/learner');
        return;
      }

      setEmployeeId(employee.id);

      // Fetch course content - now using moduleId for specific module
      const { data: content, error: contentError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', moduleId || courseId)
        .eq('is_current_version', true)
        .single();

      if (contentError) {
        console.error('Error fetching module content:', contentError);
        throw contentError;
      }
      
      if (!content) {
        throw new Error('No content found for this course');
      }
      
      setCourseContent(content);

      // Extract research sources from research_context
      if (content.research_context) {
        const sources = content.research_context.research_results || [];
        setResearchSources(sources);
      }

      // Extract module information from module_spec
      if (content.module_spec && typeof content.module_spec === 'object') {
        const spec = content.module_spec as any;
        if (spec.modules && Array.isArray(spec.modules) && spec.total_modules) {
          // Find current module based on status or default to first
          const currentModuleIndex = spec.modules.findIndex((m: any) => m.status === 'available') || 0;
          setModuleInfo({
            currentModule: currentModuleIndex + 1,
            totalModules: spec.total_modules
          });
        }
      }

      // Note: All content is now read directly from cm_module_content columns

      // Filter available sections based on content in cm_module_content
      const sectionsWithContent = COURSE_SECTIONS.filter(section => {
        const sectionContent = content[section.id as keyof CourseContent];
        return sectionContent && typeof sectionContent === 'string' && sectionContent.trim().length > 0;
      });
      setAvailableSections(sectionsWithContent);

      // Fetch assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('course_id', courseId)
        .single();

      if (assignmentError) {
        console.error('Error fetching assignment:', assignmentError);
        throw assignmentError;
      }
      
      // Fetch course modules if needed
      const { data: modulesData } = await supabase
        .from('course_modules')
        .select('*')
        .eq('assignment_id', assignmentData.id)
        .order('module_number');
      
      // Fetch course plan if plan_id exists
      if (assignmentData.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from('cm_course_plans')
          .select('*')
          .eq('plan_id', assignmentData.plan_id)
          .single();
          
        if (!planError && planData) {
          setCoursePlan(planData);
          
          // Fetch research results
          const { data: researchData } = await supabase
            .from('cm_research_results')
            .select('*')
            .eq('plan_id', assignmentData.plan_id)
            .single();
            
          if (researchData) {
            setResearchResults(researchData);
          }
        }
      }
      
      // Fix progress_percentage to be a number
      const fixedAssignment = {
        ...assignmentData,
        progress_percentage: typeof assignmentData.progress_percentage === 'string' 
          ? parseInt(assignmentData.progress_percentage) || 0 
          : assignmentData.progress_percentage || 0
      };
      setAssignment(fixedAssignment);

      // Fetch section progress
      const { data: progressData } = await supabase
        .from('course_section_progress')
        .select('section_name, completed')
        .eq('assignment_id', assignmentData.id);

      const progress: Record<string, boolean> = {};
      progressData?.forEach(p => {
        progress[p.section_name] = p.completed;
      });
      setSectionProgress(progress);

      // Calculate actual progress based on completed sections
      if (progressData && progressData.length > 0 && sectionsWithContent.length > 0) {
        const completedSections = progressData.filter(p => p.completed).length;
        const actualProgress = Math.round((completedSections / sectionsWithContent.length) * 100);
        
        // Update assignment if progress is different
        if (actualProgress !== fixedAssignment.progress_percentage) {
          await supabase
            .from('course_assignments')
            .update({ 
              progress_percentage: actualProgress,
              status: assignmentData.status === 'assigned' ? 'in_progress' : assignmentData.status
            })
            .eq('id', assignmentData.id);
            
          setAssignment(prev => prev ? { ...prev, progress_percentage: actualProgress } : null);
        }
      }

      // Set current section
      if (assignmentData.current_section && sectionsWithContent.some(s => s.id === assignmentData.current_section)) {
        setCurrentSection(assignmentData.current_section);
      } else {
        // Find first incomplete section from available sections
        const firstIncomplete = sectionsWithContent.find(s => !progress[s.id]);
        if (firstIncomplete) {
          setCurrentSection(firstIncomplete.id);
        } else if (sectionsWithContent.length > 0) {
          // Default to first available section
          setCurrentSection(sectionsWithContent[0].id);
        }
      }

      // Mark course as started if not already
      if (assignmentData.status === 'not_started') {
        await supabase
          .from('course_assignments')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', assignmentData.id);
      }
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      const errorMessage = error?.message || 'Failed to load course';
      toast.error(errorMessage);
      
      // Only navigate away if it's a critical error
      if (error?.code === 'PGRST116' || !courseId) {
        navigate('/learner/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const markSectionComplete = async () => {
    if (!assignment || !employeeId) return;

    try {
      // Check if section already completed
      if (sectionProgress[currentSection]) {
        navigateToNextSection();
        return;
      }

      // Mark section as complete
      await supabase
        .from('course_section_progress')
        .upsert({
          assignment_id: assignment.id,
          section_name: currentSection,
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: 0 // Would track actual time in production
        });

      // Update section progress state
      setSectionProgress(prev => ({ ...prev, [currentSection]: true }));

      // Calculate new progress percentage based on available sections
      const completedCount = Object.values({ ...sectionProgress, [currentSection]: true }).filter(Boolean).length;
      const progressPercentage = Math.round((completedCount / availableSections.length) * 100);

      // Update assignment progress
      const updates: any = {
        progress_percentage: progressPercentage,
        current_section: currentSection,
        updated_at: new Date().toISOString()
      };

      // Mark as completed if all sections done
      if (progressPercentage === 100) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      await supabase
        .from('course_assignments')
        .update(updates)
        .eq('id', assignment.id);

      setAssignment(prev => prev ? { ...prev, progress_percentage: progressPercentage } : null);

      toast.success('Section completed!');
      
      // NEW: Show mission briefing after section completion (instead of immediate navigation)
      if (progressPercentage === 100) {
        toast.success('Congratulations! You\'ve completed the course!', {
          duration: 5000
        });
        setTimeout(() => navigate('/learner'), 2000);
      } else {
        // Show task rolodex for the completed section
        setGameMode('rolodex');
      }
    } catch (error) {
      console.error('Error marking section complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const navigateToNextSection = () => {
    const currentIndex = availableSections.findIndex(s => s.id === currentSection);
    if (currentIndex < availableSections.length - 1) {
      setCurrentSection(availableSections[currentIndex + 1].id);
      setMobileMenuOpen(false);
    }
  };

  const navigateToPreviousSection = () => {
    const currentIndex = availableSections.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(availableSections[currentIndex - 1].id);
      setMobileMenuOpen(false);
    }
  };

  // Game handler functions
  const handleMissionStart = (missionId: string) => {
    setCurrentMissionId(missionId);
    setGameMode('playing');
  };

  const handleGameComplete = (results: any) => {
    setGameResults(results);
    setGameMode('results');
  };

  const handleGameExit = () => {
    setGameMode('none');
    setCurrentMissionId(null);
    setGameResults(null);
  };

  const handleContinueAfterGame = () => {
    setGameMode('puzzle');
  };

  const handleMissionContinue = () => {
    setGameMode('none');
    navigateToNextSection();
  };

  // New handlers for swipe-to-learn flow
  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
    setGameMode('decision');
  };

  const handleTaskDecisionProceed = () => {
    setGameMode('playing');
    // Generate mission from selected task
    generateMissionFromTask(selectedTask);
  };

  const handleTaskDecisionCancel = () => {
    setGameMode('rolodex');
    setSelectedTask(null);
  };

  const handleBackToCourse = () => {
    setGameMode('none');
    setSelectedTask(null);
    setCurrentMissionId(null);
    setGameResults(null);
  };

  const handlePuzzleComplete = () => {
    setGameMode('none');
    setSelectedTask(null);
    setCurrentMissionId(null);
    setGameResults(null);
    navigateToNextSection();
  };

  const generateMissionFromTask = async (task: any) => {
    try {
      // Call the edge function to generate mission from selected task
      const { data, error } = await supabase.functions.invoke('generate-mission-questions', {
        body: {
          employee_id: employeeId,
          module_content_id: task.module_content_id || courseContent.content_id,
          section_name: task.section_name || currentSection,
          difficulty_level: task.difficulty_level,
          questions_count: 3,
          category: task.category,
          task_title: task.title
        }
      });

      if (error) throw error;
      if (data.success) {
        setCurrentMissionId(data.mission_id);
      }
    } catch (error) {
      console.error('Error generating mission from task:', error);
      toast.error('Failed to generate mission');
    }
  };

  const getSectionContent = () => {
    if (!courseContent) return '';
    
    // Read directly from cm_module_content columns
    switch (currentSection) {
      case 'introduction':
        return courseContent.introduction || 'No introduction available.';
      case 'core_content':
        return courseContent.core_content || 'No core content available.';
      case 'case_studies':
        return courseContent.case_studies || 'No case studies available.';
      case 'practical_applications':
        return courseContent.practical_applications || 'No practical applications available.';
      case 'assessments':
        return courseContent.assessments || 'No assessments available.';
      default:
        return '';
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Course not found</h1>
          <Button onClick={() => navigate('/learner/courses')} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionData = availableSections.find(s => s.id === currentSection);
  const currentIndex = availableSections.findIndex(s => s.id === currentSection);

  const CourseHierarchy = () => {
    // Get current module number from course content or assignment
    const getCurrentModuleNumber = () => {
      if (courseContent?.module_spec?.modules) {
        const modules = courseContent.module_spec.modules;
        for (let i = 0; i < modules.length; i++) {
          if (modules[i].title === courseContent.module_name) {
            return i + 1;
          }
        }
      }
      return 1;
    };

    const currentModuleNumber = getCurrentModuleNumber();

    return (
      <div className="space-y-2">
        <button
          onClick={() => setModuleHierarchyExpanded(!moduleHierarchyExpanded)}
          className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
        >
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Structure
          </span>
          {moduleHierarchyExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {moduleHierarchyExpanded && coursePlan && (
          <div className="ml-2 space-y-2">
            {coursePlan.course_structure.modules.map((module, index) => {
              const moduleNumber = index + 1;
              const isCurrentModule = moduleNumber === currentModuleNumber;
              const hasContent = moduleNumber === currentModuleNumber; // Only current module has content loaded
              const isLocked = moduleNumber > currentModuleNumber;
              
              return (
                <div key={module.module} className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200",
                      isCurrentModule
                        ? "bg-slate-800 text-white"
                        : isLocked
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-400 hover:bg-slate-800/50"
                    )}
                  >
                    <span className="flex items-center">
                      {isLocked ? (
                        <Lock className="h-4 w-4 mr-2" />
                      ) : (
                        <BookOpen className={cn("h-4 w-4 mr-2", isCurrentModule ? "text-blue-400" : "")} />
                      )}
                      <div className="text-left">
                        <div className="text-xs font-medium">Module {module.module}</div>
                        <div className="text-xs opacity-80">{module.title}</div>
                      </div>
                    </span>
                    {hasContent && (
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/50 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {/* Show sections only for current module with content */}
                  {isCurrentModule && hasContent && (
                    <div className="ml-6 space-y-1">
                      {availableSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = currentSection === section.id;
                        const isCompleted = sectionProgress[section.id];
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => setCurrentSection(section.id)}
                            className={cn(
                              "flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-md transition-all duration-200",
                              isActive
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            <span className="flex items-center">
                              <Icon className={cn("h-3 w-3 mr-2", section.color)} />
                              {section.name}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="h-3 w-3 text-green-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Fallback to section-only view if no course plan */}
        {moduleHierarchyExpanded && !coursePlan && (
          <div className="ml-2 space-y-1">
            {availableSections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              const isCompleted = sectionProgress[section.id];
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <span className="flex items-center">
                    <Icon className={cn("h-4 w-4 mr-2", section.color)} />
                    {section.name}
                  </span>
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const Sidebar = () => (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Course Title */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-1">{coursePlan?.course_title || courseContent.module_name}</h3>
        <p className="text-sm text-slate-400 mb-3">Current: {courseContent.module_name}</p>
        <div className="space-y-2">
          <Progress value={assignment?.progress_percentage || 0} className="h-2 bg-slate-700" />
          <p className="text-xs text-slate-400">
            {assignment?.progress_percentage || 0}% Complete
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          {/* Course Hierarchy */}
          <CourseHierarchy />

          {/* Resources */}
          {researchSources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 px-3">Research Sources</h4>
              <div className="space-y-1">
                {researchSources.slice(0, 5).map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{source.title || 'Research Source'}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Back Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => navigate('/learner/courses')}
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-400 hover:text-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                {currentSectionData?.icon && (
                  <div className={cn(
                    "p-2 rounded-lg bg-slate-900",
                    currentSectionData?.color
                  )}>
                    {React.createElement(
                      currentSectionData?.icon || BookOpen,
                      { className: "h-5 w-5" }
                    )}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {currentSectionData?.name}
                  </h1>
                  <p className="text-sm text-slate-400">{courseContent.module_name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateSection('prev')}
                disabled={currentIndex === 0}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-slate-400 px-2">
                {currentIndex + 1} / {availableSections.length}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateSection('next')}
                disabled={currentIndex === availableSections.length - 1}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Game Mode Rendering */}
            {gameMode === 'briefing' && (
              <MissionBriefing
                contentSectionId={`${courseContent.content_id}-${currentSection}`}
                sectionName={currentSection}
                onMissionStart={handleMissionStart}
                onContinue={handleMissionContinue}
              />
            )}

            {gameMode === 'rolodex' && (
              <TaskRolodex
                onTaskSelect={handleTaskSelect}
                onBackToCourse={handleBackToCourse}
                courseContentId={courseContent.content_id}
                currentSection={currentSection}
                moduleId={moduleId}
              />
            )}

            {gameMode === 'playing' && currentMissionId && (
              <GameScreen
                missionId={currentMissionId}
                onComplete={handleGameComplete}
                onExit={handleGameExit}
              />
            )}

            {gameMode === 'results' && gameResults && (
              <GameResults
                results={gameResults}
                missionTitle={selectedTask?.title || "Section Mission"}
                onContinue={handleContinueAfterGame}
                onReturnToCourse={() => navigate('/learner')}
                onViewProgress={() => {}}
              />
            )}

            {gameMode === 'puzzle' && employeeId && gameResults && (
              <PuzzleProgress
                employeeId={employeeId}
                category={selectedTask?.category || 'general'}
                pointsEarned={gameResults.pointsEarned}
                onClose={handlePuzzleComplete}
              />
            )}

            {/* Normal Course Content (when not in game mode) */}
            {gameMode === 'none' && (
              <>
                {/* Video Player */}
                <VideoPlayer sectionName={currentSection} />

                {/* Tabs */}
                <div className="flex space-x-1 mb-4">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                      activeTab === 'content'
                        ? "bg-slate-800 text-white border-b-2 border-blue-500"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    Content
                  </button>
                  {researchResults && (
                    <button
                      onClick={() => setActiveTab('research')}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
                        activeTab === 'research'
                          ? "bg-slate-800 text-white border-b-2 border-blue-500"
                          : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      Research
                    </button>
                  )}
                </div>

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <Card className="bg-slate-800 border-slate-700">
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => setContentExpanded(!contentExpanded)}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Reading Material
                        </h2>
                        {contentExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    {contentExpanded && (
                      <div className="px-6 pb-6 border-t border-slate-700 pt-4">
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-lg font-medium text-white mt-4 mb-2">{children}</h3>,
                              p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-slate-300 space-y-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-slate-300 space-y-2">{children}</ol>,
                              li: ({ children }) => <li className="text-slate-300">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-4">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children }) => (
                                <code className="bg-slate-900 text-blue-400 px-1.5 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto mb-4">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {getSectionContent()}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Research Tab */}
                {activeTab === 'research' && researchResults && (
                  <Card className="bg-slate-800 border-slate-700">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Research Materials
                      </h2>
                      
                      {researchResults.research_findings?.topics?.map((topic, topicIndex) => (
                        <div key={topicIndex} className="mb-6">
                          <div 
                            className="cursor-pointer py-2"
                            onClick={() => setResearchExpanded(!researchExpanded)}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-md font-medium text-white">
                                {topic.topic}
                              </h3>
                              {researchExpanded ? (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                          
                          {researchExpanded && (
                            <div className="ml-4 space-y-3">
                              <div className="text-sm text-slate-300 mb-3">
                                <p className="mb-2">{topic.synthesis}</p>
                                {topic.key_findings && (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {topic.key_findings.map((finding, idx) => (
                                      <li key={idx}>{finding}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              
                              {topic.sources && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-slate-400">Sources:</h4>
                                  {topic.sources.map((source, sourceIndex) => (
                                    <a
                                      key={sourceIndex}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block p-3 bg-slate-900 rounded-md hover:bg-slate-700 transition-colors"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-blue-400">{source.title}</p>
                                          <p className="text-xs text-slate-500 mt-1">{source.type}</p>
                                          {source.summary && (
                                            <p className="text-xs text-slate-400 mt-2">{source.summary}</p>
                                          )}
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-slate-500 flex-shrink-0 ml-2" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={navigateToPreviousSection}
                    disabled={currentIndex === 0}
                    className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Section
                  </Button>

                  {!sectionProgress[currentSection] ? (
                    <Button
                      onClick={markSectionComplete}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  )}

                  <Button
                    variant="outline"
                    onClick={navigateToNextSection}
                    disabled={currentIndex === availableSections.length - 1}
                    className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Next Section
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Task Decision Modal - overlay */}
      {gameMode === 'decision' && selectedTask && employeeId && (
        <TaskDecisionModal
          task={selectedTask}
          onProceed={handleTaskDecisionProceed}
          onCancel={handleTaskDecisionCancel}
          employeeId={employeeId}
        />
      )}
    </div>
  );
}

// Course Outline Component
interface CourseOutlineProps {
  sections: typeof COURSE_SECTIONS;
  currentSection: string;
  sectionProgress: Record<string, boolean>;
  onSectionClick: (sectionId: string) => void;
  courseProgress: number;
  moduleSpec?: any;
  currentModuleIndex?: number;
}

function CourseOutline({ 
  sections, 
  currentSection, 
  sectionProgress, 
  onSectionClick, 
  courseProgress,
  moduleSpec,
  currentModuleIndex = 0
}: CourseOutlineProps) {
  return (
    <div className="h-full flex flex-col bg-smart-beige/30">
      <div className="p-3 border-b border-business-black/10">
        <h3 className="font-medium text-sm mb-2 text-business-black">Course Progress</h3>
        <Progress value={courseProgress} className="h-1.5 [&>div]:bg-future-green" />
        <p className="text-xs text-business-black/60 mt-1">{courseProgress}% Complete</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Show all modules if moduleSpec exists */}
          {moduleSpec?.modules ? (
            moduleSpec.modules.map((module: any, moduleIdx: number) => {
              const isCurrentModule = moduleIdx === currentModuleIndex;
              const isLocked = module.status === 'locked';
              
              return (
                <div key={`module-${moduleIdx}`} className="space-y-1">
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                    isLocked ? 'opacity-60' : ''
                  } text-business-black`}>
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5 text-future-green" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Module {module.module}</div>
                      <div className="text-xs text-business-black/60 truncate">{module.title}</div>
                    </div>
                  </div>
                  
                  {/* Show sections only for current module */}
                  {isCurrentModule && !isLocked && (
                    <div className="ml-5 space-y-0.5">
                      {sections.map((section, index) => {
                        const Icon = section.icon;
                        const isCompleted = sectionProgress[section.id];
                        const isCurrent = section.id === currentSection;
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => onSectionClick(section.id)}
                            className={`w-full text-left px-2 py-1.5 rounded transition-colors text-xs ${
                              isCurrent
                                ? 'bg-future-green text-business-black font-medium'
                                : isCompleted
                                ? 'bg-smart-beige hover:bg-smart-beige/80 text-business-black/60'
                                : 'hover:bg-smart-beige/50 text-business-black/80'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`flex-shrink-0 ${isCurrent ? 'text-business-black' : ''}`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Icon className="h-3 w-3" />
                                )}
                              </div>
                              <div className="flex-1 truncate">
                                {section.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Fallback to just sections if no module spec
            sections.map((section, index) => {
              const Icon = section.icon;
              const isCompleted = sectionProgress[section.id];
              const isCurrent = section.id === currentSection;
              
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionClick(section.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-future-green text-business-black font-medium'
                      : isCompleted
                      ? 'bg-smart-beige hover:bg-smart-beige/80 text-business-black/60'
                      : 'hover:bg-smart-beige/50 text-business-black/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${isCurrent ? 'text-primary-foreground' : ''}`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.name}</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}