import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CompanySelector } from '@/components/admin/shared/CompanySelector';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  Building2,
  BookOpen,
  Clock,
  Award,
  Activity,
  PieChart,
  Calendar
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PlatformStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completedCourses: number;
  totalLearningHours: number;
  avgCompletionRate: number;
}

interface CompanyAnalytics {
  company: {
    id: string;
    name: string;
    plan_type: string;
  };
  employeeCount: number;
  activeEmployees: number;
  courseCount: number;
  completedCourses: number;
  avgLearningHours: number;
  completionRate: number;
}

interface DepartmentStats {
  department: string;
  employeeCount: number;
  coursesCompleted: number;
  avgLearningHours: number;
  completionRate: number;
}

const AnalyticsDashboard = () => {
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company');
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyIdFromUrl);
  const [activeTab, setActiveTab] = useState(companyIdFromUrl ? 'company' : 'platform');
  const [loading, setLoading] = useState(true);
  
  // Platform overview data
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    completedCourses: 0,
    totalLearningHours: 0,
    avgCompletionRate: 0,
  });
  const [topCompanies, setTopCompanies] = useState<CompanyAnalytics[]>([]);
  const [planDistribution, setPlanDistribution] = useState<Record<string, number>>({});
  
  // Company deep dive data
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);
  const [courseMetrics, setCourseMetrics] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'platform') {
      fetchPlatformAnalytics();
    } else if (activeTab === 'company' && selectedCompanyId) {
      fetchCompanyAnalytics();
    }
  }, [activeTab, selectedCompanyId]);

  const fetchPlatformAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch companies stats
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, plan_type, is_active');

      const totalCompanies = companies?.length || 0;
      const activeCompanies = companies?.filter(c => c.is_active).length || 0;

      // Fetch users stats
      const { data: users } = await supabase
        .from('users')
        .select('id, is_active, role');

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active).length || 0;

      // Fetch courses stats
      const { data: courses } = await supabase
        .from('cm_module_content')
        .select('content_id, status');

      const totalCourses = courses?.length || 0;
      const completedCourses = courses?.filter(c => c.status === 'approved').length || 0;

      // Fetch learning hours
      const { data: employees } = await supabase
        .from('employees')
        .select('total_learning_hours');

      const totalLearningHours = employees?.reduce((sum, e) => sum + (e.total_learning_hours || 0), 0) || 0;

      // Fetch assignments for completion rate
      const { data: assignments } = await supabase
        .from('course_assignments')
        .select('progress_percentage');

      const avgCompletionRate = assignments && assignments.length > 0
        ? Math.round(assignments.reduce((sum, a) => sum + a.progress_percentage, 0) / assignments.length)
        : 0;

      setPlatformStats({
        totalCompanies,
        activeCompanies,
        totalUsers,
        activeUsers,
        totalCourses,
        completedCourses,
        totalLearningHours: Math.round(totalLearningHours),
        avgCompletionRate,
      });

      // Plan distribution
      if (companies) {
        const distribution = companies.reduce((acc: Record<string, number>, company) => {
          acc[company.plan_type] = (acc[company.plan_type] || 0) + 1;
          return acc;
        }, {});
        setPlanDistribution(distribution);
      }

      // Fetch top companies
      await fetchTopCompanies();

    } catch (error) {
      console.error('Error fetching platform analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCompanies = async () => {
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, plan_type')
        .eq('is_active', true);

      if (!companies) return;

      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          // Get employee stats
          const { data: employees } = await supabase
            .from('employees')
            .select('id, is_active, courses_completed, total_learning_hours')
            .eq('company_id', company.id);

          const employeeCount = employees?.length || 0;
          const activeEmployees = employees?.filter(e => e.is_active).length || 0;
          const totalCoursesCompleted = employees?.reduce((sum, e) => sum + (e.courses_completed || 0), 0) || 0;
          const totalLearningHours = employees?.reduce((sum, e) => sum + (e.total_learning_hours || 0), 0) || 0;

          // Get course stats
          const { data: courses } = await supabase
            .from('cm_module_content')
            .select('content_id, status')
            .eq('company_id', company.id);

          const courseCount = courses?.length || 0;
          const completedCourses = courses?.filter(c => c.status === 'approved').length || 0;

          // Get assignment completion rate
          const { data: assignments } = await supabase
            .from('course_assignments')
            .select('progress_percentage')
            .eq('company_id', company.id);

          const completionRate = assignments && assignments.length > 0
            ? Math.round(assignments.reduce((sum, a) => sum + a.progress_percentage, 0) / assignments.length)
            : 0;

          return {
            company,
            employeeCount,
            activeEmployees,
            courseCount,
            completedCourses,
            avgLearningHours: employeeCount > 0 ? Math.round(totalLearningHours / employeeCount) : 0,
            completionRate,
          };
        })
      );

      // Sort by completion rate and take top 5
      const sorted = companiesWithStats.sort((a, b) => b.completionRate - a.completionRate);
      setTopCompanies(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching top companies:', error);
    }
  };

  const fetchCompanyAnalytics = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);

      // Fetch department stats
      const { data: employees } = await supabase
        .from('employees')
        .select('department, courses_completed, total_learning_hours, is_active')
        .eq('company_id', selectedCompanyId);

      if (employees) {
        const deptStats = employees.reduce((acc: Record<string, DepartmentStats>, emp) => {
          const dept = emp.department || 'Unassigned';
          if (!acc[dept]) {
            acc[dept] = {
              department: dept,
              employeeCount: 0,
              coursesCompleted: 0,
              avgLearningHours: 0,
              completionRate: 0,
            };
          }
          acc[dept].employeeCount++;
          acc[dept].coursesCompleted += emp.courses_completed || 0;
          acc[dept].avgLearningHours += emp.total_learning_hours || 0;
          return acc;
        }, {});

        // Calculate averages
        const deptArray = Object.values(deptStats).map(dept => ({
          ...dept,
          avgLearningHours: dept.employeeCount > 0 
            ? Math.round(dept.avgLearningHours / dept.employeeCount) 
            : 0,
        }));

        setDepartmentStats(deptArray);
      }

      // Fetch user engagement data
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, last_login, is_active, employees!inner(courses_completed, total_learning_hours)')
        .eq('company_id', selectedCompanyId)
        .order('last_login', { ascending: false })
        .limit(10);

      if (users) {
        const engagement = users.map(user => ({
          name: user.full_name,
          lastLogin: user.last_login,
          isActive: user.is_active,
          coursesCompleted: user.employees?.[0]?.courses_completed || 0,
          learningHours: user.employees?.[0]?.total_learning_hours || 0,
        }));
        setUserEngagement(engagement);
      }

      // Fetch course metrics
      const { data: courses } = await supabase
        .from('cm_module_content')
        .select(`
          module_name,
          status,
          total_word_count,
          created_at,
          cm_quality_assessments!left(overall_score)
        `)
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (courses) {
        const metrics = courses.map(course => ({
          name: course.module_name,
          status: course.status,
          wordCount: course.total_word_count,
          qualityScore: course.cm_quality_assessments?.[0]?.overall_score || null,
          createdAt: course.created_at,
        }));
        setCourseMetrics(metrics);
      }

    } catch (error) {
      console.error('Error fetching company analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setActiveTab('company');
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      trial: 'bg-yellow-500',
      basic: 'bg-blue-500',
      premium: 'bg-purple-500',
      enterprise: 'bg-green-500',
    };
    return colors[plan as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Platform-wide insights and company analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="platform">Platform Overview</TabsTrigger>
          <TabsTrigger value="company">Company Deep Dive</TabsTrigger>
        </TabsList>

        {/* Platform Overview Tab */}
        <TabsContent value="platform" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Platform Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalCompanies}</div>
                    <p className="text-xs text-muted-foreground">
                      {platformStats.activeCompanies} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {platformStats.activeUsers} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalCourses}</div>
                    <p className="text-xs text-muted-foreground">
                      {platformStats.completedCourses} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats.totalLearningHours.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Total across platform
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Plan Distribution
                    </CardTitle>
                    <CardDescription>Companies by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(planDistribution).map(([plan, count]) => {
                        const percentage = Math.round((count / platformStats.totalCompanies) * 100);
                        return (
                          <div key={plan}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium capitalize">{plan}</span>
                              <span className="text-sm text-muted-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Companies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Performing Companies
                    </CardTitle>
                    <CardDescription>By course completion rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Completion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topCompanies.map((company, index) => (
                          <TableRow key={company.company.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {index + 1}. {company.company.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {company.company.plan_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={company.completionRate} className="w-16 h-2" />
                                <span className="text-sm font-medium">{company.completionRate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Metrics
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Completion Rate</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold">{platformStats.avgCompletionRate}%</span>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active User Rate</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold">
                          {Math.round((platformStats.activeUsers / platformStats.totalUsers) * 100) || 0}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Course Success Rate</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold">
                          {Math.round((platformStats.completedCourses / platformStats.totalCourses) * 100) || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Company Deep Dive Tab */}
        <TabsContent value="company" className="space-y-6">
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={handleCompanyChange}
            showStats={true}
          />

          {selectedCompanyId && !loading ? (
            <>
              {/* Department Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Department Analytics
                  </CardTitle>
                  <CardDescription>Performance by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Courses Completed</TableHead>
                        <TableHead>Avg Learning Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentStats.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell>{dept.employeeCount}</TableCell>
                          <TableCell>{dept.coursesCompleted}</TableCell>
                          <TableCell>{dept.avgLearningHours}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Engagement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Engagement
                    </CardTitle>
                    <CardDescription>Recent user activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userEngagement.map((user, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.coursesCompleted} courses • {user.learningHours}h learning
                            </p>
                          </div>
                          <div className="text-right">
                            {user.lastLogin ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.lastLogin).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Never logged in</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Recent Courses
                    </CardTitle>
                    <CardDescription>Latest course modules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseMetrics.map((course, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate pr-2">{course.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {course.status}
                              </Badge>
                              {course.qualityScore && (
                                <span className="text-xs text-muted-foreground">
                                  Quality: {course.qualityScore}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : selectedCompanyId && loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading company analytics...</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a company to view detailed analytics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;