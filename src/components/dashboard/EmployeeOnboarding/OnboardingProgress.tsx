import React, { useState } from 'react';
import { RefreshCw, Upload, FileText, BarChart3, CheckCircle, AlertCircle, User, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CVUploadDialog } from './CVUploadDialog';

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  course_generation: 'pending' | 'in_progress' | 'completed' | 'failed';
  gap_score?: number;
}

interface OnboardingProgressProps {
  employees: EmployeeStatus[];
  onRefresh: () => void;
}

export function OnboardingProgress({ employees, onRefresh }: OnboardingProgressProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeStatus | null>(null);
  const [showCVUpload, setShowCVUpload] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
      case 'processing':
        return <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'in_progress':
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'uploaded':
        return <Badge className="bg-orange-100 text-orange-800">Uploaded</Badge>;
      case 'analyzed':
        return <Badge className="bg-purple-100 text-purple-800">Analyzed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getOverallProgress = (employee: EmployeeStatus) => {
    let progress = 0;
    if (employee.cv_status === 'uploaded' || employee.cv_status === 'analyzed') progress += 33;
    if (employee.skills_analysis === 'completed') progress += 33;
    if (employee.course_generation === 'completed') progress += 34;
    return progress;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'needs_cv') return emp.cv_status === 'missing';
    if (statusFilter === 'needs_analysis') return emp.cv_status === 'uploaded' && emp.skills_analysis === 'pending';
    if (statusFilter === 'completed') return emp.course_generation === 'completed';
    
    return true;
  });

  const getGapScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Employee Progress Tracking</CardTitle>
              <CardDescription>
                Monitor CV uploads, skills analysis, and course generation progress
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="needs_cv">Needs CV Upload</SelectItem>
                <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee List */}
          <div className="space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {employees.length === 0 ? 'No employees imported yet' : 'No employees match your search criteria'}
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {employee.position}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      {employee.gap_score && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Skills Match</div>
                          <div className={`font-bold ${getGapScoreColor(employee.gap_score)}`}>
                            {employee.gap_score}%
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-bold text-foreground">
                          {getOverallProgress(employee)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={getOverallProgress(employee)} className="mb-3" />

                  {/* Status Steps */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">CV Upload</span>
                          {getStatusIcon(employee.cv_status)}
                        </div>
                        {getStatusBadge(employee.cv_status)}
                        {employee.cv_status === 'missing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowCVUpload(true);
                            }}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload CV
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Skills Analysis</span>
                          {getStatusIcon(employee.skills_analysis)}
                        </div>
                        {getStatusBadge(employee.skills_analysis)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Course Generation</span>
                          {getStatusIcon(employee.course_generation)}
                        </div>
                        {getStatusBadge(employee.course_generation)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {employees.filter(e => e.cv_status === 'missing').length}
            </div>
            <div className="text-sm text-muted-foreground">Need CV Upload</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {employees.filter(e => e.cv_status === 'uploaded' && e.skills_analysis === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Analysis</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {employees.filter(e => e.skills_analysis === 'completed' && e.course_generation === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Ready for Courses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.course_generation === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Fully Onboarded</div>
          </CardContent>
        </Card>
      </div>

      {/* CV Upload Dialog */}
      {selectedEmployee && (
        <CVUploadDialog
          employee={{
            id: selectedEmployee.id,
            name: selectedEmployee.name,
            email: selectedEmployee.email
          }}
          open={showCVUpload}
          onOpenChange={(open) => {
            setShowCVUpload(open);
            if (!open) {
              setSelectedEmployee(null);
            }
          }}
          onUploadComplete={() => {
            setShowCVUpload(false);
            setSelectedEmployee(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}