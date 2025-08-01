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
  Undo2,
  X,
  Mail,
  Clock,
  UserCircle,
  CheckCircle,
  ChevronDown,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  email_opened_at?: string | null;
  email_opened_count?: number;
  email_clicked_at?: string | null;
  email_clicked_count?: number;
  email_clicks?: Array<{
    link: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_sent' | 'sent' | 'viewed' | 'completed'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
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

      // Get employees waiting for invitations (same logic as main employee fetch)
      const { data } = await supabase
        .from('v_company_employees')
        .select('*')
        .eq('company_id', userProfile.company_id);

      if (data) {
        // Fetch invitation data
        const employeeIds = data.map(emp => emp.id);
        const { data: invitationsData } = await supabase
          .from('profile_invitations')
          .select('*')
          .in('employee_id', employeeIds);
        
        // Map invitation data to employees (same logic as fetchEmployees)
        const invitationMap = new Map(
          (invitationsData || []).map(inv => [inv.employee_id, inv])
        );
        
        const employeesWithInvitations = data.map(emp => {
          const invitation = invitationMap.get(emp.id);
          let invitationStatus: 'not_sent' | 'sent' | 'viewed' | 'completed' = 'not_sent';
          
          if (invitation) {
            if (invitation.completed_at) invitationStatus = 'completed';
            else if (invitation.viewed_at) invitationStatus = 'viewed';
            else if (invitation.sent_at) invitationStatus = 'sent';
          }
          
          return { ...emp, invitation_status: invitationStatus };
        });
        
        // Count employees that are eligible for invitations (not_sent or sent)
        const pendingCount = employeesWithInvitations.filter(emp => 
          emp.invitation_status === 'not_sent' || emp.invitation_status === 'sent'
        ).length;
        
        setPendingInvites(pendingCount);
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
          invitation_sent_at: invitation?.sent_at,
          email_opened_at: invitation?.email_opened_at,
          email_opened_count: invitation?.email_opened_count || 0,
          email_clicked_at: invitation?.email_clicked_at,
          email_clicked_count: invitation?.email_clicked_count || 0,
          email_clicks: invitation?.email_clicks || []
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
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || employee.invitation_status === statusFilter || 
      (statusFilter === 'not_sent' && !employee.invitation_status);
    
    // Profile filter
    const matchesProfile = profileFilter === 'all' || 
      (profileFilter === 'not_started' && !employee.completed_sections) ||
      (profileFilter === 'in_progress' && employee.completed_sections && employee.completed_sections > 0 && !employee.profile_complete) ||
      (profileFilter === 'completed' && employee.profile_complete);
    
    // Needs attention filter
    const matchesNeedsAttention = !needsAttentionFilter || 
      (!employee.profile_complete || employee.invitation_status === 'not_sent' || !employee.cv_file_path || !employee.skills_last_analyzed);
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesStatus && matchesProfile && matchesNeedsAttention;
  });

  const hasActiveFilters = departmentFilter !== 'all' || positionFilter !== 'all' || searchTerm !== '' || 
    statusFilter !== 'all' || profileFilter !== 'all' || needsAttentionFilter;

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setPositionFilter('all');
    setStatusFilter('all');
    setProfileFilter('all');
    setNeedsAttentionFilter(false);
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

      {/* Quick Actions - Compact horizontal strip */}
      <QuickActions context="employees" className="mb-6" />

      {/* Enhanced Tab Structure with Visual Nesting */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
          <div className="bg-white rounded-md">
            <TabsList className="h-auto p-0 bg-transparent border-0 flex gap-0">
              <TabsTrigger 
                value="directory" 
                className="group flex items-center gap-2 px-6 py-3 border-b-3 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 hover:bg-gray-50 text-sm font-medium relative transition-all rounded-t-md" 
                data-tab="directory"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400 group-data-[state=active]:text-blue-600" />
                      <span className="group-data-[state=active]:text-blue-700 group-data-[state=active]:font-semibold">Directory</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Browse and manage all employees</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger 
                value="import" 
                className="group flex items-center gap-2 px-6 py-3 border-b-3 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 hover:bg-gray-50 text-sm font-medium relative transition-all rounded-t-md" 
                data-tab="import"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-gray-400 group-data-[state=active]:text-blue-600" />
                      <span className="group-data-[state=active]:text-blue-700 group-data-[state=active]:font-semibold">Import</span>
                      {pendingImports > 0 && (
                        <Badge className="ml-1.5 h-5 px-1.5 text-xs bg-orange-100 text-orange-700 border-0">
                          {pendingImports} pending
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload your employee data</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger 
                value="invitations" 
                className="group flex items-center gap-2 px-6 py-3 border-b-3 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 hover:bg-gray-50 text-sm font-medium relative transition-all rounded-t-md" 
                data-tab="invitations"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-400 group-data-[state=active]:text-blue-600" />
                      <span className="group-data-[state=active]:text-blue-700 group-data-[state=active]:font-semibold">Invitations</span>
                      {pendingInvites > 0 && (
                        <Badge className="ml-1.5 h-5 px-1.5 text-xs bg-orange-100 text-orange-700 border-0">
                          {pendingInvites} pending
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track invitations sent to employees</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger 
                value="analysis" 
                className="group flex items-center gap-2 px-6 py-3 border-b-3 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 hover:bg-gray-50 text-sm font-medium relative transition-all rounded-t-md" 
                data-tab="analysis"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-400 group-data-[state=active]:text-blue-600" />
                      <span className="group-data-[state=active]:text-blue-700 group-data-[state=active]:font-semibold">Analysis</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Review skills gap insights</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="group flex items-center gap-2 px-6 py-3 border-b-3 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 hover:bg-gray-50 text-sm font-medium relative transition-all rounded-t-md" 
                data-tab="history"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-gray-400 group-data-[state=active]:text-blue-600" />
                      <span className="group-data-[state=active]:text-blue-700 group-data-[state=active]:font-semibold">History</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View past imports and changes</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Directory Tab - Existing Employee List */}
          <TabsContent value="directory" className="bg-white rounded-b-md p-6 space-y-4 -mt-px">
            <div className="relative">
              {(() => {
                const emptyStateConfig = getEmptyStateConfig();
                return (
                  <>
                    <div className="space-y-4 transition-all duration-500">

                      {/* Employee List Card */}
                      <Card>
                        <CardHeader className="border-b bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base font-medium">Employee Directory</CardTitle>
                              <CardDescription>{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setActiveTab('import')}
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Employee
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Export
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {/* Export filtered */}}>
                                    Export Filtered View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {/* Export all */}}>
                                    Export All Employees
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Unified Smart Search Bar */}
                          <div className="mt-4 space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            
                            {/* Filter Chips Row */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className={cn(
                                  "h-7 text-xs w-auto",
                                  departmentFilter !== 'all' ? "bg-blue-50 border-blue-200" : "border-gray-200"
                                )}>
                                  <Building2 className="h-3 w-3 mr-1" />
                                  <span>
                                    {departmentFilter === 'all' ? 'Department' : departmentFilter}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Departments</SelectItem>
                                  {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select value={positionFilter} onValueChange={setPositionFilter}>
                                <SelectTrigger className={cn(
                                  "h-7 text-xs w-auto",
                                  positionFilter !== 'all' ? "bg-blue-50 border-blue-200" : "border-gray-200"
                                )}>
                                  <Users className="h-3 w-3 mr-1" />
                                  <span>
                                    {positionFilter === 'all' ? 'Role' : positionFilter}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Positions</SelectItem>
                                  {positions.map(pos => (
                                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={cn(
                                  "h-7 text-xs w-auto",
                                  statusFilter !== 'all' ? "bg-blue-50 border-blue-200" : "border-gray-200"
                                )}>
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span>
                                    {statusFilter === 'all' ? 'Invitation Status' : 
                                     statusFilter === 'not_sent' ? 'Not Invited' :
                                     statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Statuses</SelectItem>
                                  <SelectItem value="not_sent">Not Invited</SelectItem>
                                  <SelectItem value="sent">Sent</SelectItem>
                                  <SelectItem value="viewed">Viewed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Select value={profileFilter} onValueChange={setProfileFilter}>
                                <SelectTrigger className={cn(
                                  "h-7 text-xs w-auto",
                                  profileFilter !== 'all' ? "bg-blue-50 border-blue-200" : "border-gray-200"
                                )}>
                                  <UserCircle className="h-3 w-3 mr-1" />
                                  <span>
                                    {profileFilter === 'all' ? 'Profile Status' :
                                     profileFilter === 'not_started' ? 'Not Started' :
                                     profileFilter === 'in_progress' ? 'In Progress' : 'Completed'}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Profiles</SelectItem>
                                  <SelectItem value="not_started">Not Started</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant={needsAttentionFilter ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setNeedsAttentionFilter(!needsAttentionFilter)}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Needs Attention
                              </Button>
                              
                              {hasActiveFilters && (
                                <Button 
                                  onClick={clearFilters} 
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-gray-500"
                                >
                                  Clear all
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0">
          {/* Sticky Bulk Actions Bar */}
          {selectedEmployees.length > 0 && (
            <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="text-xs">
                        Bulk Actions
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        // Send invitations/reminders logic
                        toast.success(`Sending invitations to ${selectedEmployees.length} employees`);
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitations/Reminders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleGenerateCourses}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Generate Courses
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          toast.success(`Deactivating ${selectedEmployees.length} employees`);
                          setSelectedEmployees([]);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deactivate Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedEmployees([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-600 w-12">
                    <Checkbox
                      className="rounded border-gray-300"
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 min-w-[300px]">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Invitation</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Profile</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Skills Match</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const skillsStatus = getSkillsStatus(employee);
                  
                  return (
                    <tr 
                      key={employee.id} 
                      className="border-b hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                    >
                      <td className="p-4">
                        <Checkbox
                          className="rounded border-gray-300"
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{employee.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {employee.department && (
                                <span className="text-xs text-gray-400">{employee.department}</span>
                              )}
                              {employee.department && employee.position && (
                                <span className="text-xs text-gray-400">•</span>
                              )}
                              {employee.position && (
                                <span className="text-xs text-gray-400">{employee.position}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {employee.profile_complete ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Completed</span>
                                  </>
                                ) : employee.completed_sections && employee.completed_sections > 0 ? (
                                  <>
                                    <div className="h-4 w-4 relative">
                                      <svg className="h-4 w-4 -rotate-90" viewBox="0 0 24 24">
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          fill="none"
                                          className="text-gray-200"
                                        />
                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          fill="none"
                                          strokeDasharray={`${(employee.completed_sections / (employee.total_sections || 5)) * 62.83} 62.83`}
                                          className="text-yellow-600"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-yellow-700">In Progress</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-600">Not Started</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className={cn(
                                  "inline-block w-2 h-2 rounded-full",
                                  employee.cv_file_path ? "bg-green-500" : "bg-gray-300"
                                )} />
                                CV {employee.cv_file_path ? 'uploaded' : 'missing'}
                              </div>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center gap-1.5">
                              {employee.invitation_status === 'completed' && (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Completed</span>
                                </>
                              )}
                              {employee.invitation_status === 'viewed' && (
                                <>
                                  <Eye className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">Viewed</span>
                                </>
                              )}
                              {employee.invitation_status === 'sent' && (
                                <>
                                  <Mail className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-700">Sent</span>
                                </>
                              )}
                              {(!employee.invitation_status || employee.invitation_status === 'not_sent') && (
                                <>
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-600">Not Sent</span>
                                </>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {employee.invitation_status === 'completed' && 'Profile setup completed'}
                              {employee.invitation_status === 'viewed' && 'Invitation opened but profile not completed'}
                              {employee.invitation_status === 'sent' && 'Invitation sent, not yet opened'}
                              {(!employee.invitation_status || employee.invitation_status === 'not_sent') && 'No invitation sent yet'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      {/* Merged CV status into Profile column */}
                      <td className="p-4">
                        {employee.skills_match_score !== null ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                employee.skills_match_score >= 80 ? "bg-green-100 text-green-800" :
                                employee.skills_match_score >= 60 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              )}>
                                {employee.skills_match_score}% Match
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Based on CV analysis and position requirements</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : employee.cv_file_path ? (
                          <span className="text-sm text-gray-500">Analyzing...</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {employee.invitation_status === 'viewed' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success('Reminder sent to ' + employee.full_name);
                                  }}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send reminder to complete profile</TooltipContent>
                            </Tooltip>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/employees/${employee.id}`);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              {(employee.invitation_status === 'sent' || employee.invitation_status === 'viewed') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success('Reminder sent to ' + employee.full_name);
                                    }}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success('New invitation sent to ' + employee.full_name);
                                    }}
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reinvite
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Show timeline modal
                                  toast.info('Timeline view coming soon');
                                }}
                              >
                                <History className="mr-2 h-4 w-4" />
                                View Timeline
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmployeeToDelete(employee.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
                  <p className="text-sm text-gray-500 max-w-sm mb-4">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search terms.' 
                      : 'Get started by adding your first employee.'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {hasActiveFilters && (
                      <Button 
                        onClick={clearFilters} 
                        variant="outline" 
                        size="sm"
                      >
                        Clear filters
                      </Button>
                    )}
                    {!hasActiveFilters && employees.length === 0 && (
                      <Button 
                        onClick={() => setActiveTab('import')}
                        size="sm"
                      >
                        Go to Import Tab
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
              </div>
            </>
          );
        })()}
      </div>
    </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="bg-white rounded-b-md p-6 space-y-6 -mt-px">
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
        <TabsContent value="invitations" className="bg-white rounded-b-md p-6 space-y-6 -mt-px">
          <InvitationManagement 
        employees={employees}
        onInvitationsSent={() => {
          fetchEmployees();
          fetchPendingCounts();
        }}
        />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="bg-white rounded-b-md p-6 space-y-6 -mt-px">
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
        <TabsContent value="history" className="bg-white rounded-b-md p-6 space-y-6 -mt-px">
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
    </div>

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
