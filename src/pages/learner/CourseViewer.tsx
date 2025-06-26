import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, PlayCircle, FileDown, Target, BookOpen, Menu } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const { courseId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [currentSection, setCurrentSection] = useState('introduction');
  const [sectionProgress, setSectionProgress] = useState<Record<string, boolean>>({});
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      // Fetch course content
      const { data: content, error: contentError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', courseId)
        .single();

      if (contentError) throw contentError;
      setCourseContent(content);

      // Fetch assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('course_id', courseId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

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

      // Set current section
      if (assignmentData.current_section) {
        setCurrentSection(assignmentData.current_section);
      } else {
        // Find first incomplete section
        const firstIncomplete = COURSE_SECTIONS.find(s => !progress[s.id]);
        if (firstIncomplete) {
          setCurrentSection(firstIncomplete.id);
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

      // Calculate new progress percentage
      const completedCount = Object.values({ ...sectionProgress, [currentSection]: true }).filter(Boolean).length;
      const progressPercentage = Math.round((completedCount / COURSE_SECTIONS.length) * 100);

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
      
      if (progressPercentage === 100) {
        toast.success('Congratulations! You\'ve completed the course!', {
          duration: 5000
        });
        setTimeout(() => navigate('/learner'), 2000);
      } else {
        navigateToNextSection();
      }
    } catch (error) {
      console.error('Error marking section complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const navigateToNextSection = () => {
    const currentIndex = COURSE_SECTIONS.findIndex(s => s.id === currentSection);
    if (currentIndex < COURSE_SECTIONS.length - 1) {
      setCurrentSection(COURSE_SECTIONS[currentIndex + 1].id);
      setMobileMenuOpen(false);
    }
  };

  const navigateToPreviousSection = () => {
    const currentIndex = COURSE_SECTIONS.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(COURSE_SECTIONS[currentIndex - 1].id);
      setMobileMenuOpen(false);
    }
  };

  const getSectionContent = () => {
    if (!courseContent) return '';
    
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

  const renderLearningObjectives = () => {
    if (currentSection !== 'introduction') return null;
    
    return (
      <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium">What you'll learn:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Understand the core concepts</li>
              <li>• Apply practical techniques</li>
              <li>• Work through real-world examples</li>
              <li>• Complete hands-on exercises</li>
            </ul>
          </div>
        </div>
      </Card>
    );
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

  const currentSectionData = COURSE_SECTIONS.find(s => s.id === currentSection);
  const currentIndex = COURSE_SECTIONS.findIndex(s => s.id === currentSection);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
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
          <span className="text-sm text-muted-foreground hidden md:block">
            {courseContent.module_name}
          </span>
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
            <SheetContent side="left" className="w-80 p-0">
              <CourseOutline
                sections={COURSE_SECTIONS}
                currentSection={currentSection}
                sectionProgress={sectionProgress}
                onSectionClick={(sectionId) => {
                  setCurrentSection(sectionId);
                  setMobileMenuOpen(false);
                }}
                courseProgress={assignment?.progress_percentage || 0}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 border-r">
          <CourseOutline
            sections={COURSE_SECTIONS}
            currentSection={currentSection}
            sectionProgress={sectionProgress}
            onSectionClick={setCurrentSection}
            courseProgress={assignment?.progress_percentage || 0}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8">
            {/* Section Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {courseContent.module_name}
              </h1>
              <h2 className="text-lg text-muted-foreground flex items-center gap-2">
                {currentSectionData?.icon && <currentSectionData.icon className="h-5 w-5" />}
                Module {currentIndex + 1} of {COURSE_SECTIONS.length}: {currentSectionData?.name}
              </h2>
            </div>

            {/* Learning Objectives (for introduction) */}
            {renderLearningObjectives()}

            {/* Content */}
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown>{getSectionContent()}</ReactMarkdown>
            </div>

            {/* Example content blocks */}
            {currentSection === 'core_content' && (
              <div className="mt-8 space-y-6">
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <PlayCircle className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Video: Understanding the Concepts</h3>
                      <div className="bg-white rounded-lg p-8 text-center">
                        <PlayCircle className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Video player would go here (8:42)</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileDown className="h-5 w-5" />
                    Practice Files
                  </h3>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileDown className="h-4 w-4" />
                    Download practice_data.xlsx
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={navigateToPreviousSection}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={markSectionComplete}
            className="gap-2"
          >
            {sectionProgress[currentSection] ? (
              currentIndex === COURSE_SECTIONS.length - 1 ? (
                <>
                  Back to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next Section
                  <ArrowRight className="h-4 w-4" />
                </>
              )
            ) : (
              <>
                Complete & Continue
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
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
}

function CourseOutline({ sections, currentSection, sectionProgress, onSectionClick, courseProgress }: CourseOutlineProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium mb-2">Course Progress</h3>
        <Progress value={courseProgress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-1">{courseProgress}% Complete</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isCompleted = sectionProgress[section.id];
            const isCurrent = section.id === currentSection;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-green-50 hover:bg-green-100'
                    : 'hover:bg-muted'
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
                    <div className={`text-xs ${isCurrent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      Module {index + 1}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}