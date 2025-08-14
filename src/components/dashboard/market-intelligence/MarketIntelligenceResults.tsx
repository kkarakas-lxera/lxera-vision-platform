import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Trash2, 
  ChevronDown,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import type { MarketIntelligenceRequest } from './MarketIntelligence';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';

interface MarketIntelligenceResultsProps {
  request: MarketIntelligenceRequest;
  onExport: (format: 'pdf' | 'csv') => void;
  onDelete: () => void;
}

export default function MarketIntelligenceResults({
  request,
  onExport,
  onDelete
}: MarketIntelligenceResultsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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

  const handleCopySection = async (section: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard',
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy content',
        variant: 'destructive'
      });
    }
  };

  // Parse analysis data for structured display
  const analysisData = request.analysis_data || {};
  const skillTrends = analysisData.skill_trends || {};
  const jobsCount = request.scraped_data?.total_jobs || request.scraped_data?.jobs_count || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Minimalistic Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {request.position_title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{request.regions?.join(', ') || request.countries?.join(', ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{getRelativeTime(request.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{jobsCount} positions</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={onDelete} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mismatch Alerts */}
      {request.analysis_data?.requirements_comparison?.mismatch_alerts?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-2">Position vs Market Mismatches</h3>
          <div className="space-y-1">
            {request.analysis_data.requirements_comparison.mismatch_alerts.map((alert: string, index: number) => (
              <div key={index} className="text-sm text-orange-800">{alert}</div>
            ))}
          </div>
          {request.analysis_data.requirements_comparison.market_alignment_score !== undefined && (
            <div className="mt-2 text-xs text-orange-700">
              Market Alignment: {request.analysis_data.requirements_comparison.market_alignment_score}%
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-2xl font-semibold text-gray-900">{jobsCount}</div>
          <div className="text-sm text-gray-600 mt-1">Jobs Analyzed</div>
        </div>
        {skillTrends.top_skills && (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900">{skillTrends.top_skills.length}</div>
            <div className="text-sm text-gray-600 mt-1">Skills Identified</div>
          </div>
        )}
        {skillTrends.experience_distribution && (
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900">{Object.keys(skillTrends.experience_distribution).length}</div>
            <div className="text-sm text-gray-600 mt-1">Experience Levels</div>
          </div>
        )}
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-2xl font-semibold text-gray-900">{request.date_window}</div>
          <div className="text-sm text-gray-600 mt-1">Time Range</div>
        </div>
      </div>

      {/* Executive Summary */}
      {request.ai_insights && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Executive Summary</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('summary', request.ai_insights || '')}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'summary' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="prose max-w-none prose-gray prose-sm prose-headings:text-gray-900 prose-headings:font-medium prose-h1:text-lg prose-h1:mb-3 prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h3:mb-1 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-medium prose-ul:my-2 prose-li:my-0">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base font-medium text-gray-900 mt-4 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-medium text-gray-900 mt-3 mb-1">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 leading-relaxed mb-3 text-sm">{children}</p>,
                  ul: ({children}) => <ul className="space-y-1 mb-3">{children}</ul>,
                  li: ({children}) => <li className="text-gray-700 text-sm flex items-start"><span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span>{children}</span></li>,
                  strong: ({children}) => <strong className="font-medium text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-600">{children}</em>
                }}
              >
                {request.ai_insights}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Top Skills */}
      {skillTrends.top_skills && skillTrends.top_skills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Skills in Demand</h2>
          <div className="bg-white border border-gray-100 rounded-lg divide-y divide-gray-50">
            {skillTrends.top_skills.slice(0, 8).map((skill: any, index: number) => (
              <div key={skill.skill || index} className="p-4 hover:bg-gray-25 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {skill.skill}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {skill.demand} positions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10 text-right">
                      {skill.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Distribution */}
      {skillTrends.experience_distribution && Object.keys(skillTrends.experience_distribution).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Experience Requirements</h2>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(skillTrends.experience_distribution).map(([level, count]) => {
                const total = Object.values(skillTrends.experience_distribution).reduce((a: any, b: any) => a + b, 0);
                const percentage = Math.round(((count as any) / total) * 100);
                
                return (
                  <div key={level} className="text-center">
                    <div className="text-xl font-semibold text-gray-900 mb-1">{count as any}</div>
                    <div className="text-sm text-gray-600 mb-2">{level}</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                      <div 
                        className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}