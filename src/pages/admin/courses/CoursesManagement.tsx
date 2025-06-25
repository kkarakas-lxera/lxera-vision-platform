import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CompanySelector } from '@/components/admin/shared/CompanySelector';
import { CourseAssignmentTracker } from '@/components/admin/CourseManagement/CourseAssignmentTracker';
import { CourseGenerationManager } from '@/components/admin/CourseGenerationManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search,
  FileDown,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Brain,
  Zap
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface CourseModule {
  content_id: string;
  module_name: string;
  employee_name: string;
  status: string;
  priority_level: string;
  total_word_count: number;
  created_at: string;
  section_word_counts?: {
    introduction: number;
    core_content: number;
    practical_applications: number;
    case_studies: number;
    assessments: number;
  };
}

interface QualityAssessment {
  assessment_id: string;
  content_id: string;
  overall_score: number;
  passed: boolean;
  assessed_at: string;
}

interface CourseAssignment {
  id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  assigned_at: string;
  completed_at?: string;
}

const CoursesManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company');
  const { toast } = useToast();
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyIdFromUrl);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [qualityAssessments, setQualityAssessments] = useState<QualityAssessment[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('modules');

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCourseData();
      // Update URL
      setSearchParams({ company: selectedCompanyId });
    }
  }, [selectedCompanyId]);

  const fetchCourseData = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);
      
      // Fetch course modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch quality assessments
      const { data: qualityData, error: qualityError } = await supabase
        .from('cm_quality_assessments')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('assessed_at', { ascending: false });

      if (qualityError) console.error('Error fetching quality assessments:', qualityError);
      else setQualityAssessments(qualityData || []);

      // Fetch course assignments count
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('company_id', selectedCompanyId);

      if (assignmentsError) console.error('Error fetching assignments:', assignmentsError);
      else setAssignments(assignmentsData || []);

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Module Name', 'Employee', 'Status', 'Priority', 'Word Count', 'Created Date'],
      ...getFilteredModules().map(module => [
        module.module_name,
        module.employee_name,
        module.status,
        module.priority_level,
        module.total_word_count,
        new Date(module.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses_${selectedCompanyId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredModules = () => {
    let filtered = modules;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(module => module.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(module => module.priority_level === priorityFilter);
    }

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'quality_check':
        return <Brain className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary' as const,
      quality_check: 'default' as const,
      approved: 'default' as const,
      failed: 'destructive' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive' as const,
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

  const getQualityScoreForModule = (contentId: string) => {
    const assessment = qualityAssessments.find(qa => qa.content_id === contentId);
    return assessment?.overall_score;
  };

  const calculateStats = () => {
    const totalModules = modules.length;
    const approvedModules = modules.filter(m => m.status === 'approved').length;
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const avgProgress = totalAssignments > 0
      ? Math.round(assignments.reduce((sum, a) => sum + a.progress_percentage, 0) / totalAssignments)
      : 0;
    const avgQualityScore = qualityAssessments.length > 0
      ? (qualityAssessments.reduce((sum, qa) => sum + qa.overall_score, 0) / qualityAssessments.length).toFixed(1)
      : 0;

    return {
      totalModules,
      approvedModules,
      totalAssignments,
      completedAssignments,
      avgProgress,
      avgQualityScore
    };
  };

  const stats = calculateStats();
  const filteredModules = getFilteredModules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <p className="text-gray-600">Manage courses and assignments by company</p>
      </div>

      {/* Company Selector */}
      <CompanySelector
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={handleCompanyChange}
        showStats={true}
      />

      {!selectedCompanyId ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a company to view and manage courses
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalModules}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.approvedModules} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedAssignments} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                <Progress value={stats.avgProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgQualityScore}/10</div>
                <p className="text-xs text-muted-foreground">Average score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.filter(m => m.status === 'draft' || m.status === 'quality_check').length}
                </div>
                <p className="text-xs text-muted-foreground">Being processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.length > 0 
                    ? Math.round((modules.filter(m => m.status === 'approved').length / modules.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Approval rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules">Course Modules</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="generation">Course Generation</TabsTrigger>
            </TabsList>

            {/* Course Modules Tab */}
            <TabsContent value="modules">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Course Modules</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search modules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-[200px]"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="quality_check">Quality Check</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
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
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Loading modules...</p>
                    </div>
                  ) : filteredModules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No modules found matching your filters</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Module</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Quality Score</TableHead>
                          <TableHead>Word Count</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredModules.map((module) => {
                          const qualityScore = getQualityScoreForModule(module.content_id);
                          return (
                            <TableRow key={module.content_id}>
                              <TableCell className="font-medium">
                                <div className="max-w-[300px]">
                                  <p className="truncate">{module.module_name}</p>
                                </div>
                              </TableCell>
                              <TableCell>{module.employee_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(module.status)}
                                  {getStatusBadge(module.status)}
                                </div>
                              </TableCell>
                              <TableCell>{getPriorityBadge(module.priority_level)}</TableCell>
                              <TableCell>
                                {qualityScore ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{qualityScore}/10</span>
                                    {qualityScore >= 7 ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Not assessed</span>
                                )}
                              </TableCell>
                              <TableCell>{module.total_word_count.toLocaleString()}</TableCell>
                              <TableCell>{new Date(module.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments">
              <CourseAssignmentTracker />
            </TabsContent>

            {/* Course Generation Tab */}
            <TabsContent value="generation">
              <CourseGenerationManager />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CoursesManagement;