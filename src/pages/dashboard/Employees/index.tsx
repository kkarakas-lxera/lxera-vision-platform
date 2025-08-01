import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  FileText, 
  Users, 
  Download, 
  Upload,
  Eye,
  Trash2,
  MoreHorizontal,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Filter,
  Building2,
  CheckCircle2,
  Send,
  BarChart3,
  History,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseGenerationModal from '@/pages/dashboard/Courses/CourseGenerationModal';

// Import components from onboarding pages
import { ImportTab } from '@/components/dashboard/ImportTab';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { QuickTour } from '@/components/dashboard/QuickTour';
import { UndoButton } from '@/components/dashboard/UndoButton';
import { BatchHistory } from '@/components/dashboard/BatchHistory';
import { InvitationManagement } from '@/components/dashboard/InvitationManagement';
import { QuickActions } from '@/components/dashboard/QuickActions';

interface Employee {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  department: string | null;
  position: string | null;
  is_active: boolean;
  cv_file_path: string | null;
  skills_last_analyzed: string | null;
  skills_match_score: number | null;
  career_readiness_score: number | null;
  gap_analysis_completed_at: string | null;
  invitation_status?: 'not_sent' | 'sent' | 'viewed' | 'completed';
  invitation_sent_at?: string | null;
  profile_complete?: boolean;
  completed_sections?: number;
  total_sections?: number;
  last_profile_update?: string | null;
  section_details?: {
    work_experience: boolean;
    education: boolean;
    current_work: boolean;
    daily_tasks: boolean;
    tools_technologies: boolean;
  };
}

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showCourseGeneration, setShowCourseGeneration] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [positionsCount, setPositionsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  
  // New state for tabbed interface
  const [activeTab, setActiveTab] = useState(() => {
    // Check for tab query parameter
    const tabParam = searchParams.get('tab');
    return tabParam || 'directory';
  });
  const [pendingImports, setPendingImports] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [lastOperation, setLastOperation] = useState<any>(null);

  // Check for first-time user
  useEffect(() => {
    const tourCompleted = localStorage.getItem('employee-tour-completed');
    if (!tourCompleted && employeesCount === 0 && positionsCount > 0) {
      setShowTour(true);
    }
  }, [employeesCount, positionsCount]);

  // Fetch pending counts for badges
  useEffect(() => {
    if (userProfile?.company_id) {
      fetchPendingCounts();
    }
  }, [userProfile?.company_id]);

  const fetchPendingCounts = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get pending imports
      const { data: sessions } = await supabase
        .from('st_import_sessions')
        .select('id')
        .eq('company_id', userProfile.company_id)
        .eq('status', 'pending');
      
      setPendingImports(sessions?.length || 0);

      // Get pending invitations
      const { data: invites } = await supabase
        .from('profile_invitations')
        .select('id, employee_id')
        .is('completed_at', null);
      
      if (invites) {
        const employeeIds = invites.map(inv => inv.employee_id);
        const { data: companyEmployees } = await supabase
          .from('employees')
          .select('id')
          .eq('company_id', userProfile.company_id)
          .in('id', employeeIds);
        
        setPendingInvites(companyEmployees?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployees();
      
      // Set up real-time subscription for employee updates
      const channel = supabase
        .channel('employee-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employees',
            filter: `company_id=eq.${userProfile.company_id}`,
          },
          (payload) => {
            console.log('Employee update:', payload);
            // Refresh the employee list when changes occur
            fetchEmployees();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employee_profile_sections',
          },
          (payload) => {
            console.log('Profile section update:', payload);
            // Refresh when profile sections change
            fetchEmployees();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile?.company_id]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      
      // First fetch positions to check if any exist
      const { data: positionsData, error: posError } = await supabase
        .from('st_company_positions')
        .select('id')
        .eq('company_id', userProfile.company_id);
      
      if (posError) {
        console.error('Error fetching positions:', posError);
        setPositionsCount(0);
      } else {
        setPositionsCount(positionsData?.length || 0);
      }

      const { data, error } = await supabase
        .from('v_company_employees')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('full_name');

      if (error) throw error;
      
      // Fetch invitation data
      const employeeIds = data?.map(emp => emp.id) || [];
      const { data: invitationsData } = await supabase
        .from('profile_invitations')
        .select('*')
        .in('employee_id', employeeIds);
      
      // Map invitation data to employees
      const invitationMap = new Map(
        (invitationsData || []).map(inv => [inv.employee_id, inv])
      );
      
      const employeesWithInvitations = (data || []).map(emp => {
        const invitation = invitationMap.get(emp.id);
        let invitationStatus: Employee['invitation_status'] = 'not_sent';
        
        if (invitation) {
          if (invitation.completed_at) invitationStatus = 'completed';
          else if (invitation.viewed_at) invitationStatus = 'viewed';
          else if (invitation.sent_at) invitationStatus = 'sent';
        }
        
        return {
          ...emp,
          invitation_status: invitationStatus,
          invitation_sent_at: invitation?.sent_at
        };
      });
      
      setEmployees(employeesWithInvitations);
      setEmployeesCount(employeesWithInvitations.length);
      
      // Extract unique departments and positions
      if (data) {
        const uniqueDepartments = [...new Set(data
          .filter(emp => emp.department)
          .map(emp => emp.department)
        )].sort();
        
        const uniquePositions = [...new Set(data
          .filter(emp => emp.position)
          .map(emp => emp.position)
        )].sort();
        
        setDepartments(uniqueDepartments);
        setPositions(uniquePositions);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', employeeId);

      if (error) throw error;

      toast.success('Employee deactivated successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deactivating employee:', error);
      toast.error('Failed to deactivate employee');
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleGenerateCourses = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setShowCourseGeneration(true);
  };

  const filteredEmployees = employees.filter(employee => {
    // Search filter
    const matchesSearch = 
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.position?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Department filter
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    // Position filter  
    const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
    
    return matchesSearch && matchesDepartment && matchesPosition;
  });

  const hasActiveFilters = departmentFilter !== 'all' || positionFilter !== 'all' || searchTerm !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setPositionFilter('all');
  };

  const getEmptyStateConfig = () => {
    if (positionsCount === 0) {
      return {
        icon: Building2,
        title: "No Positions Created",
        description: "Create positions first to define roles and skill requirements for your employees.",
        ctaText: "Create Your First Position",
        ctaLink: "/dashboard/positions",
        shouldBlur: true
      };
    }
    
    if (employeesCount === 0) {
      return {
        icon: Users,
        title: "No Employees Imported",
        description: "Import your first employees to start building your team directory.",
        ctaText: "Import Employees",
        ctaLink: "/dashboard/employees",
        shouldBlur: false // Don't blur when we're already on the employees page
      };
    }
    
    return {
      shouldBlur: false
    };
  };

  const getSkillsStatus = (employee: Employee) => {
    if (!employee.skills_last_analyzed) {
      return { status: 'not-analyzed', color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Not Analyzed' };
    }
    
    if (employee.skills_match_score === null) {
      return { status: 'analyzing', color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Analyzing' };
    }

    const score = employee.skills_match_score;
    if (score >= 80) {
      return { status: 'good', color: 'bg-green-100 text-green-800 border-green-200', text: `${score}% Match` };
    } else if (score >= 60) {
      return { status: 'moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: `${score}% Match` };
    } else {
      return { status: 'poor', color: 'bg-red-100 text-red-800 border-red-200', text: `${score}% Match` };
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="p-6 space-y-6">
      {/* Header with Quick Actions and Undo */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team directory, import employees, and analyze skills gaps</p>
        </div>
        <div className="flex items-center gap-2">
          {lastOperation && (
            <UndoButton 
              operation={lastOperation} 
              onUndo={async () => {
                // Handle undo logic here
                toast.success('Action undone');
                setLastOperation(null);
                fetchEmployees();
              }} 
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTour(true)}
            className="text-gray-600"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Tour
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions context="employees" />

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="directory" className="flex items-center gap-2" data-tab="directory">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Directory</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2" data-tab="import">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
            {pendingImports > 0 && <Badge className="ml-1">{pendingImports}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2" data-tab="invitations">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Invitations</span>
            {pendingInvites > 0 && <Badge className="ml-1">{pendingInvites}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2" data-tab="analysis">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2" data-tab="history">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Directory Tab - Existing Employee List */}
        <TabsContent value="directory" className="space-y-6">
          <div className="relative">
            {(() => {
              const emptyStateConfig = getEmptyStateConfig();
              return (
                <>
                  <div className="space-y-6 transition-all duration-500">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Employees</p>
                          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                          <p className="text-xs text-gray-500">{employees.filter(e => e.is_active).length} active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">CV Uploaded</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {employees.filter(e => e.cv_file_path).length}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="h-1 rounded-full transition-all duration-300 bg-green-500"
                              style={{ width: `${employees.length > 0 ? (employees.filter(e => e.cv_file_path).length / employees.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Skills Analyzed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {employees.filter(e => e.skills_last_analyzed).length}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="h-1 rounded-full transition-all duration-300 bg-purple-500"
                              style={{ width: `${employees.length > 0 ? (employees.filter(e => e.skills_last_analyzed).length / employees.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Profiles Complete</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {employees.filter(e => e.profile_complete).length}
                          </p>
                          <p className="text-xs text-gray-500">
                            {employees.filter(e => e.completed_sections && e.completed_sections > 0 && !e.profile_complete).length} in progress
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

      {/* Search and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                size="sm"
                className="text-gray-600"
              >
                Clear filters
              </Button>
            )}
            
            {selectedEmployees.length > 0 && (
              <Button onClick={handleGenerateCourses} size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Generate Courses ({selectedEmployees.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Employee List</CardTitle>
            <CardDescription>{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('import')}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Employees
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Add export functionality */}}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Position</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Profile Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Invitation</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">CV Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Skills Analysis</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const skillsStatus = getSkillsStatus(employee);
                  
                  return (
                    <tr key={employee.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{employee.full_name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{employee.department || '-'}</td>
                      <td className="p-4 text-gray-600">{employee.position || '-'}</td>
                      <td className="p-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                              {employee.profile_complete ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 cursor-help">
                                  Complete
                                </Badge>
                              ) : employee.completed_sections && employee.total_sections ? (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 cursor-help">
                                  {employee.completed_sections}/{employee.total_sections} Complete
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 cursor-help">
                                  Not Started
                                </Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <div className="space-y-1 text-sm">
                              <p className="font-semibold mb-2">Profile Sections:</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {employee.section_details?.work_experience ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={employee.section_details?.work_experience ? 'text-green-600' : 'text-gray-500'}>
                                    Work Experience
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {employee.section_details?.education ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={employee.section_details?.education ? 'text-green-600' : 'text-gray-500'}>
                                    Education
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {employee.section_details?.current_work ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={employee.section_details?.current_work ? 'text-green-600' : 'text-gray-500'}>
                                    Current Projects
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {employee.section_details?.daily_tasks ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={employee.section_details?.daily_tasks ? 'text-green-600' : 'text-gray-500'}>
                                    Challenges
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {employee.section_details?.tools_technologies ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className={employee.section_details?.tools_technologies ? 'text-green-600' : 'text-gray-500'}>
                                    Growth Areas
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="p-4">
                        {employee.invitation_status === 'completed' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                        )}
                        {employee.invitation_status === 'viewed' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Viewed</Badge>
                        )}
                        {employee.invitation_status === 'sent' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Sent</Badge>
                        )}
                        {employee.invitation_status === 'not_sent' && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Not Sent</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={employee.cv_file_path ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {employee.cv_file_path ? 'Uploaded' : 'Not Uploaded'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={skillsStatus.color}>
                          {skillsStatus.text}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setEmployeeToDelete(employee.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">No employees found</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search terms.' 
                      : 'Get started by adding your first employee.'}
                  </p>
                  {hasActiveFilters && (
                    <Button 
                      onClick={clearFilters} 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
              </div>

              {/* Empty State - Show inline message instead of overlay */}
              {employees.length === 0 && positionsCount > 0 && (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employees Yet</h3>
                    <p className="text-gray-600 mb-4">Switch to the Import tab to add your first employees.</p>
                    <Button onClick={() => setActiveTab('import')}>
                      Go to Import Tab
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          );
        })()}
      </div>
    </TabsContent>

    {/* Import Tab */}
    <TabsContent value="import" className="space-y-6">
      <ImportTab 
        userProfile={userProfile}
        onImportComplete={() => {
          fetchEmployees();
          fetchPendingCounts();
          setLastOperation({
            type: 'import',
            timestamp: new Date(),
            affectedCount: 0,
            data: {}
          });
        }}
      />
    </TabsContent>

    {/* Invitations Tab */}
    <TabsContent value="invitations" className="space-y-6">
      <InvitationManagement 
        employees={employees}
        onInvitationsSent={() => {
          fetchEmployees();
          fetchPendingCounts();
        }}
      />
    </TabsContent>

    {/* Analysis Tab */}
    <TabsContent value="analysis" className="space-y-6">
      <SkillsGapAnalysis 
        employees={employees.map(e => ({
          id: e.id,
          name: e.full_name,
          email: e.email,
          position: e.position || '',
          cv_status: e.cv_file_path ? 'analyzed' : 'missing',
          skills_analysis: e.gap_analysis_completed_at ? 'completed' : 'pending',
          gap_score: e.skills_match_score
        }))}
      />
    </TabsContent>

    {/* History Tab */}
    <TabsContent value="history" className="space-y-6">
      <BatchHistory 
        companyId={userProfile?.company_id || ''}
        onRestore={(sessionId) => {
          fetchEmployees();
          setLastOperation({
            type: 'restore',
            timestamp: new Date(),
            affectedCount: 0,
            data: { sessionId }
          });
        }}
      />
    </TabsContent>
  </Tabs>

      {/* Modals */}

      <CourseGenerationModal
        isOpen={showCourseGeneration}
        onClose={() => setShowCourseGeneration(false)}
        onComplete={() => {
          setShowCourseGeneration(false);
          // Refresh data or navigate to courses
        }}
        preSelectedEmployees={selectedEmployees}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the employee. They will no longer have access to the system, but their data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => employeeToDelete && handleDeleteEmployee(employeeToDelete)}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Tour */}
      {showTour && (
        <QuickTour 
          onComplete={() => {
            localStorage.setItem('employee-tour-completed', 'true');
            setShowTour(false);
          }}
          steps={[
            {
              target: '[data-tab="import"]',
              content: 'Start here to import your team members via CSV or manual entry',
              placement: 'bottom'
            },
            {
              target: '[data-tab="invitations"]',
              content: 'Send invitations to employees to complete their profiles',
              placement: 'bottom'
            },
            {
              target: '[data-tab="analysis"]',
              content: 'View comprehensive skills gap analysis for your organization',
              placement: 'bottom'
            },
            {
              target: '[data-tab="history"]',
              content: 'Track all import batches and restore previous imports if needed',
              placement: 'bottom'
            }
          ]}
        />
      )}
    </div>
    </TooltipProvider>
  );
};

export default EmployeesPage;
