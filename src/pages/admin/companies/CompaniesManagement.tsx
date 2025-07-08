import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { CompanyEditSheet } from '@/components/admin/CompanyManagement/CompanyEditSheet';
import { CompanyCreateSheet } from '@/components/admin/CompanyManagement/CompanyCreateSheet';
import { MobileCompanyCard } from '@/components/mobile/cards/MobileCompanyCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Search,
  Plus,
  Eye,
  FileDown,
  Filter,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  plan_type: string;
  max_employees: number;
  max_courses: number;
  is_active: boolean;
  created_at: string;
  employeeCount?: number;
  activeEmployees?: number;
  courseCount?: number;
}

const CompaniesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'created_at' | 'employeeCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch counts for each company
      const companiesWithCounts = await Promise.all(
        (companiesData || []).map(async (company) => {
          // Get employee count
          const { count: employeeCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          const { count: activeEmployees } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('is_active', true);

          // Get course count
          const { count: courseCount } = await supabase
            .from('cm_module_content')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          return {
            ...company,
            employeeCount: employeeCount || 0,
            activeEmployees: activeEmployees || 0,
            courseCount: courseCount || 0,
          };
        })
      );

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = () => {
    setCreateSheetOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanySheetOpen(true);
  };

  const handleViewUsers = (companyId: string) => {
    navigate(`/admin/users?company=${companyId}`);
  };

  const handleViewCourses = (companyId: string) => {
    navigate(`/admin/courses?company=${companyId}`);
  };

  const handleViewAnalytics = (companyId: string) => {
    navigate(`/admin/analytics?company=${companyId}`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Domain', 'Plan', 'Status', 'Employees', 'Courses', 'Created'],
      ...getFilteredCompanies().map(company => [
        company.name,
        company.domain,
        company.plan_type,
        company.is_active ? 'Active' : 'Inactive',
        company.employeeCount,
        company.courseCount,
        new Date(company.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredCompanies = () => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(company => company.plan_type === planFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => 
        statusFilter === 'active' ? company.is_active : !company.is_active
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || 0;
      let bValue = b[sortField] || 0;
      
      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  const filteredCompanies = getFilteredCompanies();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Companies Management</h1>
          <p className="text-gray-600">Manage all companies on the platform</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportCSV} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleCreateCompany}>
            <Plus className="h-4 w-4 mr-2" />
            Create Company
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              {companies.filter(c => c.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, c) => sum + (c.employeeCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {companies.reduce((sum, c) => sum + (c.activeEmployees || 0), 0)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, c) => sum + (c.courseCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {['trial', 'basic', 'premium', 'enterprise'].map(plan => {
                const count = companies.filter(c => c.plan_type === plan).length;
                if (count === 0) return null;
                return (
                  <div key={plan} className="flex justify-between text-xs">
                    <span className="capitalize">{plan}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
            <CardTitle>Companies</CardTitle>
            <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-2'}`}>
              {isMobile ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
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
                </>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
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
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? 'px-4' : ''}>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No companies found matching your filters</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <MobileCompanyCard
                  key={company.id}
                  company={company}
                  onViewDetails={handleEditCompany}
                  onNavigateToUsers={(companyId) => navigate(`/admin/users?company=${companyId}`)}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Company
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('employeeCount')}
                  >
                    <div className="flex items-center">
                      Employees
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Created
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.domain}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {company.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.is_active ? 'default' : 'secondary'}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.employeeCount || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          {company.activeEmployees || 0} active / {company.max_employees} max
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.courseCount || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          / {company.max_courses} max
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewUsers(company.id)}>
                            <Users className="h-4 w-4 mr-2" />
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewCourses(company.id)}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Courses
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAnalytics(company.id)}>
                            <Building2 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Company Edit Sheet */}
      <CompanyEditSheet
        company={selectedCompany}
        open={companySheetOpen}
        onOpenChange={setCompanySheetOpen}
        onCompanyUpdated={fetchCompanies}
      />

      {/* Company Create Sheet */}
      <CompanyCreateSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onCompanyCreated={fetchCompanies}
      />
    </div>
  );
};

export default CompaniesManagement;