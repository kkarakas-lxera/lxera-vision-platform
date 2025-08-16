import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Globe, 
  Loader2, 
  Brain,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  ArrowLeftRight,
  Trash2,
  Archive,
  RotateCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import MarketIntelligenceConfig from '@/components/dashboard/market-intelligence/MarketIntelligenceConfig';
import MarketIntelligenceProgress from '@/components/dashboard/market-intelligence/MarketIntelligenceProgress';
import type { MarketIntelligenceRequest } from '@/components/dashboard/market-intelligence/MarketIntelligence';

export default function MarketIntelligenceList() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marketRequests, setMarketRequests] = useState<MarketIntelligenceRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<MarketIntelligenceRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Configuration state for new analysis
  const [config, setConfig] = useState({
    positionId: '',
    positionTitle: '',
    positionDescription: '',
    customPosition: false,
    industry: '',
    requiredSkills: [] as any[],
    niceToHaveSkills: [] as any[],
    regions: [] as string[],
    countries: [] as string[],
    dateWindow: '30d' as '24h' | '7d' | '30d' | '90d' | 'custom',
    sinceDate: '',
    focusArea: 'all_skills' as 'technical' | 'all_skills',
    skillTypes: ['all_skills'] as string[]
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'scraping' | 'analyzing' | 'completed' | 'failed' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'jobs' | 'role'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchMarketRequests();
    }
  }, [userProfile?.company_id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchMarketRequests = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('market_intelligence_requests' as any)
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const requests = (data as MarketIntelligenceRequest[]) || [];
      setMarketRequests(requests);
      
      // Check for active request
      const active = requests.find(req => ['queued', 'scraping', 'analyzing'].includes(req.status));
      if (active) {
        setActiveRequest(active);
        startPolling(active.id);
      }
      
    } catch (error) {
      console.error('Error fetching market requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market intelligence data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (requestId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const maxAttempts = 120;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const { data, error } = await supabase
          .from('market_intelligence_requests' as any)
          .select('*')
          .eq('id', requestId)
          .single();

        if (error) throw error;

        const request = data as MarketIntelligenceRequest;
        
        // Update state
        setMarketRequests(prev => 
          prev.map(req => req.id === requestId ? request : req)
        );

        // Check if completed or failed
        if (['completed', 'failed'].includes(request.status)) {
          clearInterval(interval);
          setPollingInterval(null);
          setActiveRequest(null);

          if (request.status === 'completed') {
            toast({
              title: 'Analysis Complete',
              description: 'Your market intelligence report is ready!',
            });
            fetchMarketRequests(); // Refresh the list
          } else {
            toast({
              title: 'Analysis Failed',
              description: request.status_message || 'Please try again',
              variant: 'destructive'
            });
          }
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 2500);

    setPollingInterval(interval);
  };

  const validateConfig = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!config.positionId || !config.positionTitle) {
      errors.position = config.customPosition ? 'Enter a position title' : 'Select a role';
    }
    
    if (config.regions.length === 0 && config.countries.length === 0) {
      errors.location = 'Choose a region or custom countries';
    }
    
    if (config.dateWindow === 'custom' && !config.sinceDate) {
      errors.sinceDate = 'Select a date';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitMarketIntelligenceRequest = async () => {
    if (!userProfile?.company_id || !validateConfig()) return;

    try {
      // Fetch position requirements if using existing position
      let positionRequirements = null;
      if (!config.customPosition && config.positionId) {
        const { data: positionData } = await supabase
          .from('st_company_positions')
          .select('required_skills, nice_to_have_skills, description')
          .eq('id', config.positionId)
          .single();
        positionRequirements = positionData;
      }

      // Create new request
      const { data: newRequest, error: createError } = await supabase
        .from('market_intelligence_requests' as any)
        .insert({
          company_id: userProfile.company_id,
          position_id: config.customPosition ? null : config.positionId,
          position_title: config.positionTitle || null,
          industry: config.industry || null,
          custom_position: config.customPosition,
          regions: config.regions,
          countries: config.countries,
          date_window: config.dateWindow,
          since_date: config.dateWindow === 'custom' ? config.sinceDate : null,
          focus_area: config.focusArea,
          status: 'queued',
          status_message: 'Initializing market research...',
          created_by: userProfile.id
        })
        .select()
        .single();

      if (createError) throw createError;

      const request = newRequest as MarketIntelligenceRequest;
      setMarketRequests(prev => [request, ...prev]);
      setActiveRequest(request);

      // Start the edge function
      const response = await supabase.functions.invoke('market-research-agent', {
        body: {
          request_id: request.id,
          regions: config.regions,
          countries: config.countries,
          focus_area: config.focusArea,
          position_title: config.positionTitle,
          industry: config.industry || null,
          custom_position: config.customPosition,
          position_requirements: positionRequirements,
          date_window: config.dateWindow,
          since_date: config.sinceDate || null
        }
      });

      if (response.error) {
        await supabase
          .from('market_intelligence_requests' as any)
          .update({ 
            status: 'failed',
            status_message: `Error: ${response.error.message}`,
            error_details: response.error
          })
          .eq('id', request.id);
        throw response.error;
      }

      // Start polling for updates
      startPolling(request.id);
      setShowCreateForm(false);

      toast({
        title: 'Analysis Started',
        description: `Analyzing market demand for ${config.positionTitle}...`,
      });

    } catch (error: any) {
      console.error('Error starting analysis:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start analysis',
        variant: 'destructive'
      });
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { label: 'Completed', className: 'bg-green-100 text-green-800' },
      'failed': { label: 'Failed', className: 'bg-red-100 text-red-800' },
      'queued': { label: 'Queued', className: 'bg-blue-100 text-blue-800' },
      'scraping': { label: 'Scraping', className: 'bg-yellow-100 text-yellow-800' },
      'analyzing': { label: 'Analyzing', className: 'bg-purple-100 text-purple-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="grid grid-cols-12 gap-3 items-center py-3">
          <div className="col-span-12 xl:col-span-3">
            <h1 className="text-2xl font-semibold">Market Intelligence</h1>
          </div>
          <div className="col-span-12 xl:col-span-7 flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search reports by role or region"
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
            <Button variant="outline" size="sm" className="gap-2"><ArrowLeftRight className="h-4 w-4" />Sort</Button>
          </div>
          <div className="col-span-12 xl:col-span-2 flex justify-end">
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={!!activeRequest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showCreateForm ? 'Cancel' : 'New Analysis'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Configuration or Welcome */}
        <div className="xl:col-span-2 space-y-6">
          {/* Active Analysis Progress */}
          {activeRequest && (
            <MarketIntelligenceProgress
              request={activeRequest}
              onCancel={() => {
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                  setPollingInterval(null);
                }
                setActiveRequest(null);
              }}
            />
          )}

          {/* Configuration Form */}
          {showCreateForm && (
            <MarketIntelligenceConfig
              config={config}
              setConfig={setConfig}
              validationErrors={validationErrors}
              onSubmit={submitMarketIntelligenceRequest}
              isLoading={!!activeRequest}
            />
          )}

          {/* Welcome State */}
          {!showCreateForm && !activeRequest && marketRequests.length === 0 && (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="p-3 bg-indigo-100 rounded-lg w-fit mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started with Market Intelligence</h3>
                  <p className="text-gray-700 mb-6 max-w-md mx-auto">
                    Discover what skills are most in-demand for your positions across different regions. 
                    Get AI-powered insights to guide your training programs.
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Create Your First Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Dense History Table */}
        <div className="xl:col-span-1">
          <Card className="rounded-2xl border overflow-hidden">
            <CardContent className="p-0">
              {/* Bulk bar */}
              {selectedIds.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b text-sm">
                  <span>{selectedIds.length} selected</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1"><Archive className="h-4 w-4" />Archive</Button>
                    <Button variant="outline" size="sm" className="gap-1"><RotateCw className="h-4 w-4" />Retry</Button>
                    <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4" />Delete</Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="h-12">
                    <TableHead className="w-8">
                      <Checkbox
                        checked={selectedIds.length > 0 && selectedIds.length === marketRequests.length}
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked ? marketRequests.map(r => r.id) : []);
                        }}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Role</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Regions</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Jobs</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketRequests
                    .filter(r => (statusFilter === 'all' ? true : r.status === statusFilter))
                    .filter(r => q.trim().length === 0 ||
                      r.position_title?.toLowerCase().includes(q.toLowerCase()) ||
                      r.regions?.join(',').toLowerCase().includes(q.toLowerCase()) ||
                      r.countries?.join(',').toLowerCase().includes(q.toLowerCase())
                    )
                    .map((r) => {
                      const isSelected = selectedIds.includes(r.id);
                      const jobs = r.scraped_data?.total_jobs ?? r.scraped_data?.jobs_count ?? 0;
                      return (
                        <TableRow key={r.id} className="h-14">
                          <TableCell className="w-8">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedIds(prev => checked ? [...prev, r.id] : prev.filter(id => id !== r.id));
                              }}
                              aria-label={`Select ${r.position_title}`}
                            />
                          </TableCell>
                          <TableCell className="max-w-[140px] truncate">
                            <div className="text-sm font-medium truncate">{r.position_title || '—'}</div>
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-muted-foreground text-xs">
                            {(r.regions?.length ? r.regions : r.countries)?.slice(0, 2).join(', ')}
                            {((r.regions?.length || r.countries?.length || 0) > 2) && ' +' + (((r.regions?.length || 0) + (r.countries?.length || 0)) - 2)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{getRelativeTime(r.created_at)}</TableCell>
                          <TableCell className="text-xs">{jobs}</TableCell>
                          <TableCell>
                            {r.status === 'failed' ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">Failed</Badge>
                                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                  {r.status_message || 'Error'}
                                </span>
                              </div>
                            ) : r.status === 'completed' ? (
                              <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>
                            ) : r.status === 'archived' ? (
                              <Badge variant="outline">Archived</Badge>
                            ) : (
                              <Badge variant="outline">{r.status}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/market-intelligence/${r.id}`)}>
                                  View Report
                                </DropdownMenuItem>
                                {r.status === 'failed' && (
                                  <DropdownMenuItem onClick={() => setShowCreateForm(true)}>
                                    Retry
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>Archive</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
                <TableCaption className="text-xs">Showing {Math.min(page * pageSize, marketRequests.length)} of {marketRequests.length} reports</TableCaption>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}