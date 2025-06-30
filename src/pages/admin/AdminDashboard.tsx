import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  UserX,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserEditSheet } from '@/components/admin/UserManagement/UserEditSheet';
import { CompanyEditSheet } from '@/components/admin/CompanyManagement/CompanyEditSheet';
import { CompanyCreateSheet } from '@/components/admin/CompanyManagement/CompanyCreateSheet';
import { CourseAssignmentTracker } from '@/components/admin/CourseManagement/CourseAssignmentTracker';
import { CompactDemoRequestsTable } from '@/components/admin/DemoRequestsManagement/CompactDemoRequestsTable';
import { demoRequestService } from '@/services/demoRequestService';

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
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    demoRequests: 0,
    newDemoRequests: 0
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [companyCreateSheetOpen, setCompanyCreateSheetOpen] = useState(false);

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

  const handleCreateCompany = () => {
    setCompanyCreateSheetOpen(true);
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

      // Fetch demo request stats
      const demoStats = await demoRequestService.getDemoRequestStats();

      // Calculate stats
      const totalCompanies = companiesData?.length || 0;
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(user => user.is_active).length || 0;
      const totalCourses = coursesData?.length || 0;

      setStats({
        totalCompanies,
        totalUsers,
        activeUsers,
        totalCourses,
        demoRequests: demoStats.total,
        newDemoRequests: demoStats.new
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-future-green mx-auto mb-2"></div>
          <p className="text-business-black/70">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-business-black">Admin Dashboard</h1>
        <p className="text-lg text-business-black/60">Manage companies, users, and platform overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Total Companies</CardTitle>
            <div className="w-12 h-12 bg-future-green/10 rounded-2xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-future-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-business-black mb-2">{stats.totalCompanies}</div>
            <p className="text-sm text-business-black/60">Active organizations</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Total Users</CardTitle>
            <div className="w-12 h-12 bg-future-green/10 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-future-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-business-black mb-2">{stats.totalUsers}</div>
            <p className="text-sm text-business-black/60">{stats.activeUsers} active users</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Course Modules</CardTitle>
            <div className="w-12 h-12 bg-future-green/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-future-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-business-black mb-2">{stats.totalCourses}</div>
            <p className="text-sm text-business-black/60">Generated content</p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Demo Requests</CardTitle>
            <div className="w-12 h-12 bg-future-green/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-future-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-business-black mb-2">{stats.demoRequests}</div>
            <p className="text-sm text-business-black/60">{stats.newDemoRequests} new requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-1 rounded-2xl shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="companies" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Companies
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Content
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger 
            value="demo-requests" 
            className="rounded-xl px-3 py-2 text-sm font-medium text-business-black/70 hover:text-business-black hover:bg-gray-50 data-[state=active]:bg-future-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Demo Requests
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Recent Companies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Recent Companies</CardTitle>
                    <CardDescription>Latest registered companies</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => navigate('/admin/companies')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-12 text-business-black/60">
                    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">No companies found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies.slice(0, 3).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-future-green/10 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-future-green" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-business-black">{company.name}</h3>
                            <p className="text-xs text-business-black/60">{company.domain}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-lg text-xs">{company.plan_type}</Badge>
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
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Recent Users</CardTitle>
                    <CardDescription>Latest user registrations</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => navigate('/admin/users')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-business-black/60">
                    <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            user.is_active ? 'bg-emerald/10' : 'bg-red-50'
                          }`}>
                            {user.is_active ? (
                              <UserCheck className="h-5 w-5 text-emerald" />
                            ) : (
                              <UserX className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-business-black">{user.full_name}</h3>
                            <p className="text-xs text-business-black/60">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : 'secondary'} className="rounded-lg text-xs">
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
                <div className="space-y-1">
                  <CardTitle className="text-xl">User Management</CardTitle>
                  <CardDescription>Manage all platform users</CardDescription>
                </div>
                <Button className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12 text-business-black/60">
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          user.is_active ? 'bg-emerald/10' : 'bg-red-50'
                        }`}>
                          {user.is_active ? (
                            <UserCheck className="h-6 w-6 text-emerald" />
                          ) : (
                            <UserX className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-business-black">{user.full_name}</h3>
                          <p className="text-business-black/60">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.role === 'super_admin' ? 'destructive' : user.role === 'company_admin' ? 'default' : 'secondary'} className="rounded-lg">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={user.email_verified ? 'default' : 'outline'} className="rounded-lg">
                          {user.email_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="rounded-xl">
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
                <div className="space-y-1">
                  <CardTitle className="text-xl">Company Management</CardTitle>
                  <CardDescription>Manage all registered companies</CardDescription>
                </div>
                <Button className="rounded-xl" onClick={handleCreateCompany}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-12 text-business-black/60">
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No companies found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-future-green/10 rounded-xl flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-future-green" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-business-black">{company.name}</h3>
                          <p className="text-business-black/60">{company.domain}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={company.is_active ? 'default' : 'secondary'} className="rounded-lg">
                          {company.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">{company.plan_type}</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)} className="rounded-xl">
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
              <CardTitle className="text-xl">Activity Feed</CardTitle>
              <CardDescription>Recent platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-business-black/60">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">Activity feed coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Requests Tab */}
        <TabsContent value="demo-requests">
          <CompactDemoRequestsTable />
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

      {/* Company Create Sheet */}
      <CompanyCreateSheet
        open={companyCreateSheetOpen}
        onOpenChange={setCompanyCreateSheetOpen}
        onCompanyCreated={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;
