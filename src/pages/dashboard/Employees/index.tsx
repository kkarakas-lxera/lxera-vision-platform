import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw,
  Plus,
  UserCheck,
  Building,
  Briefcase,
  Mail,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  is_active: boolean;
  skills_count: number;
  match_score: number;
  last_analyzed: string | null;
  cv_uploaded: boolean;
  skills_profile?: {
    extracted_skills: Array<{
      skill_id: string;
      skill_name: string;
      proficiency_level: number;
      skill_type?: string;
    }>;
    skills_match_score: number;
    analyzed_at: string;
  };
}

interface SummaryStats {
  totalEmployees: number;
  analyzedCount: number;
  analyzedPercentage: number;
  avgMatchScore: number;
  activeCoursesCount: number;
}

export default function Employees() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [skillsStatusFilter, setSkillsStatusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalEmployees: 0,
    analyzedCount: 0,
    analyzedPercentage: 0,
    avgMatchScore: 0,
    activeCoursesCount: 0
  });

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployees();
    } else {
      setLoading(false); // Stop loading if no company_id
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  useEffect(() => {
    filterEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, searchTerm, departmentFilter, positionFilter, skillsStatusFilter, statusFilter]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // First get employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          department,
          position,
          is_active,
          cv_file_path,
          users!left(full_name, email)
        `)
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;

      // Then get skills profiles separately to bypass RLS join issues
      const employeeIds = employeesData?.map(e => e.id) || [];
      const { data: skillsProfiles, error: profilesError } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, analyzed_at, extracted_skills')
        .in('employee_id', employeeIds);

      if (profilesError) {
        console.error('Error fetching skills profiles:', profilesError);
      }

      // Create a map for easy lookup
      const profileMap = new Map();
      skillsProfiles?.forEach(profile => {
        profileMap.set(profile.employee_id, profile);
      });

      // Merge the data
      const data = employeesData?.map(emp => ({
        ...emp,
        st_employee_skills_profile: profileMap.get(emp.id) ? [profileMap.get(emp.id)] : []
      })) || [];

      // Transform the data
      const transformedEmployees: Employee[] = (data || []).map(emp => {
        const skillsProfile = emp.st_employee_skills_profile?.[0];
        // Handle both array and non-array cases for extracted_skills
        let extractedSkills = [];
        if (skillsProfile?.extracted_skills) {
          if (Array.isArray(skillsProfile.extracted_skills)) {
            extractedSkills = skillsProfile.extracted_skills;
          } else if (typeof skillsProfile.extracted_skills === 'object') {
            // Sometimes Supabase returns JSONB arrays as objects
            extractedSkills = Object.values(skillsProfile.extracted_skills);
          }
        }
        
        
        return {
          id: emp.id,
          user_id: emp.user_id,
          full_name: emp.users?.full_name || 'Unknown',
          email: emp.users?.email || 'No email',
          department: emp.department || 'Not assigned',
          position: emp.position || 'Not assigned',
          is_active: emp.is_active,
          skills_count: extractedSkills.length,
          match_score: Math.round(skillsProfile?.skills_match_score || 0),
          last_analyzed: skillsProfile?.analyzed_at || null,
          cv_uploaded: !!emp.cv_file_path,
          skills_profile: skillsProfile
        };
      });

      setEmployees(transformedEmployees);

      // Extract unique departments and positions
      const uniqueDepartments = [...new Set(transformedEmployees.map(emp => emp.department))].filter(d => d !== 'Not assigned');
      const uniquePositions = [...new Set(transformedEmployees.map(emp => emp.position))].filter(p => p !== 'Not assigned');
      
      setDepartments(uniqueDepartments);
      setPositions(uniquePositions);

      // Calculate summary stats
      const activeEmployees = transformedEmployees.filter(emp => emp.is_active);
      const analyzedEmployees = activeEmployees.filter(emp => emp.skills_count > 0);
      const avgScore = analyzedEmployees.length > 0
        ? analyzedEmployees.reduce((sum, emp) => sum + emp.match_score, 0) / analyzedEmployees.length
        : 0;

      setSummaryStats({
        totalEmployees: activeEmployees.length,
        analyzedCount: analyzedEmployees.length,
        analyzedPercentage: activeEmployees.length > 0 
          ? Math.round((analyzedEmployees.length / activeEmployees.length) * 100)
          : 0,
        avgMatchScore: Math.round(avgScore),
        activeCoursesCount: 0 // TODO: Fetch actual course count
      });

    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.full_name.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search) ||
        emp.position.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(emp => emp.position === positionFilter);
    }

    // Skills status filter
    if (skillsStatusFilter === 'analyzed') {
      filtered = filtered.filter(emp => emp.skills_count > 0);
    } else if (skillsStatusFilter === 'not_analyzed') {
      filtered = filtered.filter(emp => emp.skills_count === 0);
    }

    // Active status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(emp => emp.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(emp => !emp.is_active);
    }

    setFilteredEmployees(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEmployees.size === 0) {
      toast.error('No employees selected');
      return;
    }

    switch (action) {
      case 'export':
        exportSelectedEmployees();
        break;
      case 'deactivate':
        await deactivateEmployees();
        break;
      // Add more bulk actions as needed
      default:
        toast.info(`${action} feature coming soon`);
    }
  };

  const exportSelectedEmployees = () => {
    const selectedData = employees.filter(emp => selectedEmployees.has(emp.id));
    const csv = [
      ['Name', 'Email', 'Department', 'Position', 'Skills Count', 'Match Score', 'Status'],
      ...selectedData.map(emp => [
        emp.full_name,
        emp.email,
        emp.department,
        emp.position,
        emp.skills_count.toString(),
        emp.match_score.toString(),
        emp.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedData.length} employees`);
  };

  const deactivateEmployees = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .in('id', Array.from(selectedEmployees));

      if (error) throw error;

      toast.success(`Deactivated ${selectedEmployees.size} employees`);
      setSelectedEmployees(new Set());
      fetchEmployees();
    } catch (error) {
      console.error('Error deactivating employees:', error);
      toast.error('Failed to deactivate employees');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your workforce and track employee progress
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/onboarding')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Employees
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{summaryStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyzed</p>
                <p className="text-2xl font-bold">{summaryStats.analyzedPercentage}%</p>
                <p className="text-xs text-muted-foreground">{summaryStats.analyzedCount} employees</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold">{summaryStats.avgMatchScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{summaryStats.activeCoursesCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={skillsStatusFilter} onValueChange={setSkillsStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Skills Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="not_analyzed">Not Analyzed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchEmployees}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedEmployees.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmployees(new Set())}
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('assign_course')}
                >
                  Assign to Course
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('update_department')}
                >
                  Update Department
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={filteredEmployees.length > 0 && selectedEmployees.size === filteredEmployees.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Position</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Department</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Skills</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Match Score</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedEmployees.has(employee.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{employee.full_name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                            className="h-7 text-xs"
                          >
                            View Profile
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{employee.position}</td>
                    <td className="p-4 text-sm">{employee.department}</td>
                    <td className="p-4">
                      {employee.skills_count > 0 ? (
                        <Badge variant="outline">{employee.skills_count} skills</Badge>
                      ) : (
                        <Badge variant="secondary">Not analyzed</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {employee.skills_count > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{employee.match_score}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${employee.match_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {employee.last_analyzed ? new Date(employee.last_analyzed).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No employees found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || departmentFilter !== 'all' || positionFilter !== 'all' || skillsStatusFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Click "Add Employees" to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          {selectedEmployee && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedEmployee.full_name}</SheetTitle>
                <SheetDescription>{selectedEmployee.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium">{selectedEmployee.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{selectedEmployee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={selectedEmployee.is_active ? 'default' : 'secondary'}>
                          {selectedEmployee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Analyzed</p>
                        <p className="font-medium">
                          {selectedEmployee.last_analyzed 
                            ? new Date(selectedEmployee.last_analyzed).toLocaleDateString() 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                {selectedEmployee.skills_count > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Skills Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Match Score</span>
                        <span className="font-medium">{selectedEmployee.match_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedEmployee.match_score}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedEmployee.skills_count} skills identified
                      </p>
                      {selectedEmployee.skills_profile?.extracted_skills && (
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills_profile.extracted_skills.slice(0, 10).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill.skill_name} ({skill.proficiency_level}/5)
                            </Badge>
                          ))}
                          {selectedEmployee.skills_profile.extracted_skills.length > 10 && (
                            <Badge variant="secondary" className="text-xs">
                              +{selectedEmployee.skills_profile.extracted_skills.length - 10} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-medium">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => {
                        navigate(`/dashboard/employees/${selectedEmployee.id}`);
                        setSelectedEmployee(null);
                      }}
                    >
                      View Full Profile
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Assign to Course
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Export Employee Data
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}