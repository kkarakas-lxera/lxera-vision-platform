import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search,
  FileDown,
  User,
  Building,
  Target,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Building2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';

interface EmployeeAssignment {
  assignment_id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department_code: string;
  department_name: string;
  plan_id: string;
  course_title: string;
  skills_gap_percentage: number;
  targeted_skills?: string[];
  total_modules: number;
  modules_completed: number;
  progress_percentage: number;
  status: string;
  assigned_at: string;
  modules: ModuleInfo[];
}

interface ModuleInfo {
  module_name: string;
  module_order: number;
  has_content: boolean;
  content_id?: string;
  status?: string;
}

interface ModuleContent {
  content_id: string;
  module_name: string;
  introduction: string;
  core_content: string;
  practical_applications: string;
  case_studies: string;
  assessments: string;
}

export const EmployeeCourseAssignments = ({ companyId: propCompanyId }: { companyId?: string } = {}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [positionsCount, setPositionsCount] = useState(0);

  // Use propCompanyId if provided, otherwise use userProfile.company_id
  const companyId = propCompanyId || userProfile?.company_id;

  useEffect(() => {
    if (companyId) {
      fetchPositionsCount();
      fetchAssignments();
      fetchDepartments();
    }
  }, [companyId]);

  const fetchPositionsCount = async () => {
    if (!companyId) return;

    try {
      const { data: positionsData, error } = await supabase
        .from('st_company_positions')
        .select('id')
        .eq('company_id', companyId);
      
      if (error) {
        console.error('Error fetching positions:', error);
        // Set to 0 to show blur effect if we can't fetch positions
        setPositionsCount(0);
      } else {
        const posCount = positionsData?.length || 0;
        console.log('Positions count:', posCount);
        setPositionsCount(posCount);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositionsCount(0);
    }
  };

  const fetchDepartments = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('code, name')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      
      const deptCodes = data?.map(d => d.code) || [];
      setDepartments(deptCodes);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAssignments = async () => {
    if (!companyId) {
      console.log('No companyId available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching assignments for company:', companyId);
      setLoading(true);
      
      // Fetch course assignments with related data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          employee_id,
          course_id,
          plan_id,
          status,
          progress_percentage,
          total_modules,
          modules_completed,
          assigned_at,
          employees!inner (
            id,
            user_id,
            department
          )
        `)
        .eq('company_id', companyId)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) {
        console.error('Assignments error:', assignmentsError);
        throw assignmentsError;
      }

      console.log('Assignments data:', assignmentsData);

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      // Batch fetch all related data to avoid N+1 queries
      const userIds = [...new Set(assignmentsData.map(a => a.employees.user_id))];
      const departmentCodes = [...new Set(assignmentsData.map(a => a.employees.department).filter(Boolean))];
      const planIds = [...new Set(assignmentsData.map(a => a.plan_id).filter(Boolean))];
      const courseIds = [...new Set(assignmentsData.map(a => a.course_id).filter(Boolean))];

      // Batch fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);
      
      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      // Batch fetch departments
      const { data: deptsData } = await supabase
        .from('departments')
        .select('code, name')
        .eq('company_id', companyId)
        .in('code', departmentCodes);
      
      const deptsMap = new Map(deptsData?.map(d => [d.code, d]) || []);

      // Batch fetch course plans if any
      let plansMap = new Map();
      if (planIds.length > 0) {
        const { data: plansData } = await supabase
          .from('cm_course_plans')
          .select('plan_id, course_title, course_structure, prioritized_gaps')
          .in('plan_id', planIds);
        
        plansMap = new Map(plansData?.map(p => [p.plan_id, p]) || []);
      }

      // Batch fetch courses if any
      let coursesMap = new Map();
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('cm_module_content')
          .select('content_id, module_name')
          .in('content_id', courseIds);
        
        coursesMap = new Map(coursesData?.map(c => [c.content_id, c]) || []);
      }

      // Transform the data without additional queries
      const transformedAssignments = assignmentsData.map((assignment) => {
        const user = usersMap.get(assignment.employees.user_id);
        const dept = deptsMap.get(assignment.employees.department);
        const plan = plansMap.get(assignment.plan_id);
        const course = coursesMap.get(assignment.course_id);

        // Get course title from plan or course
        let courseTitle = 'No Course Assigned';
        let skillsGapPercentage = 0;
        const targetedSkills: string[] = [];
        let modules: ModuleInfo[] = [];

        if (plan) {
          courseTitle = plan.course_title;
          
          // Calculate skills gap from plan data
          if (plan.prioritized_gaps) {
            const gapsData = plan.prioritized_gaps;
            let totalGaps = 0;
            let totalMaxLevel = 0;
            let totalCurrentLevel = 0;

            // Extract gaps from the nested structure
            Object.values(gapsData).forEach((category: any) => {
              if (category.gaps && Array.isArray(category.gaps)) {
                category.gaps.forEach((gap: any) => {
                  const current = gap.current_level || 0;
                  const required = gap.required_level || 0;
                  totalCurrentLevel += current;
                  totalMaxLevel += required;
                  totalGaps++;
                  
                  // Collect targeted skills
                  if (gap.skill_name && current < required) {
                    targetedSkills.push(gap.skill_name);
                  }
                });
              }
            });

            if (totalMaxLevel > 0) {
              // Calculate gap as percentage of missing skills
              skillsGapPercentage = Math.round(((totalMaxLevel - totalCurrentLevel) / totalMaxLevel) * 100);
            }
          }

          // Extract modules from course structure
          if (plan.course_structure?.modules) {
            const courseModules = plan.course_structure.modules;
            
            modules = courseModules.map((module: any, index: number) => ({
              module_name: module.module_title || module.title || `Module ${index + 1}`,
              module_order: index + 1,
              has_content: false, // Will update this later
              content_id: undefined,
              status: undefined
            }));
          }
        } else if (course) {
          courseTitle = course.module_name;
        }

        return {
          assignment_id: assignment.id,
          employee_id: assignment.employee_id,
          employee_name: user?.full_name || 'Unknown Employee',
          employee_email: user?.email || 'No Email',
          department_code: assignment.employees.department || 'N/A',
          department_name: dept?.name || 'Unknown Department',
          plan_id: assignment.plan_id,
          course_title: courseTitle,
          skills_gap_percentage: skillsGapPercentage,
          targeted_skills: targetedSkills,
          total_modules: assignment.total_modules || modules.length,
          modules_completed: assignment.modules_completed || 0,
          progress_percentage: assignment.progress_percentage || 0,
          status: assignment.status,
          assigned_at: assignment.assigned_at,
          modules
        };
      });

      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee course assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleContent = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (error) throw error;
      
      setSelectedModule(data);
      setShowModuleDialog(true);
    } catch (error) {
      console.error('Error fetching module content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load module content',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Employee Name', 'Email', 'Department', 'Course Title', 'Skills Gap %', 'Progress %', 'Modules Completed', 'Total Modules', 'Status', 'Assigned Date'],
      ...getFilteredAssignments().map(assignment => [
        assignment.employee_name,
        assignment.employee_email,
        assignment.department_name,
        assignment.course_title,
        `${assignment.skills_gap_percentage}%`,
        `${assignment.progress_percentage}%`,
        assignment.modules_completed,
        assignment.total_modules,
        assignment.status,
        new Date(assignment.assigned_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_course_assignments_${companyId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.department_code === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      in_progress: 'secondary' as const,
      assigned: 'outline' as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSkillsGapBadge = (percentage: number, targetedSkills?: string[]) => {
    const variant = percentage >= 70 ? "destructive" : percentage >= 40 ? "default" : "secondary";
    const label = percentage >= 70 ? "Critical" : percentage >= 40 ? "Moderate" : "Low";
    
    const badge = (
      <Badge variant={variant}>
        {label} Gap ({percentage}%)
      </Badge>
    );

    if (targetedSkills && targetedSkills.length > 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium mb-1">Targeted Skills:</p>
            <ul className="text-xs space-y-1">
              {targetedSkills.slice(0, 5).map((skill, index) => (
                <li key={index}>• {skill}</li>
              ))}
              {targetedSkills.length > 5 && (
                <li className="text-muted-foreground">...and {targetedSkills.length - 5} more</li>
              )}
            </ul>
          </TooltipContent>
        </Tooltip>
      );
    }

    return badge;
  };

  const filteredAssignments = getFilteredAssignments();

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium">No company selected</p>
          <p className="text-muted-foreground">Please ensure you are logged in with a company account.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading employee course assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Course Assignments</CardTitle>
              <CardDescription>View and manage course assignments, skills gaps, and module progress</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className={cn(
              "transition-all duration-500",
              positionsCount === 0 && "blur-md pointer-events-none select-none"
            )}>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No course assignments yet</p>
                  <p>Course assignments will appear here once employees are assigned to courses.</p>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No course assignments found matching your filters</p>
                </div>
              ) : (
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Skills Gap</TableHead>
                  <TableHead>Course Plan</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{assignment.employee_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{assignment.department_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        {getSkillsGapBadge(assignment.skills_gap_percentage, assignment.targeted_skills)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{assignment.course_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.total_modules} modules
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1 cursor-help">
                            {assignment.modules.slice(0, 3).map((module, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                {module.has_content ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Clock className="h-3 w-3 text-gray-400" />
                                )}
                                <span className="text-xs truncate max-w-[150px]">
                                  {module.module_name}
                                </span>
                                {module.has_content && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => fetchModuleContent(module.content_id!)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {assignment.modules.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{assignment.modules.length - 3} more modules
                              </p>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium mb-1">All Modules:</p>
                          <ul className="text-xs space-y-1">
                            {assignment.modules.map((module, index) => (
                              <li key={index}>
                                {index + 1}. {module.module_name}
                                {module.has_content && <span className="text-green-600 ml-1">✓</span>}
                              </li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${assignment.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{assignment.progress_percentage}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {assignment.modules_completed}/{assignment.total_modules} completed
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(assignment.status)}
                        {getStatusBadge(assignment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate(`/dashboard/employees/${assignment.employee_id}`);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          View employee profile
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
              )}
            </div>

            {/* Empty State Overlay */}
            {positionsCount === 0 && (
              <EmptyStateOverlay
                icon={Building2}
                title="No Positions Created"
                description="Create positions first to enable course assignments and track employee learning progress."
                ctaText="Create Your First Position"
                ctaLink="/dashboard/positions"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Module Content Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedModule?.module_name}</DialogTitle>
            <DialogDescription>Module content in markdown format</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedModule && (
              <div className="space-y-6">
                {selectedModule.introduction && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedModule.introduction}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {selectedModule.core_content && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Core Content</h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedModule.core_content}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {selectedModule.practical_applications && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Practical Applications</h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedModule.practical_applications}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {selectedModule.case_studies && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Case Studies</h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedModule.case_studies}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {selectedModule.assessments && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Assessments</h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedModule.assessments}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};