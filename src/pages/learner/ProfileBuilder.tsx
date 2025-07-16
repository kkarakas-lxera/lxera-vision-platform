import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Brain, 
  Award, 
  Globe, 
  Folder,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Wrench,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { EmployeeProfileService, ProfileSection } from '@/services/employeeProfileService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import section components
import BasicInfoSection from './profileSections/BasicInfoSection';
import WorkExperienceSection from './profileSections/WorkExperienceSection';
import EducationSection from './profileSections/EducationSection';
import SkillsSection from './profileSections/SkillsSection';
import CertificationsSection from './profileSections/CertificationsSection';
import LanguagesSection from './profileSections/LanguagesSection';
import ProjectsSection from './profileSections/ProjectsSection';
import CurrentWorkSection from './profileSections/CurrentWorkSection';
import ToolsSection from './profileSections/ToolsSection';
import DailyTasksSection from './profileSections/DailyTasksSection';

const SECTION_ICONS = {
  basic_info: User,
  work_experience: Briefcase,
  education: GraduationCap,
  skills: Brain,
  certifications: Award,
  languages: Globe,
  projects: Folder,
  current_work: Briefcase,
  tools_technologies: Wrench,
  daily_tasks: Clock
};

const SECTION_TITLES = {
  basic_info: 'Basic Information',
  work_experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills & Expertise',
  certifications: 'Certifications',
  languages: 'Languages',
  projects: 'Projects',
  current_work: 'Current Work',
  tools_technologies: 'Tools & Technologies',
  daily_tasks: 'Daily Tasks'
};

