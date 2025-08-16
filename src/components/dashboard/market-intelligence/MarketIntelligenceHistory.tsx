import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Plus,
  Brain,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { MarketIntelligenceRequest } from './MarketIntelligence';

interface MarketIntelligenceHistoryProps {
  requests: MarketIntelligenceRequest[];
  currentRequestId?: string;
  onSelect: (request: MarketIntelligenceRequest) => void;
  onDelete: (requestId: string) => void;
  onStartNew: () => void;
}

export default function MarketIntelligenceHistory({
  requests,
  currentRequestId,
  onSelect,
  onDelete,
  onStartNew
}: MarketIntelligenceHistoryProps) {
  const [sortField, setSortField] = useState<'role' | 'date' | 'status' | 'jobs'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: 'role' | 'date' | 'status' | 'jobs') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: 'role' | 'date' | 'status' | 'jobs') => {
    if (field !== sortField) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortField) {
      case 'role':
        aVal = a.position_title || '';
        bVal = b.position_title || '';
        break;
      case 'date':
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'jobs':
        aVal = a.scraped_data?.jobs_count || 0;
        bVal = b.scraped_data?.jobs_count || 0;
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
  
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-800"
                    onClick={() => handleSort('role')}
                  >
                    Role {getSortIcon('role')}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider">Regions</th>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-800"
                    onClick={() => handleSort('date')}
                  >
                    Date {getSortIcon('date')}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-800"
                    onClick={() => handleSort('jobs')}
                  >
                    Jobs {getSortIcon('jobs')}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-800"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-xs text-gray-600 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRequests.slice(0, 10).map((request) => {
                const isSelected = request.id === currentRequestId;
                const isActive = ['queued', 'scraping', 'analyzing'].includes(request.status);
                
                return (
                  <tr
                    key={request.id}
                    className={`
                      cursor-pointer transition-all duration-200
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${isActive ? 'bg-yellow-50' : ''}
                    `}
                    onClick={() => onSelect(request)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {request.position_title || 'Unknown Position'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                        {request.regions?.join(', ') || request.countries?.slice(0, 2).join(', ')}
                        {request.countries && request.countries.length > 2 && ` +${request.countries.length - 2}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(request.created_at)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {request.status === 'completed' && request.scraped_data 
                          ? `${request.scraped_data.jobs_count || 0}`
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(request.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}