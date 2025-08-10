import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sparkles, Users, AlertCircle } from 'lucide-react';
import { ActiveJobsDisplay } from './ActiveJobsDisplay';
import { EmployeeSelectionGrid } from './EmployeeSelectionGrid';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  skills_gap_percentage: number;
  critical_gaps: number;
  moderate_gaps: number;
  last_course_date?: string;
  skills_last_analyzed?: string;
}

export const CourseGenerationSection = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const companyId = userProfile?.company_id;
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [skillsGapFilter, setSkillsGapFilter] = useState('all');

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  useEffect(() => {
    // Apply filters
    let filtered = [...employees];
    
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }
    
    if (skillsGapFilter === 'critical') {
      filtered = filtered.filter(emp => emp.skills_gap_percentage >= 70);
    } else if (skillsGapFilter === 'high') {
      filtered = filtered.filter(emp => emp.skills_gap_percentage >= 40);
    }
    
    setFilteredEmployees(filtered);
  }, [employees, departmentFilter, skillsGapFilter]);

  const fetchEmployees = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Fetch employees with skills analysis data
      const { data: employeesData, error } = await supabase
        .from('employees')
        .select(`
          id,
          department,
          position,
          skills_last_analyzed,
          users!inner (
            full_name,
            email
          ),
          st_employee_skills_profile (
            skills_match_score,
            gap_analysis_completed_at,
            technical_skills,
            soft_skills
          )
        `)
        .eq('company_id', companyId)
        .not('skills_last_analyzed', 'is', null);

      if (error) throw error;

      // Transform data for display
      const transformedEmployees = employeesData?.map(emp => {
        const profile = emp.st_employee_skills_profile?.[0];
        
        // Calculate gaps from skills data
        let criticalGaps = 0;
        let moderateGaps = 0;
        let totalGaps = 0;
        
        if (profile?.technical_skills) {
          profile.technical_skills.forEach((skill: any) => {
            if (skill.proficiency_level < 2) {
              criticalGaps++;
              totalGaps++;
            } else if (skill.proficiency_level < 3) {
              moderateGaps++;
              totalGaps++;
            }
          });
        }
        
        if (profile?.soft_skills) {
          profile.soft_skills.forEach((skill: any) => {
            if (skill.proficiency_level < 2) {
              criticalGaps++;
              totalGaps++;
            } else if (skill.proficiency_level < 3) {
              moderateGaps++;
              totalGaps++;
            }
          });
        }

        // Get last course date
        // This would need to be fetched from course_assignments table
        
        return {
          id: emp.id,
          name: emp.users?.full_name || 'Unknown',
          email: emp.users?.email || '',
          position: emp.position || 'N/A',
          department: emp.department || 'N/A',
          skills_gap_percentage: profile?.skills_match_score ? (100 - profile.skills_match_score) : 0,
          critical_gaps: criticalGaps,
          moderate_gaps: moderateGaps,
          skills_last_analyzed: emp.skills_last_analyzed,
        };
      }) || [];

      setEmployees(transformedEmployees);
      
      // Extract unique departments
      const uniqueDepts = [...new Set(transformedEmployees.map(e => e.department).filter(Boolean))];
      setDepartments(uniqueDepts.sort());
      
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
  };

  const clearSelection = () => {
    setSelectedEmployeeIds([]);
  };

  const handleGenerate = async () => {
    if (selectedEmployeeIds.length === 0) return;
    
    try {
      setIsGenerating(true);
      
      // Get current user ID for initiated_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create a course generation job - backend will process this queue
      const { data: job, error: jobError } = await supabase
        .from('course_generation_jobs')
        .insert({
          company_id: companyId,
          initiated_by: user.id,
          total_employees: selectedEmployeeIds.length,
          employee_ids: selectedEmployeeIds,
          status: 'queued', // Start as queued, not pending
          current_phase: 'Waiting in queue',
          progress_percentage: 0,
          successful_courses: 0,
          failed_courses: 0,
          metadata: {
            priority: determinePriority(selectedEmployeeIds.length),
            generation_mode: 'full',
            estimated_duration_seconds: selectedEmployeeIds.length * 300, // Estimate 5 min per employee
            queued_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (jobError) throw jobError;

      toast({
        title: 'Course Generation Queued',
        description: `Your request to generate courses for ${selectedEmployeeIds.length} employee${selectedEmployeeIds.length > 1 ? 's' : ''} has been queued. You'll see progress in the active jobs section shortly.`,
      });

      // Clear selection after queuing
      clearSelection();
      
      // The backend queue processor will:
      // 1. Pick up jobs with status 'queued'
      // 2. Change status to 'processing'
      // 3. Process employees in batches
      // 4. Update progress in real-time
      // 5. Handle failures and retries
      
    } catch (error) {
      console.error('Error queuing generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to queue course generation',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const determinePriority = (employeeCount: number): string => {
    // Smaller batches get higher priority for better user experience
    if (employeeCount <= 5) return 'high';
    if (employeeCount <= 20) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  const hasAnalyzedEmployees = employees.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Jobs Section */}
      <ActiveJobsDisplay />
      
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generate New Courses</CardTitle>
              <CardDescription>
                Select employees to generate personalized AI courses based on their skills gaps
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedEmployeeIds.length} selected
              </Badge>
              <Button 
                onClick={handleGenerate}
                disabled={selectedEmployeeIds.length === 0 || isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Courses
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!hasAnalyzedEmployees ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Analyzed Employees</p>
              <p className="text-muted-foreground mb-4">
                Analyze employee skills first to generate personalized courses
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard/employees'}
              >
                Go to Employees
              </Button>
            </div>
          ) : (
            <>
              {/* Filters Bar */}
              <div className="flex items-center gap-2 mb-4">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={skillsGapFilter} onValueChange={setSkillsGapFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Gaps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="critical">Critical Gaps Only</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All Visible ({filteredEmployees.length})
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </div>
              </div>
              
              {/* Employee Selection Grid */}
              {filteredEmployees.length > 0 ? (
                <EmployeeSelectionGrid 
                  employees={filteredEmployees}
                  selectedIds={selectedEmployeeIds}
                  onToggleSelect={toggleEmployeeSelection}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employees match the selected filters</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};