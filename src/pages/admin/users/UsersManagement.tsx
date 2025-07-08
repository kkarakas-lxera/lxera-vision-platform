import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { UserEditSheet } from '@/components/admin/UserManagement/UserEditSheet';
import { UserCreateSheet } from '@/components/admin/UserManagement/UserCreateSheet';
import { MobileUserCard } from '@/components/mobile/cards/MobileUserCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Users, 
  Search,
  Plus,
  Eye,
  FileDown,
  Filter,
  Mail,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

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
  // From employees table
  employee?: {
    courses_completed: number;
    total_learning_hours: number;
    skill_level: string;
  };
}

const UsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company');
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyIdFromUrl);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchUsers();
      // Update URL
      setSearchParams({ company: selectedCompanyId });
    }
  }, [selectedCompanyId]);

  const fetchUsers = async () => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);
      
      // Fetch users with employee data
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          employees!left (
            courses_completed,
            total_learning_hours,
            skill_level
          )
        `)
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = (data || []).map(user => ({
        ...user,
        employee: user.employees?.[0] || null
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedUsers([]);
  };

  const handleCreateUser = () => {
    if (!selectedCompanyId) {
      toast({
        title: 'Select a Company',
        description: 'Please select a company before creating a user',
        variant: 'destructive',
      });
      return;
    }
    setCreateSheetOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserSheetOpen(true);
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Activated ${selectedUsers.length} users`,
      });
      
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error activating users:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate users',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .in('id', selectedUsers);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Deactivated ${selectedUsers.length} users`,
      });
      
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error deactivating users:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate users',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Position', 'Status', 'Email Verified', 'Courses Completed', 'Learning Hours', 'Last Login'],
      ...getFilteredUsers().map(user => [
        user.full_name,
        user.email,
        user.role,
        user.department || 'N/A',
        user.position || 'N/A',
        user.is_active ? 'Active' : 'Inactive',
        user.email_verified ? 'Yes' : 'No',
        user.employee?.courses_completed || 0,
        user.employee?.total_learning_hours || 0,
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${selectedCompanyId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    return filtered;
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'company_admin':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-gray-600">Manage users by company</p>
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
            Please select a company to view and manage users
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">In this company</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((users.filter(u => u.is_active).length / users.length) * 100) || 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.email_verified).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((users.filter(u => u.email_verified).length / users.length) * 100) || 0}% verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Admins:</span>
                    <span className="font-medium">
                      {users.filter(u => u.role === 'company_admin').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Learners:</span>
                    <span className="font-medium">
                      {users.filter(u => u.role === 'learner').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
                <CardTitle>Users</CardTitle>
                <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-2'}`}>
                  {selectedUsers.length > 0 && (
                    <div className={`flex items-center ${isMobile ? 'justify-between' : 'space-x-2 mr-4'}`}>
                      <span className="text-sm text-muted-foreground">
                        {selectedUsers.length} selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                          Activate
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  )}
                  {isMobile ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="company_admin">Admin</SelectItem>
                            <SelectItem value="learner">Learner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex-1">
                          <FileDown className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button onClick={handleCreateUser} size="sm" className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Create User
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-[200px]"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="company_admin">Admin</SelectItem>
                          <SelectItem value="learner">Learner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleExportCSV} variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={handleCreateUser} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? 'px-4' : ''}>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your filters</p>
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={true}
                        onCheckedChange={toggleAllUsers}
                      />
                      <span className="text-sm text-gray-600">All users selected</span>
                    </div>
                  )}
                  {filteredUsers.map((user) => (
                    <MobileUserCard
                      key={user.id}
                      user={user}
                      isSelected={selectedUsers.includes(user.id)}
                      onToggleSelection={toggleUserSelection}
                      onViewDetails={handleEditUser}
                    />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleAllUsers}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Learning Progress</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.position && (
                              <p className="text-xs text-muted-foreground">{user.position}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <Badge variant={user.role === 'company_admin' ? 'default' : 'secondary'}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {!user.email_verified && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.employee ? (
                            <div className="text-sm">
                              <p>{user.employee.courses_completed} courses</p>
                              <p className="text-xs text-muted-foreground">
                                {user.employee.total_learning_hours}h total
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_login ? (
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(user.last_login).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* User Edit Sheet */}
          <UserEditSheet
            user={selectedUser}
            open={userSheetOpen}
            onOpenChange={setUserSheetOpen}
            onUserUpdated={fetchUsers}
          />

          {/* User Create Sheet */}
          <UserCreateSheet
            open={createSheetOpen}
            onOpenChange={setCreateSheetOpen}
            onUserCreated={fetchUsers}
            preSelectedCompanyId={selectedCompanyId}
          />
        </>
      )}
    </div>
  );
};

export default UsersManagement;