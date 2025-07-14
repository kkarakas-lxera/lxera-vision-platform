import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Download, Users, Calendar, Target, TrendingUp, Filter, Mail, Building2, User, Tag, Clock, Globe, X, ArrowLeft, Keyboard, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { demoCaptureService } from '@/services/demoCaptureService';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LeadDetailsPanel } from '@/components/admin/LeadDetailsPanel';

interface UnifiedLead {
  id: string;
  lead_type: 'demo' | 'early_access' | 'contact_sales';
  email: string;
  name: string | null;
  company: string | null;
  company_size: string | null;
  source: string | null;
  step_completed: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string | null;
}

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<UnifiedLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activePreset, setActivePreset] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [isNewTodayFilter, setIsNewTodayFilter] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<UnifiedLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    demo: 0,
    earlyAccess: 0,
    contactSales: 0,
    newToday: 0
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [leads]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, typeFilter, activePreset, isNewTodayFilter]);

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

  const getLeadStatus = (lead: UnifiedLead): string => {
    if (lead.lead_type === 'demo') {
      return lead.step_completed === 2 ? 'completed' : 'in_progress';
    } else if (lead.lead_type === 'early_access') {
      switch (lead.step_completed) {
        case 1: return 'email_captured';
        case 2: return 'profile_completed';
        case 3: return 'verified';
        default: return 'pending';
      }
    } else if (lead.lead_type === 'contact_sales') {
      switch (lead.step_completed) {
        case 1: return 'new';
        case 2: return 'contacted';
        case 3: return 'qualified';
        case 4: return 'closed';
        default: return 'new';
      }
    }
    return 'unknown';
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from the leads array
      const today = new Date().toDateString();
      const demoLeads = leads.filter(lead => lead.lead_type === 'demo');
      const earlyAccessLeads = leads.filter(lead => lead.lead_type === 'early_access');
      const contactSalesLeads = leads.filter(lead => lead.lead_type === 'contact_sales');
      const newToday = leads.filter(lead => 
        new Date(lead.created_at).toDateString() === today
      ).length;

      setStats({
        total: leads.length,
        demo: demoLeads.length,
        earlyAccess: earlyAccessLeads.length,
        contactSales: contactSalesLeads.length,
        newToday: newToday
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // New Today filter takes precedence
    if (isNewTodayFilter) {
      const today = new Date().toDateString();
      filtered = filtered.filter(lead => 
        new Date(lead.created_at).toDateString() === today
      );
      setFilteredLeads(filtered);
      return;
    }

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
      filtered = filtered.filter(lead => lead.lead_type === typeFilter);
    }

    // Preset filter
    if (activePreset !== 'all') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      switch (activePreset) {
        case 'action_required':
          // Show leads that need attention (new, in_progress, email_captured, etc.)
          filtered = filtered.filter(lead => {
            const status = getLeadStatus(lead);
            return ['new', 'in_progress', 'captured', 'email_captured', 'contacted', 'qualified'].includes(status);
          });
          break;
        case 'completed':
          // Show completed/closed leads
          filtered = filtered.filter(lead => {
            const status = getLeadStatus(lead);
            return ['completed', 'closed', 'verified', 'profile_completed', 'waitlisted'].includes(status);
          });
          break;
        case 'this_week':
          // Show leads from the last 7 days
          filtered = filtered.filter(lead => 
            new Date(lead.created_at) >= oneWeekAgo
          );
          break;
      }
    }

    setFilteredLeads(filtered);
  };

  const handleStatCardClick = (cardType: string) => {
    switch (cardType) {
      case 'total':
        // Clear all filters
        setTypeFilter('all');
        setActivePreset('all');
        setSearchTerm('');
        setIsNewTodayFilter(false);
        break;
      case 'demo':
        setTypeFilter('demo');
        setActivePreset('all');
        setIsNewTodayFilter(false);
        break;
      case 'early_access':
        setTypeFilter('early_access');
        setActivePreset('all');
        setIsNewTodayFilter(false);
        break;
      case 'contact_sales':
        setTypeFilter('contact_sales');
        setActivePreset('all');
        setIsNewTodayFilter(false);
        break;
      case 'new_today':
        // Set special flag for new today filter
        setIsNewTodayFilter(true);
        setTypeFilter('all');
        setActivePreset('all');
        break;
    }
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
    if (lead.lead_type === 'demo') {
      return `Step ${lead.step_completed}/2`;
    } else if (lead.lead_type === 'contact_sales') {
      const steps = ['New', 'Contacted', 'Qualified', 'Closed'];
      return steps[lead.step_completed - 1] || 'New';
    } else {
      const steps = ['Email', 'Verified', 'Profile', 'Waitlisted'];
      return steps[lead.step_completed - 1] || 'Email';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Type', 'Email', 'Name', 'Company', 'Status', 'Source', 'Created'],
      ...filteredLeads.map(lead => [
        lead.lead_type,
        lead.email,
        lead.name || '',
        lead.company || '',
        getLeadStatus(lead),
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

  const handleDeleteClick = (lead: UnifiedLead, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent lead selection when clicking delete
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    
    setIsDeleting(true);
    try {
      // Determine which table to update based on lead type
      let tableName: string;
      switch (leadToDelete.lead_type) {
        case 'demo':
          tableName = 'demo_captures';
          break;
        case 'early_access':
          tableName = 'early_access_leads';
          break;
        case 'contact_sales':
          tableName = 'contact_sales';
          break;
        default:
          throw new Error('Unknown lead type');
      }

      // Soft delete by setting deleted_at
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', leadToDelete.id);

      if (error) throw error;

      // Update local state
      setLeads(leads.filter(lead => lead.id !== leadToDelete.id));
      
      // Clear selection if deleted lead was selected
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }

      toast({
        title: 'Lead deleted',
        description: 'The lead has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the lead. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with select all
          setActivePreset('all');
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with refresh
          setActivePreset('action_required');
          break;
        case 'c':
          setActivePreset('completed');
          break;
        case 'w':
          setActivePreset('this_week');
          break;
        case 'escape':
          setSelectedLead(null);
          break;
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            exportToCSV();
          }
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showKeyboardShortcuts, exportToCSV]);

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
      {/* Header - Sticky on mobile */}
      <div className={isMobile ? "sticky top-0 z-20 bg-white/95 backdrop-blur-sm pb-4 -mx-4 px-4 pt-4 shadow-sm" : ""}>
        <h1 className="text-3xl font-bold text-business-black">Leads</h1>
        <p className="text-gray-600 mt-2">Manage demo requests and early access signups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            typeFilter === 'all' && activePreset === 'all' && searchTerm === '' && !isNewTodayFilter
              ? 'ring-2 ring-future-green border-future-green' 
              : 'hover:border-gray-300'
          }`}
          onClick={() => handleStatCardClick('total')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            typeFilter === 'demo' ? 'ring-2 ring-future-green border-future-green' : 'hover:border-gray-300'
          }`}
          onClick={() => handleStatCardClick('demo')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.demo}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            typeFilter === 'early_access' ? 'ring-2 ring-future-green border-future-green' : 'hover:border-gray-300'
          }`}
          onClick={() => handleStatCardClick('early_access')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Access</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earlyAccess}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            typeFilter === 'contact_sales' ? 'ring-2 ring-future-green border-future-green' : 'hover:border-gray-300'
          }`}
          onClick={() => handleStatCardClick('contact_sales')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Sales</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactSales}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
            isNewTodayFilter ? 'ring-2 ring-future-green border-future-green' : 'hover:border-gray-300'
          }`}
          onClick={() => handleStatCardClick('new_today')}
        >
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
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>Find leads quickly with smart presets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or company..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsNewTodayFilter(false);
                }}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setIsNewTodayFilter(false);
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="demo">Demo Requests</SelectItem>
                <SelectItem value="early_access">Early Access</SelectItem>
                <SelectItem value="contact_sales">Contact Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Smart Filter Presets */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={activePreset === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActivePreset('all');
                setIsNewTodayFilter(false);
              }}
              className="transition-all"
            >
              All Leads
            </Button>
            <Button
              variant={activePreset === 'action_required' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActivePreset('action_required');
                setIsNewTodayFilter(false);
              }}
              className="transition-all"
            >
              <Target className="h-4 w-4 mr-2" />
              Action Required
            </Button>
            <Button
              variant={activePreset === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActivePreset('completed');
                setIsNewTodayFilter(false);
              }}
              className="transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Completed
            </Button>
            <Button
              variant={activePreset === 'this_week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActivePreset('this_week');
                setIsNewTodayFilter(false);
              }}
              className="transition-all"
            >
              <Calendar className="h-4 w-4 mr-2" />
              This Week
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {!isMobile && (
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Keyboard className="h-4 w-4 mr-1" />
                <span className="text-xs">Press ? for shortcuts</span>
              </Button>
            )}
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
                    <div className="flex-1">
                      <p className="font-medium">{lead.name || lead.email}</p>
                      <p className="text-sm text-gray-600">{lead.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(getLeadStatus(lead))}>
                        {getLeadStatus(lead)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(lead, e)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">
                      {lead.lead_type === 'demo' ? 'Demo' : lead.lead_type === 'early_access' ? 'Early Access' : 'Contact Sales'}
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
                  className={`group bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    selectedLead?.id === lead.id ? 'ring-2 ring-future-green border-future-green' : ''
                  }`}
                  onClick={() => handleLeadClick(lead)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Lead type, Name/Email, Company */}
                    <div className="flex items-center gap-6 flex-1">
                      {/* Lead Type Badge */}
                      <Badge 
                        variant="outline" 
                        className="shrink-0 text-xs font-medium"
                      >
                        {lead.lead_type === 'demo' ? 'Demo' : lead.lead_type === 'early_access' ? 'Early Access' : 'Contact Sales'}
                      </Badge>
                      
                      {/* Primary Info - Name & Email */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-base truncate">
                          {lead.name || 'Unnamed Lead'}
                        </p>
                        <p className="text-sm text-gray-600 truncate mt-0.5">
                          {lead.email}
                        </p>
                      </div>
                      
                      {/* Company */}
                      <div className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                        {lead.company || 'No Company'}
                      </div>
                    </div>
                    
                    {/* Right side - Status Badge and Delete */}
                    <div className="ml-6 flex items-center gap-3">
                      <Badge 
                        variant={getStatusBadgeVariant(getLeadStatus(lead))}
                        className="text-xs font-medium"
                      >
                        {getLeadStatus(lead)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteClick(lead, e)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Hover Preview - Shows one additional detail */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-5 py-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
                    <p className="text-xs text-gray-600">
                      Created {new Date(lead.created_at).toLocaleDateString()} • {getProgressDisplay(lead)}
                    </p>
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

      {/* Lead Detail Panel */}
      <LeadDetailsPanel 
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={handleDeleteClick}
      />

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quick navigation and actions for power users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Navigation</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Focus search</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">/</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Close details</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Filters</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">All leads</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">A</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Action required</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">R</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">C</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This week</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">W</kbd>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Actions</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Export CSV</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">⌘</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">E</kbd>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">?</kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
              {leadToDelete && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Name:</strong> {leadToDelete.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {leadToDelete.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Type:</strong> {leadToDelete.lead_type === 'demo' ? 'Demo Request' : leadToDelete.lead_type === 'early_access' ? 'Early Access' : 'Contact Sales'}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leads;