
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  User,
  MessageSquare,
  FileDown,
  Eye,
  X
} from 'lucide-react';
import { demoRequestService, type DemoRequestRecord } from '@/services/demoRequestService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

export const DemoRequestsTable = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DemoRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<DemoRequestRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDemoRequests();
  }, [statusFilter]);

  const fetchDemoRequests = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await demoRequestService.getDemoRequests(filters);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast.error('Failed to load demo requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const result = await demoRequestService.updateDemoRequest(id, {
        status: newStatus as 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      });

      if (result.success) {
        toast.success('Status updated successfully');
        fetchDemoRequests();
        if (selectedRequest?.id === id) {
          setSelectedRequest(prev => prev ? { ...prev, status: newStatus as 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected' } : null);
        }
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!selectedRequest) return;
    
    setUpdating(true);
    try {
      const result = await demoRequestService.updateDemoRequest(selectedRequest.id, {
        notes,
        processed_by: user?.id,
      });

      if (result.success) {
        toast.success('Notes updated successfully');
        fetchDemoRequests();
        setSelectedRequest(prev => prev ? { ...prev, notes } : null);
      } else {
        toast.error(result.error || 'Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Company', 'Job Title', 'Phone', 'Company Size', 'Country', 'Status', 'Submitted At', 'Message'],
      ...filteredRequests.map(r => [
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.company,
        r.job_title || '',
        r.phone || '',
        r.company_size || '',
        r.country || '',
        r.status,
        format(new Date(r.submitted_at), 'yyyy-MM-dd HH:mm'),
        r.message || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'outline';
      case 'converted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const openDetails = (request: DemoRequestRecord) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Demo Requests</CardTitle>
              <CardDescription>Manage and track demo request submissions</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-future-green mx-auto mb-2"></div>
              <p className="text-business-black/70">Loading demo requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-business-black/60">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No demo requests found</p>
              <p className="text-sm">Adjust your filters or wait for new submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">
                          {request.first_name} {request.last_name}
                        </h3>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${request.email}`} className="hover:text-future-green">
                            {request.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          {request.company}
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${request.phone}`} className="hover:text-future-green">
                              {request.phone}
                            </a>
                          </div>
                        )}
                        {request.job_title && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            {request.job_title}
                          </div>
                        )}
                      </div>

                      {request.message && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          "{request.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusUpdate(request.id, value)}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Demo Request Details</DialogTitle>
            <DialogDescription>
              View and manage demo request information
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="font-semibold">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Company</label>
                  <p className="font-semibold">{selectedRequest.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Title</label>
                  <p className="font-semibold">{selectedRequest.job_title || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="font-semibold">{selectedRequest.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Company Size</label>
                  <p className="font-semibold">{selectedRequest.company_size || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Country</label>
                  <p className="font-semibold">{selectedRequest.country || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="font-semibold">
                    {format(new Date(selectedRequest.submitted_at), 'PPpp')}
                  </p>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.message}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  className="mt-1"
                  rows={4}
                />
                <Button
                  onClick={handleNotesUpdate}
                  disabled={updating || notes === selectedRequest.notes}
                  className="mt-2"
                >
                  {updating ? 'Updating...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
