import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Loader2, 
  Brain,
  Trash2,
  AlertCircle,
  Download,
  RefreshCw,
  Clock,
  ChevronRight,
  FileText,
  ArrowRight,
  BarChart3,
  Target,
  Plus,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import MarketIntelligenceConfig from './MarketIntelligenceConfig';
import MarketIntelligenceProgress from './MarketIntelligenceProgress';
import MarketIntelligenceResults from './MarketIntelligenceResults';
import MarketIntelligenceHistory from './MarketIntelligenceHistory';

// Types
export interface MarketIntelligenceRequest {
  id: string;
  company_id: string;
  position_id?: string;
  position_title?: string;
  industry?: string;
  custom_position?: boolean;
  regions: string[];
  countries: string[];
  date_window: '24h' | '7d' | '30d' | '90d' | 'custom';
  since_date?: string;
  focus_area: 'technical' | 'all_skills';
  status: 'queued' | 'scraping' | 'analyzing' | 'completed' | 'failed' | 'archived';
  status_message?: string;
  scraped_data?: any;
  ai_insights?: string;
  structured_insights?: {
    executive_summary?: {
      market_context?: string;
      callouts?: Array<{
        type: string;
        icon: string;
        text: string;
      }>;
      strategic_conclusion?: string;
    };
    key_findings?: Array<{
      icon?: string;
      category?: string;
      insights?: string[];
    }>;
    strategic_recommendations?: Array<{
      priority?: number;
      title?: string;
      description?: string;
      detailed_explanation?: string;
      specific_actions?: string[];
      expected_impact?: string;
      supporting_data?: string;
    }>;
  };
  analysis_data?: {
    skill_trends?: any;
  };
  error_details?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

type UIState = 
  | 'first-time'
  | 'config-incomplete' 
  | 'active-run'
  | 'success'
  | 'failure'
  | 'no-results'
  | 'timeout'
  | 'history-present';

export default function MarketIntelligence() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState<UIState>('first-time');
  
