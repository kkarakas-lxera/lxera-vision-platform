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
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import WhatsNewSection from '@/pages/learner/profileSections/WhatsNewSection';

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
  
  // What's New
  recentCertifications: string[];
  languages: string[];
  recentSkills: string[];
  
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
    title: "What's New Since Your CV?",
    subtitle: "Recent certifications, languages, and skills",
    icon: Brain,
    fields: ['recentCertifications', 'languages', 'recentSkills']
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

const CHALLENGES = [
  'Keeping up with new technologies',
  'Scaling applications',
  'Code quality and best practices',
  'System architecture decisions',
  'Performance optimization',
  'Security implementation',
  'Legacy code maintenance',
  'Team collaboration',
  'Time management',
  'Stakeholder communication',
  'Project planning',
  'Documentation'
];

const GROWTH_AREAS = [
  'Cloud Architecture (AWS/Azure)',
  'Kubernetes & Container Orchestration',
  'Machine Learning & AI',
  'Blockchain Technology',
  'Advanced Database Design',
  'Microservices Architecture',
  'Mobile Development',
  'Technical Leadership',
  'System Design & Architecture',
  'Project Management',
  'DevOps Practices',
  'Agile Methodologies'
];


export default function ProfileCompletionFlow({ employeeId, onComplete }: ProfileCompletionFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvAnalysisStatus, setCvAnalysisStatus] = useState<string>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Position skills state
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [positionSkills, setPositionSkills] = useState<any[]>([]);
  
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
    recentCertifications: [],
    languages: [],
    recentSkills: [],
    currentProjects: [],
    teamSize: '',
    roleInTeam: '',
    challenges: [],
    growthAreas: []
  });

  useEffect(() => {
    loadEmployeeData();
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
        
        // Use position title and department from linked position if available
        const currentPosition = employee.st_company_positions?.position_title || employee.position || '';
        const department = employee.st_company_positions?.department || employee.department || '';
        
        setFormData(prev => ({
          ...prev,
          currentPosition,
          department
        }));
        
        // Load position skills if available
        if (employee.st_company_positions?.required_skills) {
          setPositionSkills(employee.st_company_positions.required_skills);
        } else if (employee.position) {
          // Try to find position by code if not linked
          const { data: position } = await supabase
            .from('st_company_positions')
            .select('required_skills')
            .eq('position_code', employee.position)
            .eq('company_id', employee.company_id)
            .single();
            
          if (position?.required_skills) {
            setPositionSkills(position.required_skills);
          }
        }
        
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
              if (section.data.experiences) {
                // Map CV imported data to form structure
                restoredFormData.workExperience = section.data.experiences.map((exp: any) => ({
                  title: exp.position || '',
                  company: exp.company || '',
                  duration: exp.dates || '',
                  description: exp.key_achievements?.join('\n') || ''
                }));
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 2);
                }
              } else if (section.data.experience) {
                restoredFormData.workExperience = section.data.experience;
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
            case 'certifications':
              if (section.data?.certifications) {
                restoredFormData.recentCertifications = section.data.certifications;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 4);
                }
              }
              break;
            case 'languages':
              if (section.data?.languages) {
                restoredFormData.languages = section.data.languages;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 4);
                }
              }
              break;
            case 'skills':
              if (section.data?.skills) {
                restoredFormData.recentSkills = section.data.skills;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 4);
                }
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

      // Restore step position - go to next step after last completed
      if (lastCompletedStep > 0) {
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
    setCvAnalysisStatus('Uploading CV...');
    

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
    }
  };

  const handleNext = async () => {
    try {
      // Save current step data before proceeding
      await saveStepData(false);
      
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
          
        case 4: // What's New Since Your CV
          // Save certifications, languages, and skills separately
          if (formData.recentCertifications.length > 0) {
            await EmployeeProfileService.saveSection(employeeId, 'certifications', {
              certifications: formData.recentCertifications
            });
          }
          if (formData.languages.length > 0) {
            await EmployeeProfileService.saveSection(employeeId, 'languages', {
              languages: formData.languages
            });
          }
          if (formData.recentSkills.length > 0) {
            await EmployeeProfileService.saveSection(employeeId, 'skills', {
              skills: formData.recentSkills
            });
          }
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
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-gray-600 font-medium">{cvAnalysisStatus || 'Processing...'}</p>
                  <p className="text-xs text-gray-500">This may take up to a minute</p>
                </div>
              ) : cvUploaded ? (
                <div className="space-y-3">
                  <Check className="h-8 w-8 mx-auto text-green-600" />
                  <p className="text-sm text-gray-600">CV imported successfully!</p>
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
                        description: ''
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
                        
                        <div>
                          <Label htmlFor={`description-${originalIndex}`} className="text-xs text-gray-600">
                            Key Achievements / Responsibilities
                          </Label>
                          <Textarea
                            id={`description-${originalIndex}`}
                            value={exp.description}
                            onChange={(e) => {
                              const newExperience = [...formData.workExperience];
                              newExperience[originalIndex].description = e.target.value;
                              handleFormChange(prev => ({ ...prev, workExperience: newExperience }));
                            }}
                            placeholder="Describe your key achievements and responsibilities..."
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
                        description: ''
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
        
      case 4: // What's New
        return (
          <WhatsNewSection
            formData={{
              recentCertifications: formData.recentCertifications,
              languages: formData.languages,
              recentSkills: formData.recentSkills
            }}
            onChange={(data) => {
              handleFormChange(prev => ({
                ...prev,
                ...data
              }));
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
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CHALLENGES.map((challenge) => (
                <Button
                  key={challenge}
                  type="button"
                  variant={formData.challenges.includes(challenge) ? 'default' : 'outline'}
                  onClick={() => {
                    handleFormChange(prev => ({
                      ...prev,
                      challenges: prev.challenges.includes(challenge)
                        ? prev.challenges.filter(c => c !== challenge)
                        : [...prev.challenges, challenge]
                    }));
                  }}
                  className={cn(
                    "text-sm justify-start",
                    formData.challenges.includes(challenge)
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  {formData.challenges.includes(challenge) && <Check className="h-4 w-4 mr-2" />}
                  {challenge}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 7: // Growth Areas
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Select up to 5 priorities</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {GROWTH_AREAS.map((area) => (
                <Button
                  key={area}
                  type="button"
                  variant={formData.growthAreas.includes(area) ? 'default' : 'outline'}
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
                  className={cn(
                    "text-sm justify-start",
                    formData.growthAreas.includes(area)
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "border-gray-300 hover:border-gray-400",
                    !formData.growthAreas.includes(area) && formData.growthAreas.length >= 5 && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!formData.growthAreas.includes(area) && formData.growthAreas.length >= 5}
                >
                  {formData.growthAreas.includes(area) && <Check className="h-4 w-4 mr-2" />}
                  {area}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {formData.growthAreas.length} of 5
            </p>
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
                      onComplete();
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