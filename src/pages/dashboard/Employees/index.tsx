import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
import AddEmployees from '@/components/dashboard/EmployeeOnboarding/AddEmployees';
import BulkCVUpload from '@/components/dashboard/EmployeeOnboarding/BulkCVUpload';
import CourseGenerationModal from '@/pages/dashboard/Courses/CourseGenerationModal';

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
}

const EmployeesPage = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEmployees, setShowAddEmployees] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCourseGeneration, setShowCourseGeneration] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployees();
    }
  }, [userProfile]);

  const fetchEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_company_employees')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
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

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (employee.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getSkillsStatus = (employee: Employee) => {
    if (!employee.skills_last_analyzed) {
      return { status: 'not-analyzed', color: 'bg-gray-100 text-gray-800', text: 'Not Analyzed' };
    }
    
    if (employee.skills_match_score === null) {
      return { status: 'analyzing', color: 'bg-blue-100 text-blue-800', text: 'Analyzing' };
    }

    const score = employee.skills_match_score;
    if (score >= 80) {
      return { status: 'good', color: 'bg-green-100 text-green-800', text: `${score}% Match` };
    } else if (score >= 60) {
      return { status: 'moderate', color: 'bg-yellow-100 text-yellow-800', text: `${score}% Match` };
    } else {
      return { status: 'poor', color: 'bg-red-100 text-red-800', text: `${score}% Match` };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your team and track their learning progress</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkUpload(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowAddEmployees(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{employees.length}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CV Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {employees.filter(e => e.cv_file_path).length}
              </span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skills Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {employees.filter(e => e.skills_last_analyzed).length}
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {employees.filter(e => e.skills_match_score !== null).length > 0
                  ? Math.round(
                      employees
                        .filter(e => e.skills_match_score !== null)
                        .reduce((sum, e) => sum + (e.skills_match_score || 0), 0) /
                      employees.filter(e => e.skills_match_score !== null).length
                    )
                  : 0}%
              </span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedEmployees.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleGenerateCourses} size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Courses ({selectedEmployees.length})
            </Button>
          </div>
        )}
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
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
                  <th className="text-left p-4">Employee</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Position</th>
                  <th className="text-left p-4">CV Status</th>
                  <th className="text-left p-4">Skills Analysis</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const skillsStatus = getSkillsStatus(employee);
                  
                  return (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
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
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </td>
                      <td className="p-4">{employee.department || '-'}</td>
                      <td className="p-4">{employee.position || '-'}</td>
                      <td className="p-4">
                        <Badge variant={employee.cv_file_path ? "default" : "secondary"}>
                          {employee.cv_file_path ? 'Uploaded' : 'Not Uploaded'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={skillsStatus.color}>
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
                            <DropdownMenuItem>
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
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first employee.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEmployees 
        isOpen={showAddEmployees}
        onClose={() => setShowAddEmployees(false)}
        onComplete={() => {
          setShowAddEmployees(false);
          fetchEmployees();
        }}
      />

      <BulkCVUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onComplete={() => {
          setShowBulkUpload(false);
          fetchEmployees();
        }}
      />

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
    </div>
  );
};

export default EmployeesPage;
