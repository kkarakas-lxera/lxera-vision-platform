import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Users, Calendar, Target, TrendingUp, Filter } from 'lucide-react';
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
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<UnifiedLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
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
                  className="border rounded-lg p-4 space-y-2"
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {lead.type === 'demo' ? 'Demo' : 'Early Access'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getProgressDisplay(lead)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {lead.source || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;