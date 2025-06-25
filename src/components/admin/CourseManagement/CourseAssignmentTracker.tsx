import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { useContentManager } from '@/lib/ContentManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

interface Assignment {
  id: string;
  employee_id: string;
  course_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  progress_percentage: number;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high';
  employees?: {
    id: string;
    user_id: string;
    department?: string;
    position?: string;
  };
  cm_module_content?: {
    module_name: string;
    status: string;
  } | null;
}

interface FilterOptions {
  status: string;
  department: string;
  priority: string;
}

export const CourseAssignmentTracker = () => {
  const { userProfile } = useAuth();
  const contentManager = useContentManager();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    department: 'all',
    priority: 'all'
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    avgCompletion: 0
  });

  useEffect(() => {
    fetchAssignments();
    fetchDepartments();
  }, [userProfile?.company_id]);

  useEffect(() => {
    calculateStats();
  }, [assignments]);

  const fetchDepartments = async () => {
    try {
      let query = supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);
      
      // Only filter by company if user is not super admin
      if (userProfile?.role !== 'super_admin' && userProfile?.company_id) {
        query = query.eq('company_id', userProfile.company_id);
      }
      
      const { data } = await query;

      if (data) {
        const uniqueDepts = [...new Set(data.map(d => d.department))].filter(Boolean);
        setDepartments(uniqueDepts as string[]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await contentManager.get_employee_progress();
      setAssignments(data as unknown as Assignment[]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const overdue = assignments.filter(a => {
      if (!a.due_date || a.status === 'completed') return false;
      return new Date(a.due_date) < new Date();
    }).length;
    
    const avgCompletion = total > 0
      ? Math.round(assignments.reduce((sum, a) => sum + a.progress_percentage, 0) / total)
      : 0;

    setStats({ total, completed, inProgress, overdue, avgCompletion });
  };

  const getFilteredAssignments = () => {
    return assignments.filter(assignment => {
      if (filters.status !== 'all' && assignment.status !== filters.status) return false;
      if (filters.department !== 'all' && assignment.employees?.department !== filters.department) return false;
      if (filters.priority !== 'all' && assignment.priority !== filters.priority) return false;
      return true;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'completed';
    const actualStatus = isOverdue ? 'overdue' : status;
    
    const variants = {
      completed: 'default' as const,
      in_progress: 'secondary' as const,
      assigned: 'outline' as const,
      overdue: 'destructive' as const
    };

    return (
      <Badge variant={variants[actualStatus as keyof typeof variants] || 'outline'}>
        {actualStatus.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading assignment data...</p>
        </div>
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <Progress value={stats.avgCompletion} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Course Assignments</CardTitle>
              <CardDescription>Track employee course progress and completion</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments found matching your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.cm_module_content?.module_name || 'Unknown Course'}
                    </TableCell>
                    <TableCell>{assignment.employee_id}</TableCell>
                    <TableCell>{assignment.employees?.department || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(assignment.status)}
                        {getStatusBadge(assignment.status, assignment.due_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={assignment.progress_percentage} className="w-[100px]" />
                        <span className="text-xs text-muted-foreground">{assignment.progress_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(assignment.priority)}</TableCell>
                    <TableCell>
                      {assignment.due_date ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(assignment.due_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No deadline</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
