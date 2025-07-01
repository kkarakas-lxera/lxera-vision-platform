import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, PlayCircle, FileDown, Target, BookOpen, Menu, Lock } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  { id: 'introduction', name: 'Introduction', icon: BookOpen },
  { id: 'core_content', name: 'Core Content', icon: Target },
  { id: 'case_studies', name: 'Case Studies', icon: FileDown },
  { id: 'practical_applications', name: 'Practical Applications', icon: PlayCircle },
  { id: 'assessments', name: 'Assessments', icon: CheckCircle }
];

export default function CourseViewer() {
  const { courseId, moduleId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [sectionContents, setSectionContents] = useState<any[]>([]);
  const [availableSections, setAvailableSections] = useState<typeof COURSE_SECTIONS>([]);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [currentSection, setCurrentSection] = useState('introduction');
  const [sectionProgress, setSectionProgress] = useState<Record<string, boolean>>({});
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<{ currentModule: number; totalModules: number } | null>(null);
  
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
        .single();

      if (contentError) throw contentError;
      setCourseContent(content);

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

      // Fetch detailed section contents
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('cm_content_sections')
        .select('*')
        .eq('content_id', moduleId || courseId)
        .order('section_name');

      if (sectionsError) {
        console.error('Error fetching section contents:', sectionsError);
      } else {
        setSectionContents(sectionsData || []);
      }

      // Filter available sections based on content (check both main content and detailed sections)
      const sectionsWithContent = COURSE_SECTIONS.filter(section => {
        // Check if we have detailed section content
        const hasDetailedContent = sectionsData?.some(s => 
          s.section_name === section.id && s.section_content?.trim().length > 0
        );
        
        // Fallback to main module content
        const hasMainContent = content[section.id as keyof CourseContent];
        
        return hasDetailedContent || (hasMainContent && hasMainContent.trim().length > 0);
      });
      setAvailableSections(sectionsWithContent);

      // Fetch assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('course_id', courseId)
        .single();

      if (assignmentError) throw assignmentError;
      
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
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course');
      navigate('/learner');
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
          content_section_id: task.content_section_id,
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
    if (!courseContent || !sectionContents) return '';
    
    // First try to get detailed content from sections
    const sectionDetail = sectionContents.find(s => s.section_name === currentSection);
    if (sectionDetail && sectionDetail.section_content) {
      return sectionDetail.section_content;
    }
    
    // Fallback to main module content
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <Button onClick={() => navigate('/learner')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentSectionData = availableSections.find(s => s.id === currentSection);
  const currentIndex = availableSections.findIndex(s => s.id === currentSection);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/learner')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <span className="text-sm text-muted-foreground">
              {moduleInfo ? `Module ${moduleInfo.currentModule} of ${moduleInfo.totalModules}` : courseContent.module_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={assignment?.progress_percentage || 0} className="w-24 h-2" />
            <span className="text-sm font-medium">{assignment?.progress_percentage || 0}%</span>
          </div>
          
          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <CourseOutline
                sections={availableSections}
                currentSection={currentSection}
                sectionProgress={sectionProgress}
                onSectionClick={(sectionId) => {
                  setCurrentSection(sectionId);
                  setMobileMenuOpen(false);
                }}
                courseProgress={assignment?.progress_percentage || 0}
                moduleSpec={courseContent?.module_spec}
                currentModuleIndex={moduleInfo?.currentModule ? moduleInfo.currentModule - 1 : 0}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r bg-card">
          <CourseOutline
            sections={availableSections}
            currentSection={currentSection}
            sectionProgress={sectionProgress}
            onSectionClick={setCurrentSection}
            courseProgress={assignment?.progress_percentage || 0}
            moduleSpec={courseContent?.module_spec}
            currentModuleIndex={moduleInfo?.currentModule ? moduleInfo.currentModule - 1 : 0}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-muted/10">
          <div className="max-w-3xl mx-auto p-4 md:p-6">
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
              <Card className="p-4 md:p-6 shadow-sm">
                {/* Compact Section Header */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    {currentSectionData?.icon && <currentSectionData.icon className="h-4 w-4" />}
                    <span>Section {currentIndex + 1} of {availableSections.length}</span>
                  </div>
                  <h1 className="text-xl font-semibold">
                    {currentSectionData?.name}
                  </h1>
                </div>

                {/* Content */}
                <div className="prose prose-sm prose-gray max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                      p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/20 pl-4 my-3 text-sm italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                      ),
                    }}
                  >
                    {getSectionContent()}
                  </ReactMarkdown>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation - only show when not in game mode */}
      {gameMode === 'none' && (
        <div className="border-t px-4 py-3 bg-card">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToPreviousSection}
              disabled={currentIndex === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <Button
              size="sm"
              onClick={markSectionComplete}
              className="gap-1"
            >
              {sectionProgress[currentSection] ? (
                currentIndex === availableSections.length - 1 ? (
                  <>
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )
              ) : (
                <>
                  Complete & Continue
                  <CheckCircle className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

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
    <div className="h-full flex flex-col bg-background">
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm mb-2">Course Progress</h3>
        <Progress value={courseProgress} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-1">{courseProgress}% Complete</p>
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
                  }`}>
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Module {module.module}</div>
                      <div className="text-xs text-muted-foreground truncate">{module.title}</div>
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
                                ? 'bg-primary text-primary-foreground'
                                : isCompleted
                                ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`flex-shrink-0 ${isCurrent ? 'text-primary-foreground' : ''}`}>
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
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-muted hover:bg-muted/80'
                      : 'hover:bg-muted/50'
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