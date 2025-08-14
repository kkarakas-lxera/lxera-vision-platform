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
  Check,
  Brain
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
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                Market Intelligence Report
              </CardTitle>
              <CardDescription className="mt-2 text-base font-medium text-gray-700">
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
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-700">{jobsCount} jobs analyzed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-700">Updated {getRelativeTime(request.updated_at)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      {skillTrends.top_skills && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillTrends.top_skills && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Top Skills Identified</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {skillTrends.top_skills.length}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      In-demand capabilities
                    </p>
                  </div>
                  <div className="relative">
                    <TrendingUp className="h-10 w-10 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {skillTrends.experience_distribution && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Experience Levels</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {Object.keys(skillTrends.experience_distribution).length}
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Distribution categories
                    </p>
                  </div>
                  <div className="relative">
                    <Users className="h-10 w-10 text-green-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* Executive Summary / AI Insights */}
      {request.ai_insights && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Brain className="h-6 w-6 text-purple-600" />
                Executive Summary
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopySection('summary', request.ai_insights || '')}
                className="hover:bg-white/50"
              >
                {copiedSection === 'summary' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-purple-600" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-3 prose-li:my-1">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                  ul: ({children}) => <ul className="space-y-1 mb-4">{children}</ul>,
                  li: ({children}) => <li className="text-gray-700 flex items-start"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span><span>{children}</span></li>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-600">{children}</em>
                }}
              >
                {request.ai_insights}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Analysis */}
      {skillTrends.top_skills && skillTrends.top_skills.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Top Skills in Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillTrends.top_skills.slice(0, 10).map((skill: any, index: number) => (
                <div key={skill.skill || index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {skill.skill}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {skill.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {skill.demand} jobs
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
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Users className="h-6 w-6 text-green-600" />
              Experience Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(skillTrends.experience_distribution).map(([level, count]) => {
                const total = Object.values(skillTrends.experience_distribution).reduce((a: any, b: any) => a + b, 0);
                const percentage = Math.round(((count as any) / total) * 100);
                
                return (
                  <div key={level} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1">{level}</p>
                    <p className="text-2xl font-bold text-gray-900">{count as any}</p>
                    <p className="text-xs text-gray-500 mt-1">positions</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">{percentage}%</p>
                  </div>
                );
              })}
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