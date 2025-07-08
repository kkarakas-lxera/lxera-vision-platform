import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import DemoRequestDetailModal from '@/components/admin/DemoRequestsManagement/DemoRequestDetailModal';
import { MobileDemoRequestCard } from '@/components/mobile/cards/MobileDemoRequestCard';
import { useMediaQuery } from '@/hooks/use-media-query';
import { format } from 'date-fns';

interface LocalDemoRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  job_title?: string;
  phone?: string;
  company_size?: string;
  country?: string;
  message?: string;
  source?: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  submitted_at?: string;
  updated_at?: string;
}

const DemoRequests = () => {
  const [requests, setRequests] = useState<LocalDemoRequestRecord[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LocalDemoRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LocalDemoRequestRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchDemoRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchDemoRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedRequests: LocalDemoRequestRecord[] = (data || []).map(req => ({
        id: req.id,
        first_name: req.first_name,
        last_name: req.last_name,
        email: req.email,
        company: req.company,
        status: req.status,
        created_at: req.created_at,
        job_title: req.job_title || '',
        phone: req.phone,
        company_size: req.company_size,
        country: req.country,
        message: req.message,
        source: req.source,
        notes: req.notes,
        processed_by: req.processed_by,
        processed_at: req.processed_at,
        submitted_at: req.submitted_at,
        updated_at: req.updated_at
      }));
      
      setRequests(mappedRequests);
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast.error('Failed to load demo requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleViewDetails = (request: LocalDemoRequestRecord) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Company', 'Job Title', 'Status', 'Created At', 'Country', 'Message'],
      ...filteredRequests.map(req => [
        req.first_name,
        req.last_name,
        req.email,
        req.company,
        req.job_title || '',
        req.status,
        format(new Date(req.created_at), 'yyyy-MM-dd HH:mm'),
        req.country || '',
        req.message || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Demo requests exported successfully');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'default', label: 'New' },
      contacted: { color: 'secondary', label: 'Contacted' },
      qualified: { color: 'success', label: 'Qualified' },
      converted: { color: 'success', label: 'Converted' },
      rejected: { color: 'destructive', label: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <Badge variant={config.color as any}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Demo Requests</h1>
          <p className="text-muted-foreground mt-1">Manage and track demo requests from potential customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchDemoRequests()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold mt-1">{requests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">New</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {requests.filter(r => r.status === 'new').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">
                {requests.filter(r => r.status === 'contacted').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Qualified</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {requests.filter(r => r.status === 'qualified').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                {requests.filter(r => r.status === 'converted').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Click on a request to view details and update status</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'px-4' : ''}>
          {isMobile ? (
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No demo requests found matching your filters.
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <MobileDemoRequestCard
                    key={request.id}
                    request={request}
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {request.first_name} {request.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                          {request.job_title && (
                            <p className="text-sm text-muted-foreground">{request.job_title}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{request.company}</p>
                          {request.company_size && (
                            <p className="text-sm text-muted-foreground">{request.company_size} employees</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{format(new Date(request.created_at), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'HH:mm')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRequests.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No demo requests found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Request Detail Modal */}
      <DemoRequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onStatusUpdate={fetchDemoRequests}
      />
    </div>
  );
};

export default DemoRequests;