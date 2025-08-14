import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Download,
  Trash2,
  ChevronDown,
  AlertCircle,
  FileText
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import MarketIntelligenceResults from '@/components/dashboard/market-intelligence/MarketIntelligenceResults';
import type { MarketIntelligenceRequest } from '@/components/dashboard/market-intelligence/MarketIntelligence';

export default function MarketIntelligenceReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<MarketIntelligenceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && userProfile?.company_id) {
      fetchReport();
    }
  }, [id, userProfile?.company_id]);

  const fetchReport = async () => {
    if (!id || !userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('market_intelligence_requests' as any)
        .select('*')
        .eq('id', id)
        .eq('company_id', userProfile.company_id)
        .single();

      if (error) throw error;
      
      setRequest(data as MarketIntelligenceRequest);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Report not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: `Exporting as ${format.toUpperCase()}...`,
    });
  };

  const handleDelete = async () => {
    if (!request) return;

    try {
      const { error } = await supabase
        .from('market_intelligence_requests' as any)
        .delete()
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Report has been removed',
      });

      navigate('/dashboard/market-intelligence');
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/dashboard/market-intelligence')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900">Report Not Found</h3>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
              <Button 
                onClick={() => navigate('/dashboard/market-intelligence')}
                variant="outline"
                className="mt-4"
              >
                Back to Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (request.status !== 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/dashboard/market-intelligence')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900">Report Not Ready</h3>
              <p className="text-sm text-gray-600 mt-2">
                This analysis is still {request.status}. Please check back later.
              </p>
              <Button 
                onClick={() => navigate('/dashboard/market-intelligence')}
                variant="outline"
                className="mt-4"
              >
                Back to Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/dashboard/market-intelligence')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div className="border-l border-gray-200 pl-4">
            <h1 className="text-2xl font-bold text-gray-900">{request.position_title}</h1>
            <p className="text-sm text-gray-600">
              Market Analysis • {getRelativeTime(request.updated_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={handleDelete} 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <MarketIntelligenceResults
        request={request}
        onExport={handleExport}
        onDelete={handleDelete}
      />
    </div>
  );
}