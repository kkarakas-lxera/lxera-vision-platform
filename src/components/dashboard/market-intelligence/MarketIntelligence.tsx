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
  ArrowRight
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
  regions: string[];
  countries: string[];
  date_window: '24h' | '7d' | '30d' | '90d' | 'custom';
  since_date?: string;
  keywords_override?: string;
  focus_area: 'technical' | 'all_skills';
  status: 'queued' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  status_message?: string;
  scraped_data?: any;
  ai_insights?: string;
  analysis_data?: {
    skill_trends?: any;
    salary_trends?: any;
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
    source: 'linkedin' as 'linkedin',
    focusArea: 'all_skills' as 'technical' | 'all_skills'
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchMarketRequests();
    }
  }, [userProfile?.company_id]);

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
        .limit(10);

      if (error) throw error;
      
      const requests = (data as MarketIntelligenceRequest[]) || [];
      setMarketRequests(requests);
      
      // Check for active request
      const active = requests.find(req => ['queued', 'scraping', 'analyzing'].includes(req.status));
      if (active) {
        setActiveRequest(active);
        startPolling(active.id);
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
    
    if (!config.positionId) {
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
          position_id: config.positionId || null,
          position_title: config.positionTitle || null,
          regions: config.regions,
          countries: config.countries,
          date_window: config.dateWindow,
          since_date: config.dateWindow === 'custom' ? config.sinceDate : null,
          keywords_override: config.keywordsOverride || null,
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

      // Start the edge function
      const response = await supabase.functions.invoke('market-research-agent', {
        body: {
          request_id: request.id,
          regions: config.regions,
          countries: config.countries,
          focus_area: config.focusArea,
          custom_prompt: config.keywordsOverride || null,
          position_title: config.positionTitle,
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

  const startPolling = (requestId: string) => {
    // Clear existing interval if any
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const maxAttempts = 120; // 5 minutes
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
        setCurrentRequest(request);
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
          } else {
            toast({
              title: 'Analysis Failed',
              description: request.status_message || 'Please try again',
              variant: 'destructive'
            });
          }
        }
        
        // Check for timeout
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          setUiState('timeout');
          
          await supabase
            .from('market_intelligence_requests' as any)
            .update({ 
              status: 'failed',
              status_message: 'Analysis timed out after 5 minutes'
            })
            .eq('id', requestId);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 2500);

    setPollingInterval(interval);
  };

  const handleRetry = () => {
    if (currentRequest) {
      // Use same config from failed request
      setConfig({
        positionId: currentRequest.position_id || '',
        positionTitle: currentRequest.position_title || '',
        regions: currentRequest.regions || [],
        countries: currentRequest.countries || [],
        dateWindow: currentRequest.date_window || '30d',
        sinceDate: currentRequest.since_date || '',
        keywordsOverride: currentRequest.keywords_override || '',
        focusArea: currentRequest.focus_area || 'all_skills'
      });
      submitMarketIntelligenceRequest();
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('market_intelligence_requests' as any)
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setMarketRequests(prev => prev.filter(req => req.id !== requestId));
      if (currentRequest?.id === requestId) {
        setCurrentRequest(marketRequests.find(req => req.id !== requestId) || null);
      }

      toast({
        title: 'Deleted',
        description: 'Analysis has been removed',
      });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete analysis',
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration or Results */}
          {(uiState === 'first-time' || uiState === 'config-incomplete') && (
            <MarketIntelligenceConfig
              config={config}
              setConfig={setConfig}
              validationErrors={validationErrors}
              onSubmit={submitMarketIntelligenceRequest}
              isLoading={!!activeRequest}
            />
          )}

          {/* Active Run Progress */}
          {uiState === 'active-run' && activeRequest && (
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

          {/* Results */}
          {(uiState === 'success' || uiState === 'history-present') && currentRequest?.status === 'completed' && (
            <MarketIntelligenceResults
              request={currentRequest}
              onExport={handleExport}
              onRerun={handleRetry}
              onDelete={() => handleDelete(currentRequest.id)}
            />
          )}

          {/* Failure State */}
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
                  <Button onClick={handleRetry} variant="default">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentRequest(null);
                      setUiState('first-time');
                    }}
                    variant="outline"
                  >
                    Adjust Filters
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
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Try these suggestions:</p>
                    <div className="flex flex-col gap-2 items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setConfig(prev => ({ ...prev, dateWindow: '90d' }));
                          submitMarketIntelligenceRequest();
                        }}
                      >
                        Extend to 90 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setConfig(prev => ({ ...prev, regions: ['US', 'Europe'] }));
                          submitMarketIntelligenceRequest();
                        }}
                      >
                        Try broader region
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeout State */}
          {uiState === 'timeout' && (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <div className="font-medium">The analysis is taking longer than expected</div>
                    <div className="text-sm mt-1">You can retry or we'll notify you when complete</div>
                  </AlertDescription>
                </Alert>
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline">
                    Run in background
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - History */}
        <div className="lg:col-span-1">
          <MarketIntelligenceHistory
            requests={marketRequests}
            currentRequestId={currentRequest?.id}
            onSelect={setCurrentRequest}
            onRerun={(request) => {
              setConfig({
                positionId: request.position_id || '',
                positionTitle: request.position_title || '',
                regions: request.regions || [],
                countries: request.countries || [],
                dateWindow: request.date_window || '30d',
                sinceDate: request.since_date || '',
                keywordsOverride: request.keywords_override || '',
                focusArea: request.focus_area || 'all_skills'
              });
              submitMarketIntelligenceRequest();
            }}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}