  // Market Intelligence state
  const [marketRequests, setMarketRequests] = useState<MarketIntelligenceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<MarketIntelligenceRequest | null>(null);
  const [activeRequest, setActiveRequest] = useState<MarketIntelligenceRequest | null>(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    positionId: '',
    positionTitle: '',
    positionDescription: '',
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
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'queued':
      case 'scraping':
      case 'analyzing':
        return <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'queued': return 10;
      case 'scraping': return 40;
      case 'analyzing': return 70;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const onSelect = (request: MarketIntelligenceRequest) => {
    setCurrentRequest(request);
    if (request.status === 'completed') {
      setUiState('success');
    } else if (request.status === 'failed') {
      setUiState('failure');
    } else if (['queued', 'scraping', 'analyzing'].includes(request.status)) {
      setActiveRequest(request);
      setUiState('active-run');
    }
  };

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchMarketRequests();
      setupRealtimeSubscription();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.company_id]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup subscription on unmount
      if (realtimeChannel) {
        console.log('[Market Intelligence] 🧹 Cleaning up realtime subscription');
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  useEffect(() => {
    // Update UI state based on current data
    if (loading) return;
    
    const hasActiveRun = activeRequest && ['queued', 'scraping', 'analyzing'].includes(activeRequest.status);
    const hasHistory = marketRequests.length > 0;
    const hasCompletedRequest = currentRequest?.status === 'completed';
    const hasFailedRequest = currentRequest?.status === 'failed';
    const hasNoResults = currentRequest?.scraped_data?.jobs_count === 0;
    
    if (hasActiveRun) {
      setUiState('active-run');
    } else if (hasNoResults) {
      setUiState('no-results');
    } else if (hasFailedRequest) {
      setUiState('failure');
    } else if (hasCompletedRequest) {
      setUiState('success');
    } else if (hasHistory) {
      setUiState('history-present');
    } else {
      setUiState('first-time');
    }
  }, [loading, activeRequest, currentRequest, marketRequests]);


  const setupRealtimeSubscription = () => {
    if (!userProfile?.company_id || realtimeChannel) return;

    console.log('[Market Intelligence] 📡 Setting up real-time subscription for company:', userProfile.company_id);

    const channel = supabase
      .channel(`market-intelligence-${userProfile.company_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_intelligence_requests',
          filter: `company_id=eq.${userProfile.company_id}`
        },
        (payload) => {
          console.log('[Market Intelligence] 🔄 Real-time update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('[Market Intelligence] 📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Market Intelligence] ✅ Successfully subscribed to real-time updates!');
        } else if (status === 'CLOSED') {
          console.log('[Market Intelligence] ❌ Realtime subscription closed');
          setRealtimeChannel(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Market Intelligence] ❌ Realtime subscription error');
          setRealtimeChannel(null);
        }
      });

    setRealtimeChannel(channel);
    return channel;
  };

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log('[Market Intelligence] 📝 Processing real-time event:', eventType);
    
    if (eventType === 'INSERT') {
      const newRequest = newRecord as MarketIntelligenceRequest;
      console.log('[Market Intelligence] ➕ New request created:', newRequest.id, newRequest.status);
      setMarketRequests(prev => [newRequest, ...prev.filter(req => req.id !== newRequest.id)]);
      
      if (['queued', 'scraping', 'analyzing'].includes(newRequest.status)) {
        console.log('[Market Intelligence] 🚀 Setting as active request');
        setActiveRequest(newRequest);
        setCurrentRequest(newRequest);
      }
    } else if (eventType === 'UPDATE') {
      const updatedRequest = newRecord as MarketIntelligenceRequest;
      console.log('[Market Intelligence] 🔄 Request updated:', updatedRequest.id, 
                  'Status:', updatedRequest.status, 
                  'Message:', updatedRequest.status_message);
      
      // Update requests list
      setMarketRequests(prev => 
        prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
      );
      
      // Update current request if it's the one being updated
      if (currentRequest?.id === updatedRequest.id) {
        console.log('[Market Intelligence] 🎯 Updating current request display');
        setCurrentRequest(updatedRequest);
      }
      
      // Update active request if it's the one being updated
      if (activeRequest?.id === updatedRequest.id) {
        console.log('[Market Intelligence] ⚡ Updating active request progress');
        setActiveRequest(updatedRequest);
        
        // Check if analysis completed or failed
        if (['completed', 'failed'].includes(updatedRequest.status)) {
          console.log('[Market Intelligence] 🏁 Analysis finished with status:', updatedRequest.status);
          setActiveRequest(null);
          
          if (updatedRequest.status === 'completed') {
            toast({
              title: 'Analysis Complete! 🎉',
              description: 'Your market intelligence report is ready!',
            });
          } else {
            toast({
              title: 'Analysis Failed',
              description: updatedRequest.status_message || 'Please try again',
              variant: 'destructive'
            });
          }
        }
      }
    } else if (eventType === 'DELETE') {
      const deletedId = oldRecord.id;
      console.log('[Market Intelligence] 🗑️ Request deleted:', deletedId);
      setMarketRequests(prev => prev.filter(req => req.id !== deletedId));
      if (currentRequest?.id === deletedId) {
        setCurrentRequest(null);
      }
      if (activeRequest?.id === deletedId) {
        setActiveRequest(null);
      }
    }
  };

  const fetchMarketRequests = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('market_intelligence_requests' as any)
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const requests = (data as MarketIntelligenceRequest[]) || [];
      setMarketRequests(requests);
      
      // Check for active request
      const active = requests.find(req => ['queued', 'scraping', 'analyzing'].includes(req.status));
      if (active) {
        setActiveRequest(active);
        // No need to start polling with real-time updates
      }
      
      // Set the most recent completed request as current
      const latestCompleted = requests.find(req => req.status === 'completed');
      if (latestCompleted && !currentRequest) {
        setCurrentRequest(latestCompleted);
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

  const validateConfig = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!config.positionId || !config.positionTitle) {
      errors.position = 'Select a role';
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
      // Create new request
      const { data: newRequest, error: createError } = await supabase
        .from('market_intelligence_requests' as any)
        .insert({
          company_id: userProfile.company_id,
          position_id: config.positionId,
          position_title: config.positionTitle || null,
          custom_position: false,
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

      // Update local state
      const request = newRequest as MarketIntelligenceRequest;
      setMarketRequests(prev => [request, ...prev]);
      setActiveRequest(request);
      setCurrentRequest(request);

      // Fetch position requirements
      let positionRequirements = null;
      if (config.positionId) {
        const { data: positionData } = await supabase
          .from('st_company_positions')
          .select('required_skills, nice_to_have_skills, description')
          .eq('id', config.positionId)
          .single();
        positionRequirements = positionData;
      }

      // Start the edge function
      const response = await supabase.functions.invoke('market-research-agent', {
        body: {
          request_id: request.id,
          regions: config.regions,
          countries: config.countries,
          focus_area: config.focusArea,
          position_title: config.positionTitle,
          custom_position: false,
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


  const handleRetry = () => {
    if (currentRequest) {
      // Use same config from failed request
      setConfig({
        positionId: currentRequest.position_id || '',
        positionTitle: currentRequest.position_title || '',
        positionDescription: '',
        requiredSkills: [] as any[],
        niceToHaveSkills: [] as any[],
        regions: currentRequest.regions || [],
        countries: currentRequest.countries || [],
        dateWindow: currentRequest.date_window || '30d',
        sinceDate: currentRequest.since_date || '',
        focusArea: currentRequest.focus_area || 'all_skills',
        skillTypes: ['all_skills'] as string[]
      });
      submitMarketIntelligenceRequest();
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      console.log('[Market Intelligence] Attempting to delete request:', requestId);
      
      const { data, error } = await supabase
        .from('market_intelligence_requests' as any)
        .delete()
        .eq('id', requestId)
        .select();

      console.log('[Market Intelligence] Delete result:', { data, error });

      if (error) {
        console.error('[Market Intelligence] Delete error details:', error);
        throw error;
      }

      // Update local state
      setMarketRequests(prev => prev.filter(req => req.id !== requestId));
      if (currentRequest?.id === requestId) {
        setCurrentRequest(marketRequests.find(req => req.id !== requestId) || null);
      }

      toast({
        title: 'Deleted',
        description: 'Analysis has been removed',
      });
    } catch (error: any) {
      console.error('[Market Intelligence] Error deleting request:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete analysis',
        variant: 'destructive'
      });
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: `Exporting as ${format.toUpperCase()}...`,
    });
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
        <p className="text-gray-600 mt-1">Analyze current job market demand for specific roles and date ranges</p>
      </div>

      {/* Compact History Header - Only show when we have history */}
      {marketRequests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">Recent Analyses</h2>
            <Button 
              onClick={() => {
                setCurrentRequest(null);
                setActiveRequest(null);
                setUiState('first-time');
              }}
              size="sm"
              variant="outline"
              className="h-7"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {marketRequests.slice(0, 8).map((request) => {
              const isSelected = request.id === currentRequest?.id;
              const isActive = ['queued', 'scraping', 'analyzing'].includes(request.status);
              const jobsCount = request.scraped_data?.jobs_count || 0;
              
              return (
                <div
                  key={request.id}
                  onClick={() => onSelect(request)}
                  className={`
                    flex-shrink-0 w-32 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}
                    ${isActive ? 'ring-2 ring-yellow-200' : ''}
                  `}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {getStatusIcon(request.status)}
                    {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                  </div>
                  <div className="text-xs font-medium text-gray-900 truncate mb-1">
                    {request.position_title || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-600 truncate mb-1">
                    {request.regions?.join(', ') || request.countries?.slice(0, 2).join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRelativeTime(request.created_at)}
                  </div>
                  {request.status === 'completed' && (
                    <div className="text-xs text-gray-500">
                      {jobsCount} jobs
                    </div>
                  )}
                  {isActive && (
                    <div className="text-xs text-yellow-600 font-medium">
                      {Math.round(getProgressPercentage(request.status))}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area - Full Width */}
      <div className="space-y-6">
        {/* First Time Experience (No History) */}
        {marketRequests.length === 0 && (
          <div className="space-y-6">
            {/* Onboarding Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Market Intelligence Analysis</h2>
                    <p className="text-gray-700 mb-4">
                      Discover what skills are most in-demand for your positions across different regions. 
                      Get AI-powered insights to guide your training programs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-600" />
                        <span className="text-gray-700">Real-time job market data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-700">AI-powered skill analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Training recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <MarketIntelligenceConfig
              config={config}
              setConfig={setConfig}
              validationErrors={validationErrors}
              onSubmit={submitMarketIntelligenceRequest}
              isLoading={!!activeRequest}
            />
          </div>
        )}

        {/* Has History - Show Config or Results */}
        {marketRequests.length > 0 && (
          <>
            {/* Configuration Form - when no current request selected */}
            {!currentRequest && !activeRequest && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Select an analysis to view</h3>
                  <p className="text-sm text-gray-600 mb-4">Choose from your recent analyses above or start a new one</p>
                  <Button 
                    onClick={() => {
                      setCurrentRequest(null);
                      setActiveRequest(null);
                      setUiState('first-time');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Start New Analysis
                  </Button>
                </div>
              </div>
            )}

            {/* Configuration Form - when creating new analysis */}
            {(uiState === 'first-time' || uiState === 'config-incomplete') && (
              <MarketIntelligenceConfig
                config={config}
                setConfig={setConfig}
                validationErrors={validationErrors}
                onSubmit={submitMarketIntelligenceRequest}
                isLoading={!!activeRequest}
              />
            )}

            {/* Active Analysis Progress */}
            {uiState === 'active-run' && activeRequest && (
              <MarketIntelligenceProgress
                request={activeRequest}
                onCancel={() => {
                  setActiveRequest(null);
                  setCurrentRequest(null);
                  setUiState('history-present');
                }}
              />
            )}

            {/* Results Display */}
            {currentRequest?.status === 'completed' && (
              <MarketIntelligenceResults
                request={currentRequest}
                onExport={handleExport}
                onDelete={() => handleDelete(currentRequest.id)}
                showHeader={false}
              />
            )}

            {/* Error States */}
            {uiState === 'failure' && currentRequest && (
              <Card>
                <CardContent className="pt-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <div className="font-medium">Analysis failed</div>
                      <div className="text-sm mt-1">
                        {currentRequest.status_message || 'An error occurred during analysis'}
                      </div>
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3 mt-4">
                    <Button 
                      onClick={() => {
                        setCurrentRequest(null);
                        setUiState('first-time');
                      }}
                      variant="default"
                    >
                      Start New Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results State */}
            {uiState === 'no-results' && currentRequest && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900">No recent postings matched your filters</h3>
                    <p className="text-sm text-gray-600 mt-2">Try adjusting your search criteria or date range</p>
                    <Button 
                      onClick={() => {
                        setCurrentRequest(null);
                        setUiState('first-time');
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Start New Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}