
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Activity,
  Plus,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserEditSheet } from '@/components/admin/UserManagement/UserEditSheet';
import { CompanyEditSheet } from '@/components/admin/CompanyManagement/CompanyEditSheet';
import { CourseAssignmentTracker } from '@/components/admin/CourseManagement/CourseAssignmentTracker';

interface Company {
  id: string;
  name: string;
  domain: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
  max_employees: number;
  max_courses: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  position?: string;
  department?: string;
  last_login?: string;
}

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserSheetOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanySheetOpen(true);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch course modules count
      const { data: coursesData, error: coursesError } = await supabase
        .from('cm_module_content')
        .select('content_id');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      }

      // Calculate stats
      const totalCompanies = companiesData?.length || 0;
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(user => user.is_active).length || 0;
      const totalCourses = coursesData?.length || 0;

      setStats({
        totalCompanies,
        totalUsers,
        activeUsers,
        totalCourses
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage companies, users, and platform overview</p>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-black/80">Active organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-black/80">{stats.activeUsers} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-black/80">Generated content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-black/80">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Companies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Companies</CardTitle>
                    <CardDescription>Latest registered companies</CardDescription>
                  </div>
                  <Button size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No companies found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies.slice(0, 3).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-sm">{company.name}</h3>
                            <p className="text-xs text-gray-600">{company.domain}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{company.plan_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest user registrations</CardDescription>
                  </div>
                  <Button size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {user.is_active ? (
                            <UserCheck className="h-6 w-6 text-green-600" />
                          ) : (
                            <UserX className="h-6 w-6 text-red-600" />
                          )}
                          <div>
                            <h3 className="font-medium text-sm">{user.full_name}</h3>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'secondary'} className="text-xs">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {user.is_active ? (
                          <UserCheck className="h-8 w-8 text-green-600" />
                        ) : (
                          <UserX className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-medium">{user.full_name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : user.role === 'company_admin' ? 'default' : 'secondary'}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={user.email_verified ? 'default' : 'outline'}>
                          {user.email_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Company Management</CardTitle>
                  <CardDescription>Manage all registered companies</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No companies found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.domain}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={company.is_active ? 'default' : 'secondary'}>
                          {company.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{company.plan_type}</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <CourseAssignmentTracker />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Activity feed coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Edit Sheet */}
      <UserEditSheet
        user={selectedUser}
        open={userSheetOpen}
        onOpenChange={setUserSheetOpen}
        onUserUpdated={fetchDashboardData}
      />

      {/* Company Edit Sheet */}
      <CompanyEditSheet
        company={selectedCompany}
        open={companySheetOpen}
        onOpenChange={setCompanySheetOpen}
        onCompanyUpdated={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;