export default function ProfileBuilder() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [currentSection, setCurrentSection] = useState<ProfileSection['name']>('basic_info');
  const [completeness, setCompleteness] = useState(0);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvImported, setCvImported] = useState(false);
  const [showCvNotice, setShowCvNotice] = useState(false);

  useEffect(() => {
    initializeProfile();
  }, [userProfile, invitationToken]);

  const initializeProfile = async () => {
    try {
      setLoading(true);

      // Get employee ID
      let empId: string | null = null;

      if (invitationToken) {
        // Mark invitation as viewed
        await EmployeeProfileService.markInvitationViewed(invitationToken);
        
        // Get employee ID from invitation
        const invitation = await EmployeeProfileService.getInvitation(invitationToken);
        if (invitation) {
          const { data } = await supabase
            .from('profile_invitations')
            .select('employee_id')
            .eq('invitation_token', invitationToken)
            .single();
          
          empId = data?.employee_id;
        }
      } else if (userProfile?.id) {
        // Get employee ID from current user
        const { data } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', userProfile.id)
          .single();
        
        empId = data?.id;
      }

      if (!empId) {
        toast.error('Employee profile not found');
        navigate('/learner');
        return;
      }

      setEmployeeId(empId);

      // Load profile sections
      const profileSections = await EmployeeProfileService.getProfileSections(empId);
      setSections(profileSections);

      // Calculate completeness
      const completion = await EmployeeProfileService.calculateProfileCompleteness(empId);
      setCompleteness(completion);

    } catch (error) {
      console.error('Error initializing profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSave = async (sectionName: ProfileSection['name'], data: any, isComplete: boolean) => {
    if (!employeeId) return;

    setSaving(true);
    try {
      await EmployeeProfileService.updateProfileSection(employeeId, sectionName, data, isComplete);
      
      // Reload sections
      const updatedSections = await EmployeeProfileService.getProfileSections(employeeId);
      setSections(updatedSections);

      // Update completeness
      const completion = await EmployeeProfileService.calculateProfileCompleteness(employeeId);
      setCompleteness(completion);

      toast.success('Section saved successfully');

      // Move to next section if current is complete
      if (isComplete) {
        const currentIndex = sections.findIndex(s => s.name === sectionName);
        if (currentIndex < sections.length - 1) {
          setCurrentSection(sections[currentIndex + 1].name);
        }
      }
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    } finally {
      setSaving(false);
    }
  };


  const handleCompleteProfile = async () => {
    if (!employeeId) return;

    try {
      await EmployeeProfileService.completeProfile(employeeId);
      toast.success('Profile completed successfully!');
      navigate('/learner');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile');
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    setCvAnalyzing(true);
    setShowCvNotice(true);

    try {
      // Extract text from file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload CV to get text
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(`${employeeId}/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Get text content based on file type
      let cvText = '';
      if (file.type === 'text/plain') {
        cvText = await file.text();
      } else {
        // For PDF and Word docs, call extraction edge function
        const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-cv-text', {
          body: { filePath: cvData.path, employeeId }
        });
        
        if (extractError || !extractData?.text) {
          // Fallback: try to read as text (might be garbled for PDFs)
          cvText = await file.text();
        } else {
          cvText = extractData.text;
        }
      }

      // Analyze CV
      const { data: analysis, error: analyzeError } = await supabase.functions.invoke('analyze-cv-for-profile', {
        body: { cvText, employeeId }
      });

      if (analyzeError) throw analyzeError;

      // Import analyzed data
      const { data: importResult, error: importError } = await supabase.functions.invoke('import-cv-to-profile', {
        body: { employeeId }
      });

      if (importError) throw importError;

      setCvImported(true);
      toast.success('CV imported successfully! Please review and update each section.');
      
      // Reload sections
      const profileSections = await EmployeeProfileService.getProfileSections(employeeId);
      setSections(profileSections);
      
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to process CV. Please try again.');
    } finally {
      setCvAnalyzing(false);
    }
  };

  const renderSection = () => {
    const section = sections.find(s => s.name === currentSection);
    if (!section) return null;

    const commonProps = {
      data: { ...section.data, employeeId },
      onSave: (data: any, isComplete: boolean) => handleSectionSave(currentSection, data, isComplete),
      saving
    };

    switch (currentSection) {
      case 'basic_info':
        return <BasicInfoSection {...commonProps} />;
      case 'work_experience':
        return <WorkExperienceSection {...commonProps} />;
      case 'education':
        return <EducationSection {...commonProps} />;
      case 'skills':
        return <SkillsSection {...commonProps} />;
      case 'certifications':
        return <CertificationsSection {...commonProps} />;
      case 'languages':
        return <LanguagesSection {...commonProps} />;
      case 'projects':
        return <ProjectsSection {...commonProps} />;
      case 'current_work':
        return <CurrentWorkSection {...commonProps} />;
      case 'tools_technologies':
        return <ToolsSection {...commonProps} />;
      case 'daily_tasks':
        return <DailyTasksSection {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help us understand your background and skills to provide personalized learning recommendations
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Profile Completion</p>
                <p className="text-2xl font-bold">{completeness}%</p>
              </div>
              <div className="flex items-center gap-4">
                {!cvImported && (
                  <div>
                    <input
                      type="file"
                      id="cv-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleCVUpload}
                      disabled={cvAnalyzing}
                    />
                    <label htmlFor="cv-upload">
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        disabled={cvAnalyzing}
                        asChild
                      >
                        <span>
                          {cvAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing CV...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Import from CV
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
                {cvImported && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    CV Imported
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={completeness} className="h-2" />
            {showCvNotice && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {cvAnalyzing 
                    ? "We're analyzing your CV to extract relevant information. This may take a moment..."
                    : cvImported
                    ? "CV data has been imported. Please review and update each section to ensure accuracy."
                    : "Upload your CV to quickly populate your profile sections."
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-8">
          {/* Section Navigation */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = SECTION_ICONS[section.name];
                    const isActive = currentSection === section.name;
                    
                    return (
                      <button
                        key={section.name}
                        onClick={() => setCurrentSection(section.name)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {section.isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {SECTION_TITLES[section.name]}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Section Content */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{SECTION_TITLES[currentSection]}</CardTitle>
                    <CardDescription>
                      {sections.find(s => s.name === currentSection)?.isComplete && (
                        <Badge variant="secondary" className="mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderSection()}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/learner')}
              >
                Save & Exit
              </Button>
              
              {completeness === 100 && (
                <Button
                  onClick={handleCompleteProfile}
                  className="flex items-center gap-2"
                >
                  Complete Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}