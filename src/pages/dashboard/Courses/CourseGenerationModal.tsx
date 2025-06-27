import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseGeneration } from '@/contexts/CourseGenerationContext';
import { toast } from 'sonner';

interface CourseGenerationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  preSelectedEmployees?: string[];
}

interface EmployeeWithGaps {
  id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
  skills_profile?: {
    skills_match_score: number;
    gap_analysis_completed_at: string;
    technical_skills: any;
    soft_skills: any;
  };
  estimated_modules?: number;
  estimated_hours?: number;
  critical_gaps?: number;
  moderate_gaps?: number;
}

const CourseGenerationModal: React.FC<CourseGenerationModalProps> = ({
  open,
  onClose,
  onComplete,
  preSelectedEmployees = []
}) => {
  const { user } = useAuth();
  const { startGeneration } = useCourseGeneration();
  const [step, setStep] = useState<'selection' | 'generating' | 'complete'>('selection');
  const [employees, setEmployees] = useState<EmployeeWithGaps[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set(preSelectedEmployees));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEmployee, setCurrentEmployee] = useState<string>('');
  const [generatedCourses, setGeneratedCourses] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchEmployeesWithGaps();
    }
  }, [open]);

  const fetchEmployeesWithGaps = async () => {
    try {
      setLoading(true);
      
      // Fetch employees with their skills profiles
      const query = supabase
        .from('employees')
        .select(`
          id,
          position,
          department,
          users!inner (
            full_name,
            email
          ),
          st_employee_skills_profile (
            skills_match_score,
            gap_analysis_completed_at,
            technical_skills,
            soft_skills,
            extracted_skills
          )
        `)
        .eq('company_id', user?.company_id)
        .eq('is_active', true);

      // If pre-selected employees, filter by them
      if (preSelectedEmployees.length > 0) {
        query.in('id', preSelectedEmployees);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Fetched employees data:', data);
      console.log('Pre-selected employee IDs:', preSelectedEmployees);

      // Transform and calculate estimates
      const transformedEmployees = data?.map(emp => {
        // Handle both array and object responses from Supabase
        const skillsProfile = Array.isArray(emp.st_employee_skills_profile) 
          ? emp.st_employee_skills_profile?.[0]
          : emp.st_employee_skills_profile;
        const hasGapAnalysis = skillsProfile?.gap_analysis_completed_at !== null;
        
        // Calculate estimated modules and hours based on skills gaps
        let criticalGaps = 0;
        let moderateGaps = 0;
        
        // For now, estimate gaps based on skills match score
        // Lower score = more gaps
        if (skillsProfile?.skills_match_score) {
          const score = parseFloat(skillsProfile.skills_match_score);
          if (score < 50) {
            criticalGaps = 5;
            moderateGaps = 3;
          } else if (score < 70) {
            criticalGaps = 3;
            moderateGaps = 4;
          } else if (score < 85) {
            criticalGaps = 1;
            moderateGaps = 3;
          } else {
            criticalGaps = 0;
            moderateGaps = 2;
          }
        }

        const estimatedModules = Math.max(3, Math.min(12, criticalGaps * 2 + moderateGaps));
        const estimatedHours = estimatedModules * 4;

        return {
          id: emp.id,
          full_name: emp.users?.full_name || 'Unknown',
          email: emp.users?.email || '',
          position: emp.position || 'Unassigned',
          department: emp.department || 'Unassigned',
          skills_profile: skillsProfile,
          estimated_modules: hasGapAnalysis ? estimatedModules : 0,
          estimated_hours: hasGapAnalysis ? estimatedHours : 0,
          critical_gaps: criticalGaps,
          moderate_gaps: moderateGaps
        };
      }) || [];

      setEmployees(transformedEmployees);
      
      console.log('Transformed employees:', transformedEmployees);
      console.log('Employees with gap analysis:', transformedEmployees.filter(emp => emp.skills_profile?.gap_analysis_completed_at));
      
      // Auto-select employees with gap analysis completed
      const eligibleEmployees = transformedEmployees
        .filter(emp => emp.skills_profile?.gap_analysis_completed_at)
        .map(emp => emp.id);
      
      console.log('Eligible employee IDs:', eligibleEmployees);
      
      setSelectedEmployees(new Set([...preSelectedEmployees, ...eligibleEmployees]));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCourses = async () => {
    if (selectedEmployees.size === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    try {
      const employeesToGenerate = employees.filter(emp => selectedEmployees.has(emp.id));
      const employeeIds = employeesToGenerate.map(emp => emp.id);

      // Import and use the comprehensive pipeline
      const { CourseGenerationPipeline } = await import('@/services/CourseGenerationPipeline');
      
      let jobId: string | null = null;
      
      const pipeline = new CourseGenerationPipeline(
        user?.company_id || '',
        (progress) => {
          // Capture the job ID when it's created
          if (progress.phase === 'job_created' && progress.message) {
            jobId = progress.message;
            // Start tracking the job
            startGeneration(jobId);
            // Close the modal - the mini tracker will take over
            onClose();
            toast.info('Course generation started. You can continue using the platform while courses are being generated.');
          }
        },
        true // Use edge function by default for real AI generation
      );

      // Start the generation process (it will run in the background)
      pipeline.generateCoursesForEmployees(
        employeeIds,
        user?.id || '' // assigned_by_id
      ).then((results) => {
        // This will complete in the background
        console.log('Course generation completed:', results);
      }).catch((error) => {
        console.error('Course generation failed:', error);
        toast.error('Course generation failed: ' + error.message);
      });

    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Failed to start course generation');
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleAll = () => {
    const eligibleEmployees = employees.filter(emp => emp.skills_profile?.gap_analysis_completed_at);
    if (selectedEmployees.size === eligibleEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(eligibleEmployees.map(emp => emp.id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'selection' && 'Generate Personalized Courses'}
            {step === 'generating' && 'Generating Courses...'}
            {step === 'complete' && 'Course Generation Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'selection' && 'Select employees to generate personalized learning paths based on their skills gaps'}
            {step === 'generating' && 'Creating customized courses based on individual skill assessments'}
            {step === 'complete' && 'Courses have been successfully generated and assigned'}
          </DialogDescription>
        </DialogHeader>

        {step === 'selection' && (
          <>
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Selected Employees: {selectedEmployees.size}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAll}
                    >
                      {selectedEmployees.size === employees.filter(e => e.skills_profile?.gap_analysis_completed_at).length 
                        ? 'Deselect All' 
                        : 'Select All Eligible'}
                    </Button>
                  </div>

                  {selectedEmployees.size > 0 && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {employees.filter(e => selectedEmployees.has(e.id))
                            .reduce((sum, e) => sum + (e.estimated_modules || 0), 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Modules</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {employees.filter(e => selectedEmployees.has(e.id))
                            .reduce((sum, e) => sum + (e.estimated_hours || 0), 0)}h
                        </p>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">~{selectedEmployees.size * 3}</p>
                        <p className="text-sm text-muted-foreground">Est. Minutes</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee List */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : employees.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          No employees found with completed skills analysis
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    employees.map((employee) => {
                      const hasGapAnalysis = employee.skills_profile?.gap_analysis_completed_at !== null;
                      const isSelected = selectedEmployees.has(employee.id);

                      return (
                        <Card 
                          key={employee.id} 
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'border-primary' : ''
                          } ${!hasGapAnalysis ? 'opacity-60' : ''}`}
                          onClick={() => hasGapAnalysis && toggleEmployee(employee.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                disabled={!hasGapAnalysis}
                                onCheckedChange={() => hasGapAnalysis && toggleEmployee(employee.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{employee.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {employee.position} • {employee.department}
                                    </p>
                                  </div>
                                  {hasGapAnalysis ? (
                                    <div className="text-right">
                                      <Badge variant="outline" className="mb-1">
                                        {employee.skills_profile?.skills_match_score || 0}% Match
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">
                                        {employee.critical_gaps} critical, {employee.moderate_gaps} moderate gaps
                                      </p>
                                    </div>
                                  ) : (
                                    <Badge variant="secondary">No Analysis</Badge>
                                  )}
                                </div>
                                {hasGapAnalysis && (
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      <span>{employee.estimated_modules} modules</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{employee.estimated_hours} hours</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateCourses}
                disabled={selectedEmployees.size === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {selectedEmployees.size} Course{selectedEmployees.size !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'generating' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Generating Personalized Courses</h3>
              <p className="text-sm text-muted-foreground">
                Currently processing: {currentEmployee}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Analyzing skills gaps and learning objectives</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Researching relevant content and resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {progress > 50 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    <span>Generating personalized course content</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {progress > 75 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span>Creating multimedia assets and assessments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Course Generation Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Successfully generated {generatedCourses.length} personalized courses
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {generatedCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{course.employee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.module_count} modules generated
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Courses have been automatically assigned to employees
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Email notifications will be sent within 5 minutes
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Track progress in the Courses dashboard
                </li>
              </ul>
            </div>

            <DialogFooter>
              <Button onClick={handleComplete}>
                View Courses
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseGenerationModal;