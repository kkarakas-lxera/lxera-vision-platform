import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download,
  Clock,
  Building2,
  Mail,
  Phone,
  ChevronRight,
  Filter,
  UserCircle2
} from 'lucide-react';
import { demoRequestService, type DemoRequestRecord } from '@/services/demoRequestService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

export const CompactDemoRequestsTable = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DemoRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    try {
      const result = await demoRequestService.updateDemoRequest(id, {
        status: newStatus,
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      });

      if (result.success) {
        toast.success('Status updated');
        fetchDemoRequests();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Name', 'Email', 'Company', 'Role', 'Phone', 'Size', 'Country', 'Status'],
      ...filteredRequests.map(r => [
        format(new Date(r.submitted_at), 'yyyy-MM-dd'),
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.company,
        r.job_title || '',
        r.phone || '',
        r.company_size || '',
        r.country || '',
        r.status
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
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'qualified': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'converted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Group requests by date
  const groupedRequests = filteredRequests.reduce((groups, request) => {
    const date = format(new Date(request.submitted_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(request);
    return groups;
  }, {} as Record<string, DemoRequestRecord[]>);

  const sortedDates = Object.keys(groupedRequests).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demo Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage demo inquiries</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">New</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Converted</span>
            </div>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="All Status" />
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

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-future-green"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCircle2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No demo requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const dateRequests = groupedRequests[date];
            const displayDate = new Date(date);
            const isToday = format(new Date(), 'yyyy-MM-dd') === date;
            const isYesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') === date;
            
            return (
              <div key={date}>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {isToday ? 'Today' : isYesterday ? 'Yesterday' : format(displayDate, 'MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-2">
                  {dateRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {request.first_name} {request.last_name}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-0.5 ${getStatusColor(request.status)}`}
                              >
                                {request.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1.5 truncate">
                                <Building2 className="h-3.5 w-3.5" />
                                {request.company}
                              </span>
                              {request.job_title && (
                                <span className="text-gray-500 truncate">
                                  {request.job_title}
                                </span>
                              )}
                              {request.company_size && (
                                <span className="text-gray-500">
                                  {request.company_size} employees
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            <Select
                              value={request.status}
                              onValueChange={(value) => {
                                handleStatusUpdate(request.id, value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectTrigger className="h-8 w-[110px] text-xs">
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
                            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                              expandedId === request.id ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedId === request.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Email</span>
                                <a 
                                  href={`mailto:${request.email}`} 
                                  className="block font-medium text-blue-600 hover:text-blue-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {request.email}
                                </a>
                              </div>
                              {request.phone && (
                                <div>
                                  <span className="text-gray-500">Phone</span>
                                  <a 
                                    href={`tel:${request.phone}`} 
                                    className="block font-medium text-blue-600 hover:text-blue-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {request.phone}
                                  </a>
                                </div>
                              )}
                              {request.country && (
                                <div>
                                  <span className="text-gray-500">Country</span>
                                  <p className="font-medium">{request.country}</p>
                                </div>
                              )}
                            </div>
                            
                            {request.message && (
                              <div className="mt-4">
                                <span className="text-sm text-gray-500">Message</span>
                                <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                  {request.message}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${request.email}`;
                                }}
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Send Email
                              </Button>
                              {request.phone && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `tel:${request.phone}`;
                                  }}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  Call
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && filteredRequests.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredRequests.length} requests</span>
            <div className="flex gap-4">
              <span>New: {filteredRequests.filter(r => r.status === 'new').length}</span>
              <span>In Progress: {filteredRequests.filter(r => r.status === 'contacted' || r.status === 'qualified').length}</span>
              <span>Converted: {filteredRequests.filter(r => r.status === 'converted').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};