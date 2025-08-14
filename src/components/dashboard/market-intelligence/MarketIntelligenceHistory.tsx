import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Plus,
  Brain
} from 'lucide-react';
import type { MarketIntelligenceRequest } from './MarketIntelligence';

interface MarketIntelligenceHistoryProps {
  requests: MarketIntelligenceRequest[];
  currentRequestId?: string;
  onSelect: (request: MarketIntelligenceRequest) => void;
  onRerun: (request: MarketIntelligenceRequest) => void;
  onDelete: (requestId: string) => void;
  onStartNew: () => void;
}

export default function MarketIntelligenceHistory({
  requests,
  currentRequestId,
  onSelect,
  onRerun,
  onDelete,
  onStartNew
}: MarketIntelligenceHistoryProps) {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'queued':
      case 'scraping':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'completed': 'default',
      'failed': 'destructive',
      'queued': 'secondary',
      'scraping': 'secondary',
      'analyzing': 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) {
      return d.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        hour12: true
      });
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">History</CardTitle>
            <Button 
              onClick={onStartNew}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No previous analyses</p>
            <Button 
              onClick={onStartNew}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Brain className="h-4 w-4 mr-2" />
              Start First Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Analyses</CardTitle>
          <Button 
            onClick={onStartNew}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Last 10 reports</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {requests.slice(0, 10).map((request) => {
            const isSelected = request.id === currentRequestId;
            const isActive = ['queued', 'scraping', 'analyzing'].includes(request.status);
            
            return (
              <div
                key={request.id}
                className={`
                  p-4 cursor-pointer transition-all duration-200
                  ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}
                  ${isActive ? 'animate-pulse bg-yellow-50 border-l-4 border-yellow-400' : ''}
                `}
                onClick={() => onSelect(request)}
              >
                <div className="space-y-2">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(request.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.position_title || 'Unknown Position'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.regions?.join(', ') || request.countries?.slice(0, 2).join(', ')}
                          {request.countries && request.countries.length > 2 && ` +${request.countries.length - 2}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {/* Date and Actions Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(request.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRerun(request);
                        }}
                        title="Rerun with same filters"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(request.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Message */}
                  {request.status_message && isActive && (
                    <p className="text-xs text-gray-600 italic truncate">
                      {request.status_message}
                    </p>
                  )}

                  {/* Quick Stats for Completed */}
                  {request.status === 'completed' && request.scraped_data && (
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{request.scraped_data.jobs_count || 0} jobs</span>
                      {request.analysis_data?.skill_trends?.top_skills && (
                        <>
                          <span>•</span>
                          <span>{request.analysis_data.skill_trends.top_skills.length} skills</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}