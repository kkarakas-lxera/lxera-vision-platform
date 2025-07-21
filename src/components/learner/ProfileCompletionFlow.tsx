import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Upload, 
  User, 
  Briefcase, 
  GraduationCap,
  Brain,
  Target,
  Wrench,
  Clock,
  Loader2,
  FileText,
  Save,
  Trash2,
  AlertCircle,
  Eye,
  Pencil,
  X,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import SkillsValidationCards from '@/components/learner/SkillsValidationCards';

interface ProfileCompletionFlowProps {
  employeeId: string;
  onComplete: () => void;
}

interface FormData {
  // Current Role
  currentPosition: string;
  department: string;
  timeInRole: string;
  
  // Work Experience
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    responsibilities?: string[];
    achievements?: string[];
    technologies?: string[];
  }>;
  
  // Education - now supports multiple entries
  education: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
  }>;
  highestDegree: string; // Keep for backward compatibility
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  
  // Skills validation is now handled separately
  
  // Current Work
  currentProjects: string[];
  teamSize: string;
  roleInTeam: string;
  
  // Challenges
  challenges: string[];
  
  // Growth Areas
  growthAreas: string[];
}

const STEPS = [
  {
    id: 1,
    title: "Upload Your CV",
    subtitle: "Save time by letting us extract your experience",
    icon: FileText,
    fields: ['cv']
  },
  {
    id: 2,
    title: "Work Experience",
    subtitle: "Tell us about your professional journey",
    icon: Briefcase,
    fields: ['workExperience']
  },
  {
    id: 3,
    title: "Education Background",
    subtitle: "Your educational qualifications",
    icon: GraduationCap,
    fields: ['highestDegree', 'fieldOfStudy', 'institution', 'graduationYear']
  },
  {
    id: 4,
    title: "Skills Review",
    subtitle: "Quick validation of your expertise",
    icon: Brain,
    fields: [] // No form fields needed
  },
  {
    id: 5,
    title: "Current Projects",
    subtitle: "What are you working on?",
    icon: Wrench,
    fields: ['currentProjects', 'teamSize', 'roleInTeam']
  },
  {
    id: 6,
    title: "Professional Challenges",
    subtitle: "What challenges do you face?",
    icon: Clock,
    fields: ['challenges']
  },
  {
    id: 7,
    title: "Growth Opportunities",
    subtitle: "Which areas would help you excel?",
    icon: Target,
    fields: ['growthAreas']
  }
];

// Removed hardcoded arrays - using full AI generation


