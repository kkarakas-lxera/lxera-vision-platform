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
  Eye
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

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

export const EmployeeCourseAssignments = ({ companyId }: { companyId: string }) => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchAssignments();
      fetchDepartments();
    }
  }, [companyId]);

  const fetchDepartments = async () => {
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
    try {
      setLoading(true);
      
      // Fetch course assignments with related data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          employee_id,
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

      if (assignmentsError) throw assignmentsError;

      // Transform the data
      const transformedAssignments = await Promise.all((assignmentsData || []).map(async (assignment) => {
        // Get user info
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', assignment.employees.user_id)
          .single();

        // Get department info
        const { data: deptData } = await supabase
          .from('departments')
          .select('code, name')
          .eq('company_id', companyId)
          .eq('code', assignment.employees.department)
          .single();

        // Get course plan data if plan_id exists
        let courseTitle = 'No Course Plan';
        let skillsGapPercentage = 0;
        let modules: ModuleInfo[] = [];

        if (assignment.plan_id) {
          const { data: planData } = await supabase
            .from('cm_course_plans')
            .select('course_title, course_structure, prioritized_gaps')
            .eq('plan_id', assignment.plan_id)
            .single();

          if (planData) {
            courseTitle = planData.course_title;

            // Calculate skills gap percentage from prioritized_gaps
            if (planData.prioritized_gaps) {
              const gapsData = planData.prioritized_gaps;
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
                  });
                }
              });

              if (totalMaxLevel > 0) {
                // Calculate gap as percentage of missing skills
                skillsGapPercentage = Math.round(((totalMaxLevel - totalCurrentLevel) / totalMaxLevel) * 100);
              }
            }

            // Extract modules from course structure
            if (planData.course_structure?.modules) {
              const courseModules = planData.course_structure.modules;
              
              for (const [index, module] of courseModules.entries()) {
                // Check if module has content
                const { data: contentData } = await supabase
                  .from('cm_module_content')
                  .select('content_id, status')
                  .eq('company_id', companyId)
                  .eq('module_name', module.module_title || module.title)
                  .maybeSingle();

                modules.push({
                  module_name: module.module_title || module.title || `Module ${index + 1}`,
                  module_order: index + 1,
                  has_content: !!contentData,
                  content_id: contentData?.content_id,
                  status: contentData?.status
                });
              }
            }
          }
        }

        return {
          assignment_id: assignment.id,
          employee_id: assignment.employee_id,
          employee_name: userData?.full_name || 'Unknown Employee',
          employee_email: userData?.email || 'No Email',
          department_code: assignment.employees.department || 'N/A',
          department_name: deptData?.name || 'Unknown Department',
          plan_id: assignment.plan_id,
          course_title: courseTitle,
          skills_gap_percentage: skillsGapPercentage,
          total_modules: assignment.total_modules || modules.length,
          modules_completed: assignment.modules_completed || 0,
          progress_percentage: assignment.progress_percentage || 0,
          status: assignment.status,
          assigned_at: assignment.assigned_at,
          modules
        };
      }));

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

  const getSkillsGapBadge = (percentage: number) => {
    if (percentage >= 70) {
      return <Badge variant="destructive">Critical Gap ({percentage}%)</Badge>;
    } else if (percentage >= 40) {
      return <Badge variant="default">Moderate Gap ({percentage}%)</Badge>;
    } else {
      return <Badge variant="secondary">Low Gap ({percentage}%)</Badge>;
    }
  };

  const filteredAssignments = getFilteredAssignments();

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
    <>
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
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                        <div>
                          <p className="font-medium">{assignment.department_code}</p>
                          <p className="text-xs text-muted-foreground">{assignment.department_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        {getSkillsGapBadge(assignment.skills_gap_percentage)}
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
                      <div className="space-y-1">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Here you can add navigation to detailed view
                          console.log('View details for:', assignment);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
    </>
  );
};