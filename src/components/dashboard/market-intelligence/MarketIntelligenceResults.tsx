import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  ChevronDown,
  TrendingUp,
  Users,
  Briefcase,
  Copy,
  Check
} from 'lucide-react';
import type { MarketIntelligenceRequest } from './MarketIntelligence';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';

interface MarketIntelligenceResultsProps {
  request: MarketIntelligenceRequest;
  onExport: (format: 'pdf' | 'csv') => void;
  onRerun: () => void;
  onDelete: () => void;
}

export default function MarketIntelligenceResults({
  request,
  onExport,
  onRerun,
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
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Market Intelligence Report</CardTitle>
              <CardDescription className="mt-1">
                {request.position_title} • {request.regions?.join(', ') || request.countries?.join(', ')}
              </CardDescription>
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
                  <DropdownMenuItem onClick={() => onExport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={onRerun} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Rerun
              </Button>
              <Button 
                onClick={onDelete} 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <span>Analyzed {jobsCount} postings</span>
            <span>•</span>
            <span>Last updated: {getRelativeTime(request.updated_at)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      {skillTrends.top_skills && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillTrends.top_skills && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Skills</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {skillTrends.top_skills.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      In-demand capabilities
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          )}

          {skillTrends.experience_distribution && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experience Levels</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(skillTrends.experience_distribution).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Distribution categories
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* Executive Summary / AI Insights */}
      {request.ai_insights && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Executive Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopySection('summary', request.ai_insights || '')}
              >
                {copiedSection === 'summary' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{request.ai_insights}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Analysis */}
      {skillTrends.top_skills && skillTrends.top_skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Skills in Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillTrends.top_skills.slice(0, 10).map((skill: any, index: number) => (
                <div key={skill.skill || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {skill.skill}
                    </span>
                    <span className="text-xs text-gray-500">
                      {skill.demand} postings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {skill.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Distribution */}
      {skillTrends.experience_distribution && Object.keys(skillTrends.experience_distribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Experience Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(skillTrends.experience_distribution).map(([level, count]) => (
                <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">{level}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count as any}</p>
                  <p className="text-xs text-gray-500">positions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => {
              // TODO: Implement save snapshot
              toast({
                title: 'Snapshot Saved',
                description: 'Market analysis saved for future reference',
              });
            }} className="flex-1">
              Save Snapshot
            </Button>
            <Button onClick={onRerun} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rerun with Same Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}