import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  
  // Skills
  technicalSkills: string[];
  skillLevels: Record<string, string>;
  
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
    title: "Confirm Your Current Role",
    subtitle: "Let's make sure we have your position details correct",
    icon: Briefcase,
    fields: ['currentPosition', 'department', 'timeInRole']
  },
  {
    id: 2,
    title: "Upload Your CV",
    subtitle: "Save time by letting us extract your experience",
    icon: FileText,
    fields: ['cv']
  },
  {
    id: 3,
    title: "Work Experience",
    subtitle: "Tell us about your professional journey",
    icon: Briefcase,
    fields: ['workExperience']
  },
  {
    id: 4,
    title: "Education Background",
    subtitle: "Your educational qualifications",
    icon: GraduationCap,
    fields: ['highestDegree', 'fieldOfStudy', 'institution', 'graduationYear']
  },
  {
    id: 5,
    title: "Confirm Your Skills",
    subtitle: "Select skills relevant to your position",
    icon: Brain,
    fields: ['technicalSkills']
  },
  {
    id: 6,
    title: "Assess Your Proficiency",
    subtitle: "Rate your skill levels for gap analysis",
    icon: Target,
    fields: ['skillLevels']
  },
  {
    id: 7,
    title: "Current Projects",
    subtitle: "What are you working on?",
    icon: Wrench,
    fields: ['currentProjects', 'teamSize', 'roleInTeam']
  },
  {
    id: 8,
    title: "Professional Challenges",
    subtitle: "What challenges do you face?",
    icon: Clock,
    fields: ['challenges']
  },
  {
    id: 9,
    title: "Growth Opportunities",
    subtitle: "Which areas would help you excel?",
    icon: Target,
    fields: ['growthAreas']
  }
];

// Skills will be loaded from position requirements
interface PositionSkill {
  skill_id: string;
  skill_name: string;
  is_mandatory: boolean;
  proficiency_level: number;
  cv_matched?: boolean;
  selected?: boolean;
}

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

