import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Users, Calendar, Target, TrendingUp, Filter, Mail, Building2, User, Tag, Clock, Globe, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { demoCaptureService } from '@/services/demoCaptureService';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface UnifiedLead {
  id: string;
  type: 'demo' | 'early_access';
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  use_case: string | null;
  waitlist_position: number | null;
  company_size: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  progress_step: number;
  calendly_scheduled: boolean;
  scheduled_at: string | null;
  completed_at: string | null;
}

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<UnifiedLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    demo: 0,
    earlyAccess: 0,
    newToday: 0
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, typeFilter, statusFilter]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('unified_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get demo stats
      const demoStats = await demoCaptureService.getDemoCaptureStats();
      
      // Get early access stats
      const { data: earlyAccessData } = await supabase
        .from('early_access_leads')
        .select('created_at');

      const today = new Date().toDateString();
      const earlyAccessNewToday = earlyAccessData?.filter(item => 
        new Date(item.created_at).toDateString() === today
      ).length || 0;

      setStats({
        total: demoStats.total + (earlyAccessData?.length || 0),
        demo: demoStats.total,
        earlyAccess: earlyAccessData?.length || 0,
        newToday: demoStats.newToday + earlyAccessNewToday
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(lead => lead.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'captured':
      case 'email_captured':
        return 'secondary';
      case 'scheduled':
      case 'waitlisted':
        return 'default';
      case 'completed':
      case 'profile_completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getProgressDisplay = (lead: UnifiedLead) => {
    if (lead.type === 'demo') {
      return `Step ${lead.progress_step}/2`;
    } else {
      const steps = ['Email', 'Verified', 'Profile', 'Waitlisted'];
      return steps[lead.progress_step - 1] || 'Email';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Type', 'Email', 'Name', 'Company', 'Status', 'Source', 'Created'],
      ...filteredLeads.map(lead => [
        lead.type,
        lead.email,
        lead.name || '',
        lead.company || '',
        lead.status,
        lead.source || '',
        new Date(lead.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLeadClick = (lead: UnifiedLead) => {
    setSelectedLead(selectedLead?.id === lead.id ? null : lead);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-business-black mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-business-black">Leads</h1>
        <p className="text-gray-600 mt-2">Manage demo requests and early access signups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.demo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Access</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earlyAccess}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="demo">Demo Requests</SelectItem>
                <SelectItem value="early_access">Early Access</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="captured">Captured</SelectItem>
                <SelectItem value="email_captured">Email Captured</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 space-y-2 cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-future-green border-future-green' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{lead.name || lead.email}</p>
                      <p className="text-sm text-gray-600">{lead.company}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">
                      {lead.type === 'demo' ? 'Demo' : 'Early Access'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span>{getProgressDisplay(lead)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-future-green border-future-green' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {lead.type === 'demo' ? 'Demo' : 'Early Access'}
                      </Badge>
                      <div>
                        <p className="font-medium">{lead.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {lead.company || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {getProgressDisplay(lead)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {lead.source || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail View */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6"
        >
          <Card className="border-future-green">
            <CardHeader className="bg-gradient-to-r from-future-green/10 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Lead Profile
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Header */}
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green to-business-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {(selectedLead.name || selectedLead.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-business-black">
                          {selectedLead.name || 'Unnamed Lead'}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(selectedLead.status)}>
                          {selectedLead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{selectedLead.email}</span>
                        </div>
                        {selectedLead.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{selectedLead.company}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Badge variant="outline" className="px-2 py-1">
                          {selectedLead.type === 'demo' ? 'Demo Request' : 'Early Access'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Joined {new Date(selectedLead.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{getProgressDisplay(selectedLead)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{selectedLead.email}</p>
                          </div>
                        </div>
                        {selectedLead.name && (
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Full Name</p>
                              <p className="font-medium">{selectedLead.name}</p>
                            </div>
                          </div>
                        )}
                        {selectedLead.company && (
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Company</p>
                              <p className="font-medium">{selectedLead.company}</p>
                            </div>
                          </div>
                        )}
                        {selectedLead.role && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Role</p>
                              <p className="font-medium">{selectedLead.role}</p>
                            </div>
                          </div>
                        )}
                        {selectedLead.company_size && (
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">Company Size</p>
                              <p className="font-medium">{selectedLead.company_size} employees</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Lead Created</p>
                            <p className="text-xs text-gray-600">
                              {new Date(selectedLead.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {selectedLead.updated_at && (
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Last Updated</p>
                              <p className="text-xs text-gray-600">
                                {new Date(selectedLead.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedLead.scheduled_at && (
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Demo Scheduled</p>
                              <p className="text-xs text-gray-600">
                                {new Date(selectedLead.scheduled_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedLead.completed_at && (
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Completed</p>
                              <p className="text-xs text-gray-600">
                                {new Date(selectedLead.completed_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Details */}
                  {(selectedLead.use_case || selectedLead.waitlist_position) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Additional Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedLead.use_case && (
                          <div>
                            <p className="text-sm text-gray-600">Use Case</p>
                            <p className="font-medium">{selectedLead.use_case}</p>
                          </div>
                        )}
                        {selectedLead.waitlist_position && (
                          <div>
                            <p className="text-sm text-gray-600">Waitlist Position</p>
                            <p className="font-medium">#{selectedLead.waitlist_position}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <Badge variant={getStatusBadgeVariant(selectedLead.status)} className="mt-1">
                          {selectedLead.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="font-medium">{getProgressDisplay(selectedLead)}</p>
                      </div>
                      {selectedLead.calendly_scheduled && (
                        <div>
                          <p className="text-sm text-gray-600">Demo Status</p>
                          <Badge variant="default" className="mt-1">
                            Scheduled
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Source Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Source Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedLead.source && (
                        <div>
                          <p className="text-sm text-gray-600">Source</p>
                          <p className="font-medium">{selectedLead.source}</p>
                        </div>
                      )}
                      {selectedLead.utm_source && (
                        <div>
                          <p className="text-sm text-gray-600">UTM Source</p>
                          <p className="font-medium">{selectedLead.utm_source}</p>
                        </div>
                      )}
                      {selectedLead.utm_medium && (
                        <div>
                          <p className="text-sm text-gray-600">UTM Medium</p>
                          <p className="font-medium">{selectedLead.utm_medium}</p>
                        </div>
                      )}
                      {selectedLead.utm_campaign && (
                        <div>
                          <p className="text-sm text-gray-600">UTM Campaign</p>
                          <p className="font-medium">{selectedLead.utm_campaign}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      {selectedLead.type === 'demo' && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            toast({
                              title: 'Demo Link',
                              description: 'Demo scheduling functionality coming soon',
                            });
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Demo
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Leads;