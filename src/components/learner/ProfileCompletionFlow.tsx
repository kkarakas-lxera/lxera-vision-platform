import React, { useState, useEffect } from 'react';
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
  FileText
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
  
  // Education
  highestDegree: string;
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
    title: "Upload Your CV (Optional)",
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
    title: "Technical Skills",
    subtitle: "Select all skills you currently use",
    icon: Brain,
    fields: ['technicalSkills']
  },
  {
    id: 6,
    title: "Rate Your Expertise",
    subtitle: "How would you rate your proficiency?",
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

const TECHNICAL_SKILLS = [
  // Programming Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  // Frameworks
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring', '.NET', 'Express',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
  // Other
  'Machine Learning', 'Data Analysis', 'System Design', 'Microservices', 'REST APIs', 'GraphQL'
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
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    currentPosition: '',
    department: '',
    timeInRole: '',
    workExperience: [],
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

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      
      // Get employee data
      const { data: employee } = await supabase
        .from('employees')
        .select('*, companies!inner(name)')
        .eq('id', employeeId)
        .single();

      if (employee) {
        setFormData(prev => ({
          ...prev,
          currentPosition: employee.position || '',
          department: employee.department || ''
        }));
      }

      // Get existing profile sections
      const sections = await EmployeeProfileService.getProfileSections(employeeId);
      
      // Pre-fill from existing data
      sections.forEach(section => {
        if (section.data) {
          // Handle different section types
          switch (section.name) {
            case 'basic_info':
              // Basic info handled above
              break;
            case 'work_experience':
              if (section.data.experience) {
                setFormData(prev => ({
                  ...prev,
                  workExperience: section.data.experience
                }));
              }
              break;
            case 'education':
              if (section.data.education?.length > 0) {
                const edu = section.data.education[0];
                setFormData(prev => ({
                  ...prev,
                  highestDegree: edu.degree || '',
                  fieldOfStudy: edu.field || '',
                  institution: edu.institution || '',
                  graduationYear: edu.graduationYear || ''
                }));
              }
              break;
            case 'skills':
              if (section.data.skills) {
                setFormData(prev => ({
                  ...prev,
                  technicalSkills: section.data.skills.map((s: any) => s.name),
                  skillLevels: section.data.skills.reduce((acc: any, s: any) => {
                    acc[s.name] = s.proficiency;
                    return acc;
                  }, {})
                }));
              }
              break;
          }
        }
      });
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

    try {
      // Upload CV
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(`${employeeId}/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Use the existing CV analysis edge function
      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-cv-enhanced', {
        body: { 
          cvPath: cvData.path,
          employeeId,
          extractProfile: true // Request profile data extraction
        }
      });

      if (analyzeError) throw analyzeError;

      setCvUploaded(true);
      toast.success('CV imported successfully! Your information has been pre-filled.');
      
      // Reload data to get imported information
      await loadEmployeeData();
      
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to process CV. You can continue manually.');
    } finally {
      setCvAnalyzing(false);
    }
  };

  const handleNext = async () => {
    // Save current step data
    await saveStepData();
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveStepData = async () => {
    setIsSaving(true);
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
          await EmployeeProfileService.saveSection(employeeId, 'education', {
            education: [{
              degree: formData.highestDegree,
              field: formData.fieldOfStudy,
              institution: formData.institution,
              graduationYear: formData.graduationYear
            }]
          });
          break;
          
        case 5: // Skills
        case 6: // Skill Levels
          const skills = formData.technicalSkills.map(skill => ({
            name: skill,
            proficiency: formData.skillLevels[skill] || 'Beginner'
          }));
          await EmployeeProfileService.saveSection(employeeId, 'skills', { skills });
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
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep - 1];
    
    switch (currentStep) {
      case 1: // Current Role
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="position" className="text-base font-medium text-gray-900 mb-2">
                Current Position
              </Label>
              <Input
                id="position"
                value={formData.currentPosition}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))}
                className="mt-2"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            
            <div>
              <Label htmlFor="department" className="text-base font-medium text-gray-900 mb-2">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2">
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
                  <p className="text-sm text-gray-600">Analyzing your CV...</p>
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
                    setFormData(prev => ({
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
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">{exp.title || 'New Position'}</h4>
                    <p className="text-sm text-gray-600">
                      {exp.company || 'Company'} • {exp.duration || 'Duration'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
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
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium text-gray-900 mb-2">
                Highest Degree
              </Label>
              <Select
                value={formData.highestDegree}
                onValueChange={(value) => setFormData(prev => ({ ...prev, highestDegree: value }))}
              >
                <SelectTrigger className="mt-2">
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
              <Label htmlFor="field" className="text-base font-medium text-gray-900 mb-2">
                Field of Study
              </Label>
              <Input
                id="field"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                className="mt-2"
                placeholder="e.g. Computer Science"
              />
            </div>
            
            <div>
              <Label htmlFor="institution" className="text-base font-medium text-gray-900 mb-2">
                Institution
              </Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                className="mt-2"
                placeholder="e.g. University of Technology"
              />
            </div>
            
            <div>
              <Label htmlFor="year" className="text-base font-medium text-gray-900 mb-2">
                Graduation Year
              </Label>
              <Input
                id="year"
                value={formData.graduationYear}
                onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                className="mt-2"
                placeholder="e.g. 2020"
                maxLength={4}
              />
            </div>
          </div>
        );
        
      case 5: // Technical Skills
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Search skills..."
                className="mb-4"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TECHNICAL_SKILLS.map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant={formData.technicalSkills.includes(skill) ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      technicalSkills: prev.technicalSkills.includes(skill)
                        ? prev.technicalSkills.filter(s => s !== skill)
                        : [...prev.technicalSkills, skill]
                    }));
                  }}
                  className={cn(
                    "text-sm justify-start",
                    formData.technicalSkills.includes(skill)
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  {formData.technicalSkills.includes(skill) && <Check className="h-4 w-4 mr-2" />}
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 6: // Skill Levels
        return (
          <div className="space-y-6">
            {formData.technicalSkills.map((skill, index) => (
              <div key={skill} className="space-y-2">
                <h4 className="font-medium text-gray-900">{skill}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={formData.skillLevels[skill] === level ? 'default' : 'outline'}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          skillLevels: {
                            ...prev.skillLevels,
                            [skill]: level
                          }
                        }));
                      }}
                      className={cn(
                        "text-sm",
                        formData.skillLevels[skill] === level
                          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
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
                  setFormData(prev => ({ ...prev, currentProjects: projects }));
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
                    onClick={() => setFormData(prev => ({ ...prev, teamSize: size }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, roleInTeam: role }))}
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
                    setFormData(prev => ({
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
                      setFormData(prev => ({
                        ...prev,
                        growthAreas: prev.growthAreas.filter(a => a !== area)
                      }));
                    } else if (formData.growthAreas.length < 5) {
                      setFormData(prev => ({
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
            <span>{Math.round(progress)}% complete</span>
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
                      await saveStepData();
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
                  ) : currentStep === 2 && !cvUploaded ? (
                    <>
                      Skip for now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
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