// Fuzzy skill matching function
const skillsMatch = (skill1: string, skill2: string): boolean => {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  const s1 = normalize(skill1);
  const s2 = normalize(skill2);
  
  // Exact match
  if (s1 === s2) return true;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Word overlap
  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w));
  
  // If more than 50% words match, consider it a match
  return commonWords.length >= Math.min(words1.length, words2.length) * 0.5;
};

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
  const [positionSkills, setPositionSkills] = useState<PositionSkill[]>([]);
  const [additionalSkills, setAdditionalSkills] = useState<string[]>([]);
  const [cvExtractedSkills, setCvExtractedSkills] = useState<any[]>([]);
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
    technicalSkills: [],
    skillLevels: {},
    currentProjects: [],
    teamSize: '',
    roleInTeam: '',
    challenges: [],
    growthAreas: []
  });

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);
  
  // Match CV skills with position requirements when both are loaded
  useEffect(() => {
    if (positionSkills.length > 0 && cvExtractedSkills.length > 0) {
      const matchedSkills = positionSkills.map(posSkill => {
        const cvMatch = cvExtractedSkills.find(cvSkill => 
          skillsMatch(cvSkill.skill_name, posSkill.skill_name)
        );
        
        return {
          ...posSkill,
          cv_matched: !!cvMatch,
          selected: !!cvMatch // Auto-select if found in CV
        };
      });
      
      setPositionSkills(matchedSkills);
      
      // Update form data with selected skills
      const selectedSkills = matchedSkills
        .filter(s => s.selected)
        .map(s => s.skill_name);
      setFormData(prev => ({ ...prev, technicalSkills: selectedSkills }));
    }
  }, [cvExtractedSkills]); // Only run when CV skills are loaded

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
        
        // Load CV extracted skills
        if (employee.st_employee_skills_profile?.[0]?.extracted_skills) {
          setCvExtractedSkills(employee.st_employee_skills_profile[0].extracted_skills);
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
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 1);
                }
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
                  lastCompletedStep = Math.max(lastCompletedStep, 3);
                }
              } else if (section.data.experience) {
                restoredFormData.workExperience = section.data.experience;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 3);
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
                  lastCompletedStep = Math.max(lastCompletedStep, 4);
                }
              }
              break;
            case 'skills':
              if (section.data.skills) {
                // Handle CV imported skills structure
                if (section.data.skills[0]?.skill_name) {
                  // CV imported structure
                  const technicalSkills = section.data.technicalSkills || section.data.skills.filter((s: any) => s.category === 'technical' || s.category === 'tool');
                  restoredFormData.technicalSkills = technicalSkills.map((s: any) => s.skill_name);
                  restoredFormData.skillLevels = technicalSkills.reduce((acc: any, s: any) => {
                    acc[s.skill_name] = s.proficiency_level?.toString() || '3';
                    return acc;
                  }, {});
                } else {
                  // Manual entry structure
                  restoredFormData.technicalSkills = section.data.skills.map((s: any) => s.name);
                  restoredFormData.skillLevels = section.data.skills.reduce((acc: any, s: any) => {
                    acc[s.name] = s.proficiency;
                    return acc;
                  }, {});
                }
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 6);
                }
              }
              break;
            case 'current_work':
              if (section.data.projects || section.data.teamSize || section.data.role) {
                restoredFormData.currentProjects = section.data.projects || '';
                restoredFormData.teamSize = section.data.teamSize || '';
                restoredFormData.roleInTeam = section.data.role || '';
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 7);
                }
              }
              break;
            case 'daily_tasks':
              if (section.data.challenges) {
                restoredFormData.challenges = section.data.challenges;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 8);
                }
              }
              break;
            case 'tools_technologies':
              if (section.data.growthAreas) {
                restoredFormData.growthAreas = section.data.growthAreas;
                if (section.isComplete) {
                  lastCompletedStep = Math.max(lastCompletedStep, 9);
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
    
    let realtimeChannel: any = null;

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
      
      // Function to import CV data
      const importCVData = async () => {
        setCvAnalysisStatus('Importing data into your profile...');
        
        const { error: importError } = await supabase.functions.invoke('import-cv-to-profile', {
          body: {
            employeeId
          }
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
        
        // Cleanup realtime subscription
        if (realtimeChannel) {
          await supabase.removeChannel(realtimeChannel);
        }
      };
      
      // Get the session ID from the response
      const sessionId = analysisResult?.session_id;
      
      // If we have a session ID, subscribe to realtime updates
      if (sessionId) {
        realtimeChannel = supabase
          .channel(`cv-analysis-${sessionId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cv_analysis_status',
              filter: `session_id=eq.${sessionId}`
            },
            (payload) => {
              if (payload.new) {
                const { status, progress, message } = payload.new as any;
                setCvAnalysisStatus(message || status);
                
                // If analysis is completed, proceed with import
                if (status === 'completed') {
                  importCVData();
                }
              }
            }
          )
          .subscribe();
      }
      
      // If analysis was successful but no session ID (backwards compatibility)
      // or if the edge function completed immediately
      if (analysisResult?.success && (!sessionId || analysisResult?.skills_extracted)) {
        // Wait a moment for any final processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Proceed with import directly
        await importCVData();
      }
      
    } catch (error) {
      console.error('CV upload error:', error);
      setCvAnalysisStatus('');
      toast.error('Failed to process CV. You can continue manually.');
      
      // Cleanup realtime subscription on error
      if (realtimeChannel) {
        await supabase.removeChannel(realtimeChannel);
      }
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
      const step = STEPS[currentStep - 1];
      
      // Map step data to profile sections
      switch (currentStep) {
        case 1: // Current Role
          await EmployeeProfileService.saveSection(employeeId, 'basic_info', {
            position: formData.currentPosition,
            department: formData.department,
            timeInRole: formData.timeInRole
          });
          
          // Also update the employees table with time_in_role
          await supabase
            .from('employees')
            .update({ time_in_role: formData.timeInRole })
            .eq('id', employeeId);
          break;
          
        case 3: // Work Experience
          await EmployeeProfileService.saveSection(employeeId, 'work_experience', {
            experience: formData.workExperience
          });
          break;
          
        case 4: // Education
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
          
        case 5: // Skills
        case 6: // Skill Levels
          {
            // Save skills with proficiency levels and position context
            const skills = formData.technicalSkills.map(skillName => {
              const positionSkill = positionSkills.find(ps => ps.skill_name === skillName);
              const proficiencyLevel = parseInt(formData.skillLevels[skillName] || '3');
              
              return {
                name: skillName,
                proficiency: proficiencyLevel.toString(),
                proficiency_level: proficiencyLevel,
                is_position_required: !!positionSkill,
                required_level: positionSkill?.proficiency_level || null,
                gap_score: positionSkill ? Math.max(0, positionSkill.proficiency_level - proficiencyLevel) : null
              };
            });
            
            await EmployeeProfileService.saveSection(employeeId, 'skills', { 
              skills,
              position_id: employeeData?.current_position_id || null,
              assessment_date: new Date().toISOString()
            });
          }
          break;
          
        case 7: // Current Work
          await EmployeeProfileService.saveSection(employeeId, 'current_work', {
            projects: formData.currentProjects,
            teamSize: formData.teamSize,
            role: formData.roleInTeam
          });
          break;
          
        case 8: // Challenges
          await EmployeeProfileService.saveSection(employeeId, 'daily_tasks', {
            challenges: formData.challenges
          });
          break;
          
        case 9: // Growth Areas
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
    const step = STEPS[currentStep - 1];
    
    switch (currentStep) {
      case 1: // Current Role
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Please confirm your assigned position details are correct:
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Current Position
                  </Label>
                  <div className="mt-1 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {formData.currentPosition || 'Not assigned'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Department
                  </Label>
                  <div className="mt-1 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {formData.department || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>
              
              {(!formData.currentPosition || !formData.department) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Your position details haven't been assigned yet. Please contact your HR administrator.
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="timeInRole" className="text-base font-medium text-gray-900 mb-2">
                Time in current role
              </Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {['< 6 months', '6m - 1y', '1-3 years', '3-5 years', '5+ years'].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={formData.timeInRole === option ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, timeInRole: option }))}
                    className={cn(
                      "text-sm",
                      formData.timeInRole === option
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 2: // CV Upload
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
        
      case 3: // Work Experience
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
        
      case 4: // Education
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
        
      case 5: // Position Skills
        return (
          <div className="space-y-6">
            {positionSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No position requirements found. Please contact your administrator.</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Please select all skills that you currently use in your work:
                  </p>
                </div>
                
                <div className="space-y-3">
                  {positionSkills.map((skill) => (
                    <label
                      key={skill.skill_id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        formData.technicalSkills.includes(skill.skill_name)
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.technicalSkills.includes(skill.skill_name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFormChange(prev => ({
                              ...prev,
                              technicalSkills: [...prev.technicalSkills, skill.skill_name]
                            }));
                          } else {
                            handleFormChange(prev => ({
                              ...prev,
                              technicalSkills: prev.technicalSkills.filter(s => s !== skill.skill_name)
                            }));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {skill.skill_name}
                          </span>
                          {skill.cv_matched && (
                            <Badge variant="secondary" className="text-xs">
                              Found in CV
                            </Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Additional skills input */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Add other skills you have
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Type a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const value = input.value.trim();
                          if (value && !additionalSkills.includes(value)) {
                            setAdditionalSkills([...additionalSkills, value]);
                            handleFormChange(prev => ({
                              ...prev,
                              technicalSkills: [...prev.technicalSkills, value]
                            }));
                            input.value = '';
                          }
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  {additionalSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {additionalSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="pr-1">
                          {skill}
                          <button
                            onClick={() => {
                              setAdditionalSkills(additionalSkills.filter(s => s !== skill));
                              handleFormChange(prev => ({
                                ...prev,
                                technicalSkills: prev.technicalSkills.filter(s => s !== skill)
                              }));
                            }}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
        
      case 6: // Skill Levels
        return (
          <div className="space-y-6">
            {formData.technicalSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please select skills in the previous step</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    How would you rate your proficiency with each skill?
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>1 = Beginner</span>
                    <span>3 = Competent</span>
                    <span>5 = Expert</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.technicalSkills.map((skillName) => {
                    const positionSkill = positionSkills.find(ps => ps.skill_name === skillName);
                    const currentLevel = parseInt(formData.skillLevels[skillName] || '3');
                    
                    return (
                      <div key={skillName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {skillName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={currentLevel}
                            onChange={(e) => {
                              handleFormChange(prev => ({
                                ...prev,
                                skillLevels: {
                                  ...prev.skillLevels,
                                  [skillName]: e.target.value
                                }
                              }));
                            }}
                            className="flex-1"
                          />
                          <Badge 
                            variant={currentLevel >= 4 ? "default" : currentLevel >= 2 ? "secondary" : "outline"}
                            className="min-w-[60px] text-center"
                          >
                            {currentLevel}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
              </>
            )}
          </div>
        );
        
      case 7: // Current Projects
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
        
      case 8: // Challenges
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
        
      case 9: // Growth Areas
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