export default function ProfileCompletionFlow({ employeeId, onComplete }: ProfileCompletionFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<{
    challenges: string[];
    growthAreas: string[];
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvAnalysisStatus, setCvAnalysisStatus] = useState<string>('');
  const [cvAnalysisStep, setCvAnalysisStep] = useState(0);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Position skills state
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    currentPosition: '',
    department: '',
    timeInRole: '',
    workExperience: [],
    education: [],
    highestDegree: '',
    fieldOfStudy: '',
    institution: '',
    graduationYear: '',
    currentProjects: [],
    teamSize: '',
    roleInTeam: '',
    challenges: [],
    growthAreas: []
  });

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);
  
  // Check if CV was uploaded when profile sections are loaded
  useEffect(() => {
    const checkCVStatus = async () => {
      const sections = await EmployeeProfileService.getProfileSections(employeeId);
      const hasWorkExperience = sections.some(s => s.name === 'work_experience' && s.data && Object.keys(s.data).length > 0);
      const hasEducation = sections.some(s => s.name === 'education' && s.data && Object.keys(s.data).length > 0);
      
      // If we have work experience or education data, CV was likely uploaded
      if (hasWorkExperience || hasEducation) {
        setCvUploaded(true);
      }
    };
    
    checkCVStatus();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      
      // Get employee data with position info
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          *, 
          companies(name),
          st_company_positions!employees_current_position_id_fkey(
            id,
            position_title,
            position_code,
            department,
            required_skills
          ),
          st_employee_skills_profile(
            extracted_skills
          )
        `)
        .eq('id', employeeId)
        .single();

      if (employee) {
        setEmployeeData(employee); // Store for later use
        
        // Check if CV has been uploaded
        if (employee.cv_file_path || employee.cv_uploaded_at) {
          setCvUploaded(true);
        }
        
        // Use position title and department from linked position if available
        const currentPosition = employee.st_company_positions?.position_title || employee.position || '';
        const department = employee.st_company_positions?.department || employee.department || '';
        
        setFormData(prev => ({
          ...prev,
          currentPosition,
          department
        }));
        
        // Position skills loading removed - not being used in the component
        
      }

      // Get existing profile sections
      const sections = await EmployeeProfileService.getProfileSections(employeeId);
      
      console.log('Profile sections loaded:', sections);
      
      // Pre-fill from existing data and determine current step
      let lastCompletedStep = 0;
      const restoredFormData: any = {};
      
      sections.forEach(section => {
        if (section.data) {
          // Handle different section types
          switch (section.name) {
            case 'basic_info':
              if (section.data.position || section.data.department) {
                restoredFormData.currentPosition = section.data.position || '';
                restoredFormData.department = section.data.department || '';
                restoredFormData.timeInRole = section.data.timeInRole || '';
                // Only count as completed if the section is marked complete
                // Skip basic_info step count as we removed step 1
              }
              break;
            case 'work_experience':
              // Handle both formats: array directly or object with experiences property
              let experiences = [];
              if (Array.isArray(section.data)) {
                // New format from import-cv-to-profile: data is directly an array
                experiences = section.data;
              } else if (section.data.experiences) {
                // Old format: data.experiences
                experiences = section.data.experiences;
              } else if (section.data.experience) {
                // Another old format: data.experience
                experiences = section.data.experience;
              }
              
              if (experiences.length > 0) {
                // Map CV imported data to form structure
                restoredFormData.workExperience = experiences.map((exp: any) => ({
                  title: exp.position || exp.title || '',
                  company: exp.company || '',
                  duration: exp.dates || exp.duration || '',
                  description: exp.description || exp.key_achievements?.join('\n') || '',
                  responsibilities: exp.responsibilities || exp.key_responsibilities || [],
                  achievements: exp.achievements || exp.key_achievements || [],
                  technologies: exp.technologies || []
                }));
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 2);
                }
              }
              break;
            case 'education':
              if (section.data.education?.length > 0) {
                // Load all education entries
                restoredFormData.education = section.data.education.map((edu: any) => {
                  // Handle CV imported data structure
                  if (edu.degree && edu.institution && !edu.field) {
                    // Extract degree type and field from the degree string
                    const degreeStr = edu.degree || '';
                    let degreeType = '';
                    let field = '';
                    
                    if (degreeStr.includes('MSc') || degreeStr.includes('Master')) {
                      degreeType = 'Master';
                      field = degreeStr.replace(/MSc|Master|Master's|Degree|,/g, '').trim();
                    } else if (degreeStr.includes('BSc') || degreeStr.includes('Bachelor')) {
                      degreeType = 'Bachelor';
                      field = degreeStr.replace(/BSc|Bachelor|Bachelor's|Degree|,/g, '').trim();
                    } else if (degreeStr.includes('PhD') || degreeStr.includes('Doctor')) {
                      degreeType = 'PhD';
                      field = degreeStr.replace(/PhD|Doctor|Doctorate|,/g, '').trim();
                    } else {
                      degreeType = 'Other';
                      field = degreeStr;
                    }
                    
                    // Extract year from dates if available
                    const yearMatch = edu.dates?.match(/\b(19|20)\d{2}\b/);
                    
                    return {
                      degree: degreeType,
                      fieldOfStudy: field,
                      institution: edu.institution || '',
                      graduationYear: yearMatch ? yearMatch[0] : ''
                    };
                  } else {
                    // Handle manually entered data
                    return {
                      degree: edu.degree || '',
                      fieldOfStudy: edu.field || edu.fieldOfStudy || '',
                      institution: edu.institution || '',
                      graduationYear: edu.graduationYear || ''
                    };
                  }
                });
                
                // Also set the first education entry to backward compatibility fields
                if (restoredFormData.education.length > 0) {
                  const firstEdu = restoredFormData.education[0];
                  restoredFormData.highestDegree = firstEdu.degree;
                  restoredFormData.fieldOfStudy = firstEdu.fieldOfStudy;
                  restoredFormData.institution = firstEdu.institution;
                  restoredFormData.graduationYear = firstEdu.graduationYear;
                }
                
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 3);
                }
              }
              break;
            // Skills validation is now handled separately in Step 4
            case 'certifications':
            case 'languages':
            case 'skills':
              // These are now handled by SkillsValidationCards component
              if (section.isComplete) {
                lastCompletedStep = Math.max(lastCompletedStep, 4);
              }
              break;
            case 'current_work':
              if (section.data.projects || section.data.teamSize || section.data.role) {
                restoredFormData.currentProjects = section.data.projects || '';
                restoredFormData.teamSize = section.data.teamSize || '';
                restoredFormData.roleInTeam = section.data.role || '';
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 5);
                }
              }
              break;
            case 'daily_tasks':
              if (section.data.challenges) {
                restoredFormData.challenges = section.data.challenges;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 6);
                }
              }
              break;
            case 'tools_technologies':
              if (section.data.growthAreas) {
                restoredFormData.growthAreas = section.data.growthAreas;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 7);
                }
              }
              break;
          }
        }
      });

      // Restore form data
      if (Object.keys(restoredFormData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...restoredFormData
        }));
      }
      
      // Load personalized suggestions if they exist
      const { data: suggestions } = await supabase
        .from('employee_profile_suggestions')
        .select('challenges, growth_areas')
        .eq('employee_id', employeeId)
        .single();
        
      if (suggestions) {
        setPersonalizedSuggestions({
          challenges: suggestions.challenges || [],
          growthAreas: suggestions.growth_areas || []
        });
      }

      // Check if profile is already completed
      if (lastCompletedStep >= STEPS.length) {
        setIsCompleted(true);
      } else if (lastCompletedStep > 0) {
        // Restore step position - go to next step after last completed
        const nextStep = Math.min(lastCompletedStep + 1, STEPS.length);
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error('Failed to load your profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    setCvAnalyzing(true);
    setCvAnalysisStatus('Starting upload...');
    setCvAnalysisStep(0);
    
    // Start the engaging messages
    const messages = [
      '📤 Uploading your CV securely...',
      '🔍 Reading your professional journey...',
      '🧠 AI analyzing your experience and skills...',
      '💡 Extracting key achievements...',
      '🎯 Identifying your expertise areas...',
      '📊 Mapping skills to industry standards...',
      '✨ Almost done! Finalizing your profile...'
    ];
    
    let messageIndex = 0;
    setCvAnalysisStatus(messages[0]);
    
    messageIntervalRef.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCvAnalysisStatus(messages[messageIndex]);
      setCvAnalysisStep(messageIndex);
    }, 15000); // Change message every 15 seconds

    try {
      // Upload CV to the correct storage bucket
      const uploadPath = `${employeeId}/${Date.now()}-${file.name}`;
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;
      
      setCvAnalysisStatus('CV uploaded successfully. Starting analysis...');

      // Call the edge function to start analysis
      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-cv-enhanced', {
        body: { 
          employee_id: employeeId,
          file_path: cvData.path,
          source: 'profile_completion',
          use_template: true
        }
      });

      if (analyzeError) throw analyzeError;
      
      console.log('CV Analysis Response:', analysisResult);
      
      // Import CV data after successful analysis
      if (analysisResult?.success) {
        setCvAnalysisStatus('Importing data into your profile...');
        
        const { error: importError } = await supabase.functions.invoke('import-cv-to-profile', {
          body: { employeeId }
        });

        if (importError) {
          console.warn('CV import to profile failed:', importError);
        }
        
        setCvAnalysisStatus('Finalizing...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setCvUploaded(true);
        setCvAnalysisStatus('');
        toast.success('CV analyzed and imported successfully! Your information has been pre-filled.');
        
        // Reload data to get imported information
        await loadEmployeeData();
      }
      
    } catch (error) {
      console.error('CV upload error:', error);
      setCvAnalysisStatus('');
      toast.error('Failed to process CV. You can continue manually.');
    } finally {
      setCvAnalyzing(false);
      // Clear the message interval
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }
  };

  const handleDeleteCV = async () => {
    // Confirm with user
    const confirmed = window.confirm(
      'Are you sure you want to delete your CV data? This will remove all imported information including work experience, education, and skills. This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    setCvAnalysisStatus('Deleting CV data...');
    
    try {
      // Call the delete edge function
      const { error } = await supabase.functions.invoke('delete-cv-data', {
        body: { employee_id: employeeId }
      });
      
      if (error) throw error;
      
      // Reset local state
      setCvUploaded(false);
      setCvAnalyzing(false);
      setCvAnalysisStatus('');
      
      // Clear form data that was imported from CV
      setFormData(prev => ({
        ...prev,
        workExperience: [],
        education: [],
        // Keep other fields that user might have manually entered
      }));
      
      // Navigate back to Step 1
      setCurrentStep(1);
      
      toast.success('CV data deleted successfully. You can now upload a new CV.');
    } catch (error) {
      console.error('Error deleting CV data:', error);
      toast.error('Failed to delete CV data. Please try again.');
    } finally {
      setIsLoading(false);
      setCvAnalysisStatus('');
    }
  };

  const handleNext = async () => {
    try {
      // Save current step data before proceeding
      await saveStepData(false);
      
      // Generate personalized suggestions after completing step 5
      if (currentStep === 5) {
        if (!personalizedSuggestions) {
          await generatePersonalizedSuggestions();
        }
        // Wait a bit to ensure suggestions are ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveStepData = async (isAutoSave = false) => {
    if (isAutoSave) {
      setIsAutoSaving(true);
    } else {
      setIsSaving(true);
    }
    
    try {
      // Map step data to profile sections
      switch (currentStep) {
        case 2: // Work Experience
          await EmployeeProfileService.saveSection(employeeId, 'work_experience', {
            experience: formData.workExperience
          });
          break;
          
        case 3: // Education
          // Save all education entries
          const educationData = formData.education.length > 0 
            ? formData.education.map(edu => ({
                degree: edu.degree,
                field: edu.fieldOfStudy,
                institution: edu.institution,
                graduationYear: edu.graduationYear
              }))
            : [{
                degree: formData.highestDegree,
                field: formData.fieldOfStudy,
                institution: formData.institution,
                graduationYear: formData.graduationYear
              }];
          
          await EmployeeProfileService.saveSection(employeeId, 'education', {
            education: educationData
          });
          break;
          
        case 4: // Skills Review
          // Skills are now validated through SkillsValidationCards component
          // No need to save here as it's handled by the component
          break;
          
        case 5: // Current Work
          await EmployeeProfileService.saveSection(employeeId, 'current_work', {
            projects: formData.currentProjects,
            teamSize: formData.teamSize,
            role: formData.roleInTeam
          });
          break;
          
        case 6: // Challenges
          await EmployeeProfileService.saveSection(employeeId, 'daily_tasks', {
            challenges: formData.challenges
          });
          break;
          
        case 7: // Growth Areas
          await EmployeeProfileService.saveSection(employeeId, 'tools_technologies', {
            growthAreas: formData.growthAreas
          });
          
          // Mark profile as complete
          if (currentStep === STEPS.length) {
            await EmployeeProfileService.completeProfile(employeeId);
          }
          break;
      }
      
      setLastSaved(new Date());
      
      if (isAutoSave) {
        // Show subtle success indicator for auto-save
        console.log('Auto-saved profile data');
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      if (!isAutoSave) {
        toast.error('Failed to save progress');
      }
    } finally {
      if (isAutoSave) {
        setIsAutoSaving(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveStepData(true);
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [saveStepData]);

  // Trigger auto-save when form data changes
  const handleFormChange = useCallback((updater: (prev: FormData) => FormData) => {
    setFormData(updater);
    debouncedAutoSave();
  }, [debouncedAutoSave]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update the "saved ago" time every minute
  useEffect(() => {
    if (!lastSaved) return;
    
    const interval = setInterval(() => {
      // Force re-render to update the time display
      setLastSaved(prev => prev);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastSaved]);

  const generatePersonalizedSuggestions = async (retryCount = 0) => {
    try {
      setIsGeneratingSuggestions(true);
      
      // Prepare step data including current projects, team size, and role
      const stepData = {
        currentProjects: formData.currentProjects,
        teamSize: formData.teamSize,
        roleInTeam: formData.roleInTeam
      };
      
      const { data, error } = await supabase.functions.invoke('generate-profile-suggestions', {
        body: { 
          employee_id: employeeId,
          step_data: stepData
        }
      });
      
      if (error) throw error;
      
      if (data?.challenges && data?.growthAreas) {
        setPersonalizedSuggestions({
          challenges: data.challenges,
          growthAreas: data.growthAreas
        });
        
        // Update form data with personalized suggestions
        handleFormChange(prev => ({
          ...prev,
          challenges: [],
          growthAreas: []
        }));
        
        toast.success('Your personalized career roadmap is ready!');
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      
      // Retry logic
      if (retryCount < 2) {
        toast.info('Taking a bit longer... retrying');
        setTimeout(() => generatePersonalizedSuggestions(retryCount + 1), 2000);
      } else {
        // Final fallback - generate basic suggestions based on position
        generateFallbackSuggestions();
      }
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };
  
  const generateFallbackSuggestions = () => {
    // Basic fallback based on position/role
    const basicChallenges = [
      `Improving efficiency in ${formData.currentProjects[0] || 'current projects'}`,
      `Collaborating effectively with ${formData.teamSize || 'the team'}`,
      'Staying updated with industry best practices',
      'Balancing technical work with communication',
      'Managing time across multiple priorities',
      'Building deeper expertise in core technologies',
      'Contributing to team knowledge sharing',
      'Improving code quality and documentation',
      'Understanding business impact of technical decisions',
      'Developing problem-solving strategies',
      'Building resilience and adaptability',
      'Enhancing stakeholder communication'
    ];
    
    const basicGrowthAreas: string[] = [
      'Advanced technical skills in your domain',
      'Leadership and mentoring abilities',
      'Project management fundamentals',
      'Cloud and infrastructure knowledge',
      'Data analysis and insights',
      'Security best practices',
      'Performance optimization techniques',
      'Testing and quality assurance',
      'Communication and presentation skills',
      'Strategic thinking and planning',
      'Innovation and creative problem solving',
      'Cross-functional collaboration'
    ];
    
    setPersonalizedSuggestions({
      challenges: basicChallenges,
      growthAreas: basicGrowthAreas
    });
    
    toast.info('Created suggestions based on your role');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // CV Upload
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              
              {cvAnalyzing ? (
                <div className="space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-800 font-medium">{cvAnalysisStatus || 'Processing...'}</p>
                    <p className="text-xs text-gray-500">This usually takes 30-60 seconds</p>
                  </div>
                  
                  {/* Progress dots */}
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-500",
                          index <= cvAnalysisStep
                            ? "bg-primary scale-110"
                            : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 italic">
                      {cvAnalysisStep < 2 && "Securing your data..."}
                      {cvAnalysisStep >= 2 && cvAnalysisStep < 4 && "Our AI is working hard..."}
                      {cvAnalysisStep >= 4 && cvAnalysisStep < 6 && "Finding your unique strengths..."}
                      {cvAnalysisStep >= 6 && "Finalizing your profile..."}
                    </p>
                  </div>
                </div>
              ) : cvUploaded ? (
                <div className="space-y-3">
                  <Check className="h-8 w-8 mx-auto text-green-600" />
                  <p className="text-sm text-gray-600">CV imported successfully!</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCV}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Upload Different CV
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="cv-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleCVUpload}
                  />
                  <label htmlFor="cv-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CV
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, DOC, DOCX, or TXT accepted
                  </p>
                </>
              )}
            </div>
          </div>
        );
        
      case 2: // Work Experience
        return (
          <div className="space-y-4">
            {/* CV Delete/Re-upload Option */}
            {(cvUploaded || employeeData?.cv_file_path) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Want to upload a different CV?
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        This will delete all CV-imported data and let you start fresh.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCV}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete CV
                  </Button>
                </div>
              </div>
            )}
            {formData.workExperience.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No work experience added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Add first experience
                    handleFormChange(prev => ({
                      ...prev,
                      workExperience: [{
                        title: '',
                        company: '',
                        duration: '',
                        description: '',
                        responsibilities: [],
                        achievements: [],
                        technologies: []
                      }]
                    }));
                  }}
                >
                  Add Your First Role
                </Button>
              </div>
            ) : (
              <>
                {/* Sort work experience by date (most recent first) */}
                {[...formData.workExperience]
                  .sort((a, b) => {
                    // Check if either duration contains "Present" or "Current"
                    const aIsPresent = a.duration.toLowerCase().includes('present') || a.duration.toLowerCase().includes('current');
                    const bIsPresent = b.duration.toLowerCase().includes('present') || b.duration.toLowerCase().includes('current');
                    
                    if (aIsPresent && !bIsPresent) return -1;
                    if (!aIsPresent && bIsPresent) return 1;
                    if (aIsPresent && bIsPresent) return 0;
                    
                    // Extract years from duration strings
                    const aYears = a.duration.match(/\b(19|20)\d{2}\b/g) || [];
                    const bYears = b.duration.match(/\b(19|20)\d{2}\b/g) || [];
                    
                    const aMaxYear = aYears.length > 0 ? Math.max(...aYears.map(Number)) : 0;
                    const bMaxYear = bYears.length > 0 ? Math.max(...bYears.map(Number)) : 0;
                    
                    return bMaxYear - aMaxYear;
                  })
                  .map((exp, index) => {
                    const originalIndex = formData.workExperience.indexOf(exp);
                    return (
                      <div key={originalIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900">Position {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleFormChange(prev => ({
                                ...prev,
                                workExperience: prev.workExperience.filter((_, i) => i !== originalIndex)
                              }));
                            }}
                            className="text-red-600 hover:text-red-700 -mt-1 -mr-2"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`title-${originalIndex}`} className="text-xs text-gray-600">
                              Job Title
                            </Label>
                            <Input
                              id={`title-${originalIndex}`}
                              value={exp.title}
                              onChange={(e) => {
                                const newExperience = [...formData.workExperience];
                                newExperience[originalIndex].title = e.target.value;
                                handleFormChange(prev => ({ ...prev, workExperience: newExperience }));
                              }}
                              placeholder="e.g. Senior Developer"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`company-${originalIndex}`} className="text-xs text-gray-600">
                              Company
                            </Label>
                            <Input
                              id={`company-${originalIndex}`}
                              value={exp.company}
                              onChange={(e) => {
                                const newExperience = [...formData.workExperience];
                                newExperience[originalIndex].company = e.target.value;
                                handleFormChange(prev => ({ ...prev, workExperience: newExperience }));
                              }}
                              placeholder="e.g. Tech Corp"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`duration-${originalIndex}`} className="text-xs text-gray-600">
                            Duration
                          </Label>
                          <Input
                            id={`duration-${originalIndex}`}
                            value={exp.duration}
                            onChange={(e) => {
                              const newExperience = [...formData.workExperience];
                              newExperience[originalIndex].duration = e.target.value;
                              handleFormChange(prev => ({ ...prev, workExperience: newExperience }));
                            }}
                            placeholder="e.g. Jan 2020 - Present"
                            className="mt-1"
                          />
                        </div>
                        
                        {/* Show extracted CV data if available */}
                        {(exp.responsibilities?.length > 0 || exp.achievements?.length > 0 || exp.technologies?.length > 0) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                            <p className="text-xs font-medium text-blue-900">Extracted from your CV:</p>
                            
                            {exp.responsibilities?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Responsibilities:</p>
                                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                  {exp.responsibilities.map((resp, idx) => (
                                    <li key={idx}>{resp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {exp.achievements?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Key Achievements:</p>
                                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                  {exp.achievements.map((ach, idx) => (
                                    <li key={idx}>{ach}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {exp.technologies?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Technologies Used:</p>
                                <div className="flex flex-wrap gap-1">
                                  {exp.technologies.map((tech, idx) => (
                                    <span 
                                      key={idx}
                                      className="px-2 py-0.5 bg-white text-xs text-gray-700 rounded-full border border-gray-200"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor={`description-${originalIndex}`} className="text-xs text-gray-600">
                            {(exp.responsibilities?.length > 0 || exp.achievements?.length > 0) 
                              ? 'Additional Notes (Optional)' 
                              : 'Key Achievements / Responsibilities'
                            }
                          </Label>
                          <Textarea
                            id={`description-${originalIndex}`}
                            value={exp.description}
                            onChange={(e) => {
                              const newExperience = [...formData.workExperience];
                              newExperience[originalIndex].description = e.target.value;
                              handleFormChange(prev => ({ ...prev, workExperience: newExperience }));
                            }}
                            placeholder={
                              (exp.responsibilities?.length > 0 || exp.achievements?.length > 0)
                                ? "Add any additional notes or context..."
                                : "Describe your key achievements and responsibilities..."
                            }
                            className="mt-1 min-h-[80px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleFormChange(prev => ({
                      ...prev,
                      workExperience: [...prev.workExperience, {
                        title: '',
                        company: '',
                        duration: '',
                        description: '',
                        responsibilities: [],
                        achievements: [],
                        technologies: []
                      }]
                    }));
                  }}
                  className="w-full border-gray-300 hover:border-gray-400"
                >
                  + Add Another Role
                </Button>
              </>
            )}
          </div>
        );
        
      case 3: // Education
        return (
          <div className="space-y-4">
            {formData.education.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No education added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Add first education entry
                    handleFormChange(prev => ({
                      ...prev,
                      education: [{
                        degree: '',
                        fieldOfStudy: '',
                        institution: '',
                        graduationYear: ''
                      }]
                    }));
                  }}
                >
                  Add Your Education
                </Button>
              </div>
            ) : (
              <>
                {/* Sort education by graduation year (most recent first) */}
                {[...formData.education]
                  .sort((a, b) => {
                    const aYear = parseInt(a.graduationYear) || 0;
                    const bYear = parseInt(b.graduationYear) || 0;
                    return bYear - aYear;
                  })
                  .map((edu, index) => {
                    const originalIndex = formData.education.indexOf(edu);
                    return (
                      <div key={originalIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900">Education {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleFormChange(prev => ({
                                ...prev,
                                education: prev.education.filter((_, i) => i !== originalIndex)
                              }));
                            }}
                            className="text-red-600 hover:text-red-700 -mt-1 -mr-2"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`degree-${originalIndex}`} className="text-xs text-gray-600">
                              Degree
                            </Label>
                            <Select
                              value={edu.degree}
                              onValueChange={(value) => {
                                const newEducation = [...formData.education];
                                newEducation[originalIndex].degree = value;
                                handleFormChange(prev => ({ ...prev, education: newEducation }));
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select degree" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High School">High School</SelectItem>
                                <SelectItem value="Associate">Associate Degree</SelectItem>
                                <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                                <SelectItem value="Master">Master's Degree</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`field-${originalIndex}`} className="text-xs text-gray-600">
                              Field of Study
                            </Label>
                            <Input
                              id={`field-${originalIndex}`}
                              value={edu.fieldOfStudy}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[originalIndex].fieldOfStudy = e.target.value;
                                handleFormChange(prev => ({ ...prev, education: newEducation }));
                              }}
                              placeholder="e.g. Computer Science"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`institution-${originalIndex}`} className="text-xs text-gray-600">
                              Institution
                            </Label>
                            <Input
                              id={`institution-${originalIndex}`}
                              value={edu.institution}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[originalIndex].institution = e.target.value;
                                handleFormChange(prev => ({ ...prev, education: newEducation }));
                              }}
                              placeholder="e.g. MIT"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`year-${originalIndex}`} className="text-xs text-gray-600">
                              Graduation Year
                            </Label>
                            <Input
                              id={`year-${originalIndex}`}
                              value={edu.graduationYear}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[originalIndex].graduationYear = e.target.value;
                                handleFormChange(prev => ({ ...prev, education: newEducation }));
                              }}
                              placeholder="e.g. 2020"
                              maxLength={4}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleFormChange(prev => ({
                      ...prev,
                      education: [...prev.education, {
                        degree: '',
                        fieldOfStudy: '',
                        institution: '',
                        graduationYear: ''
                      }]
                    }));
                  }}
                  className="w-full border-gray-300 hover:border-gray-400"
                >
                  + Add Another Degree
                </Button>
              </>
            )}
          </div>
        );
        
      case 4: // Skills Review
        return (
          <SkillsValidationCards
            employeeId={employeeId}
            onComplete={async () => {
              // Save skills validation data
              await saveStepData(false);
              
              // Start generating suggestions early
              if (!personalizedSuggestions && !isGeneratingSuggestions) {
                generatePersonalizedSuggestions();
              }
              
              // Auto-advance to next step
              if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
              }
            }}
          />
        );
        
        
      case 5: // Current Projects
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2">
                What are you currently working on?
              </Label>
              <Textarea
                placeholder="Describe your main projects and responsibilities..."
                className="mt-2 min-h-[120px]"
                onChange={(e) => {
                  const projects = e.target.value.split('\n').filter(p => p.trim());
                  handleFormChange(prev => ({ ...prev, currentProjects: projects }));
                }}
              />
            </div>
            
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2">
                Team Size
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['Working alone', '2-5 people', '6-10 people', '10+ people'].map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.teamSize === size ? 'default' : 'outline'}
                    onClick={() => handleFormChange(prev => ({ ...prev, teamSize: size }))}
                    className={cn(
                      "text-sm",
                      formData.teamSize === size
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2">
                Your Role
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['Individual Contributor', 'Team Lead', 'Manager'].map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={formData.roleInTeam === role ? 'default' : 'outline'}
                    onClick={() => handleFormChange(prev => ({ ...prev, roleInTeam: role }))}
                    className={cn(
                      "text-sm",
                      formData.roleInTeam === role
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 6: // Challenges
        if (!personalizedSuggestions?.challenges) {
          return (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-gray-600">Analyzing your profile to create personalized challenges...</p>
              <p className="text-sm text-gray-500 mt-2">This takes about 10-15 seconds</p>
            </div>
          );
        }
        
        // Progressive disclosure - show 3 initially, +2 for each selection
        const selectedCount = formData.challenges.length;
        const visibleCount = Math.min(3 + (selectedCount * 2), personalizedSuggestions.challenges.length);
        const visibleChallenges = personalizedSuggestions.challenges.slice(0, visibleCount);
        const hasMore = visibleCount < personalizedSuggestions.challenges.length;
        
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">🎯 What challenges are you facing?</p>
              <p className="text-xs text-blue-700 mt-1">Select what resonates with you</p>
            </div>
            
            {/* Progressive reveal list */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge}
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200",
                        "hover:shadow-md border-2",
                        formData.challenges.includes(challenge)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                      onClick={() => {
                        handleFormChange(prev => ({
                          ...prev,
                          challenges: prev.challenges.includes(challenge)
                            ? prev.challenges.filter(c => c !== challenge)
                            : [...prev.challenges, challenge]
                        }));
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          formData.challenges.includes(challenge)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100"
                        )}>
                          {formData.challenges.includes(challenge) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-relaxed",
                            formData.challenges.includes(challenge)
                              ? "text-blue-900 font-medium"
                              : "text-gray-700"
                          )}>
                            {challenge}
                          </p>
                          {formData.challenges.includes(challenge) && (
                            <p className="text-xs text-blue-600 mt-1">✓ Selected</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3"
                >
                  <p className="text-sm text-gray-500">
                    {selectedCount === 0 
                      ? "Select a challenge to see more options"
                      : `${personalizedSuggestions.challenges.length - visibleCount} more challenges available`
                    }
                  </p>
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: Math.ceil(personalizedSuggestions.challenges.length / 3) }).map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i * 3 < visibleCount ? "bg-blue-600" : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            {formData.challenges.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">
                  {formData.challenges.length} challenge{formData.challenges.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        );
        
      case 7: // Growth Areas
        if (!personalizedSuggestions?.growthAreas) {
          return (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-gray-600">Identifying growth opportunities for your career...</p>
              <p className="text-sm text-gray-500 mt-2">Almost done!</p>
            </div>
          );
        }
        
        // Progressive disclosure - show 3 initially, +1 for each selection up to 5 selections
        const growthSelectedCount = formData.growthAreas.length;
        const growthVisibleCount = Math.min(
          3 + growthSelectedCount, 
          personalizedSuggestions.growthAreas.length,
          8 // Cap at 8 visible to keep it manageable
        );
        const visibleGrowthAreas = personalizedSuggestions.growthAreas.slice(0, growthVisibleCount);
        const growthHasMore = growthVisibleCount < personalizedSuggestions.growthAreas.length;
        
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium">🌱 Where do you want to grow?</p>
              <p className="text-xs text-green-700 mt-1">Choose up to 5 areas to focus on</p>
            </div>
            
            {/* Progressive reveal list */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleGrowthAreas.map((area, index) => (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200",
                        "hover:shadow-md border-2",
                        formData.growthAreas.includes(area)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 bg-white",
                        !formData.growthAreas.includes(area) && formData.growthAreas.length >= 5 && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (formData.growthAreas.includes(area)) {
                          handleFormChange(prev => ({
                            ...prev,
                            growthAreas: prev.growthAreas.filter(a => a !== area)
                          }));
                        } else if (formData.growthAreas.length < 5) {
                          handleFormChange(prev => ({
                            ...prev,
                            growthAreas: [...prev.growthAreas, area]
                          }));
                        } else {
                          toast.error('You can select up to 5 growth areas');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          formData.growthAreas.includes(area)
                            ? "bg-green-600 text-white"
                            : formData.growthAreas.length >= 5
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gray-100"
                        )}>
                          {formData.growthAreas.includes(area) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">
                              {formData.growthAreas.length >= 5 ? '🔒' : index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-relaxed",
                            formData.growthAreas.includes(area)
                              ? "text-green-900 font-medium"
                              : formData.growthAreas.length >= 5
                              ? "text-gray-400"
                              : "text-gray-700"
                          )}>
                            {area}
                          </p>
                          {formData.growthAreas.includes(area) && (
                            <p className="text-xs text-green-600 mt-1">✓ Selected priority</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {growthHasMore && formData.growthAreas.length < 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3"
                >
                  <p className="text-sm text-gray-500">
                    Select more to reveal additional growth opportunities
                  </p>
                </motion.div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Selected priorities</span>
                <span className="text-sm font-medium">{formData.growthAreas.length} of 5</span>
              </div>
              <Progress value={(formData.growthAreas.length / 5) * 100} className="mt-2 h-2" />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];
  const StepIcon = currentStepData.icon;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
            <div className="flex items-center gap-3">
              {/* Auto-save status indicator */}
              <div className="flex items-center gap-1 text-xs">
                {isAutoSaving ? (
                  <>
                    <Save className="h-3 w-3 text-blue-600 animate-pulse" />
                    <span className="text-blue-600">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      {(() => {
                        const timeDiff = Date.now() - lastSaved.getTime();
                        const minutes = Math.round(timeDiff / 60000);
                        if (minutes < 1) return 'Just saved';
                        if (minutes === 1) return 'Saved 1m ago';
                        return `Saved ${minutes}m ago`;
                      })()} 
                    </span>
                  </>
                ) : null}
              </div>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white border-gray-200 shadow-sm">
            <div className="p-8">
              {/* Step Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <StepIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600">
                  {currentStepData.subtitle}
                </p>
              </div>

              {/* Step Form */}
              <div className="mb-8">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={cn(
                    "border-gray-300 text-gray-700 hover:bg-gray-50",
                    currentStep === 1 && "opacity-0 pointer-events-none"
                  )}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                <Button
                  onClick={async () => {
                    if (currentStep === STEPS.length) {
                      // Final step - complete profile
                      await saveStepData(false);
                      setIsCompleted(true);
                    } else {
                      handleNext();
                    }
                  }}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : currentStep === STEPS.length ? (
                    'Complete Setup'
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}