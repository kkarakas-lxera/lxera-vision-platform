import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, HelpCircle, AlertCircle, TrendingUp, CheckCircle2, RefreshCw, Clock, ChevronDown, ChevronUp, Sparkles, Target, DollarSign, Zap, ExternalLink, Info, BarChart3, Users, Building2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarketSkill {
  skill_name: string;
  match_percentage: number;
  source?: 'ai' | 'cv' | 'verified';
  confidence?: number;
  category?: 'critical' | 'emerging' | 'foundational';
  market_demand?: 'high' | 'medium' | 'low';
}

interface SkillInsight {
  skill_name: string;
  why_crucial: string;
  market_context: string;
  impact_score: number;
}

interface Citation {
  id: number;
  text: string;
  source: string;
  url?: string;
}

interface MarketInsights {
  executive_summary: string;
  skill_insights: SkillInsight[];
  competitive_positioning: string;
  talent_strategy: string;
  citations: Citation[];
}

interface MarketGapBarsProps {
  skills: MarketSkill[];
  insights?: MarketInsights;
  industry?: string;
  role?: string;
  showSource?: boolean;
  className?: string;
  lastUpdated?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Citation component with hover tooltip
const CitationLink = ({ citation }: { citation: Citation }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup className="inline-flex items-center">
            <a 
              href={citation.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium text-xs ml-0.5 cursor-pointer"
              onClick={(e) => {
                if (!citation.url) {
                  e.preventDefault();
                }
              }}
            >
              ({citation.id})
            </a>
          </sup>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white border shadow-lg">
          <div className="space-y-1 p-1">
            <p className="text-xs font-medium text-gray-900">{citation.source}</p>
            <p className="text-xs text-gray-600">{citation.text}</p>
            {citation.url && (
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
              >
                <span>View source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper function to render text with citations
const renderTextWithCitations = (text: string, citations: Citation[]) => {
  const citationRegex = /\((\d+)\)/g;
  const parts = text.split(citationRegex);
  
  return parts.map((part, index) => {
    const citationId = parseInt(part);
    const citation = citations.find(c => c.id === citationId);
    
    if (citation) {
      return <CitationLink key={index} citation={citation} />;
    }
    return <span key={index}>{part}</span>;
  });
};

export default function MarketGapBars({ 
  skills, 
  insights,
  industry, 
  role, 
  showSource = false,
  className = '',
  lastUpdated,
  onRefresh,
  isRefreshing = false
}: MarketGapBarsProps) {
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllEmerging, setShowAllEmerging] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  // Group skills by match percentage
  const missingSkills = skills.filter(s => s.match_percentage <= 40);
  const emergingSkills = skills.filter(s => s.match_percentage > 40 && s.match_percentage <= 80);
  const coveredSkills = skills.filter(s => s.match_percentage > 80);

  const getSkillCategoryBadge = (skill: MarketSkill) => {
    if (skill.category === 'critical' || skill.market_demand === 'high') {
      return { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' };
    } else if (skill.category === 'emerging') {
      return { label: 'Emerging', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    } else {
      return { label: 'Foundational', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'ai': return <Brain className="h-3 w-3" />;
      case 'cv': return <span className="text-xs">📄</span>;
      case 'verified': return <CheckCircle2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const SkillRow = ({ skill }: { skill: MarketSkill }) => {
    const categoryBadge = getSkillCategoryBadge(skill);
    const sourceIcon = showSource ? getSourceIcon(skill.source) : null;
    const isSelected = selectedSkill === skill.skill_name;
    
    // Determine color based on match percentage
    const getMatchColor = (percentage: number) => {
      if (percentage <= 40) return 'text-red-500';
      if (percentage <= 60) return 'text-orange-500';
      if (percentage <= 80) return 'text-yellow-500';
      return 'text-green-500';
    };
    
    return (
      <div 
        className={cn(
          "flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-all",
          isSelected ? "bg-purple-50 border border-purple-200" : "hover:bg-gray-50"
        )}
        onClick={() => setSelectedSkill(skill.skill_name)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm text-gray-900 truncate font-medium">{skill.skill_name}</span>
          <Badge className={cn("text-xs px-1.5 py-0", categoryBadge.className)}>
            {categoryBadge.label}
          </Badge>
          {sourceIcon && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-gray-400">{sourceIcon}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Source: {skill.source}</p>
                  {skill.confidence && (
                    <p className="text-xs">Confidence: {skill.confidence}%</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-16 relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn("absolute inset-y-0 left-0 rounded-full transition-all", 
                getMatchColor(skill.match_percentage).replace('text-', 'bg-')
              )}
              style={{ width: `${skill.match_percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-10 text-right">
            {skill.match_percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-base font-semibold text-gray-900">Market Skills Gap</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Based on 2025 job market analysis for {role || 'this department'} 
                  {industry ? ` in ${industry} industry` : ''}. Data sourced from current job 
                  postings and industry benchmarks.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {lastUpdated.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          {onRefresh && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="h-7 px-2"
                  >
                    <RefreshCw className={cn(
                      "h-3 w-3",
                      isRefreshing && "animate-spin"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Refresh market data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Skills List Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Missing Skills Section */}
            {missingSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h4 className="text-sm font-medium text-gray-900">
                      Missing Skills ({missingSkills.length})
                    </h4>
                  </div>
                  {missingSkills.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllMissing(!showAllMissing)}
                      className="h-7 px-2 text-xs"
                    >
                      {showAllMissing ? (
                        <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
                      ) : (
                        <>Show all <ChevronDown className="h-3 w-3 ml-1" /></>
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {(showAllMissing ? missingSkills : missingSkills.slice(0, 5)).map((skill, index) => (
                    <SkillRow key={`missing-${index}`} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {/* Emerging Skills Section */}
            {emergingSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h4 className="text-sm font-medium text-gray-900">
                      Emerging Skills ({emergingSkills.length})
                    </h4>
                  </div>
                  {emergingSkills.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllEmerging(!showAllEmerging)}
                      className="h-7 px-2 text-xs"
                    >
                      {showAllEmerging ? (
                        <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
                      ) : (
                        <>Show all <ChevronDown className="h-3 w-3 ml-1" /></>
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {(showAllEmerging ? emergingSkills : emergingSkills.slice(0, 5)).map((skill, index) => (
                    <SkillRow key={`emerging-${index}`} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {/* Covered Skills Section */}
            {coveredSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Covered Skills ({coveredSkills.length})
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {coveredSkills.slice(0, 6).map((skill, index) => (
                    <div key={`covered-${index}`} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{skill.skill_name}</span>
                    </div>
                  ))}
                  {coveredSkills.length > 6 && (
                    <p className="text-xs text-gray-500 col-span-2">
                      +{coveredSkills.length - 6} more covered skills
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Column */}
          {insights && (
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Executive Summary Card */}
                <Card className="p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Executive Insights</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insights.citations ? renderTextWithCitations(insights.executive_summary, insights.citations) : insights.executive_summary}
                  </p>
                </Card>

                {/* Selected Skill Analysis */}
                {selectedSkill && insights.skill_insights && (
                  <Card className="p-4 border-2 border-purple-200 bg-purple-50/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Info className="h-4 w-4 text-purple-600" />
                          {selectedSkill}
                        </h4>
                        <button 
                          onClick={() => setSelectedSkill(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      
                      {(() => {
                        const skillInsight = insights.skill_insights.find(s => s.skill_name === selectedSkill);
                        if (!skillInsight) return null;
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Why it's crucial:</p>
                              <p className="text-sm text-gray-700">
                                {insights.citations ? renderTextWithCitations(skillInsight.why_crucial, insights.citations) : skillInsight.why_crucial}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Market context:</p>
                              <p className="text-sm text-gray-700">
                                {insights.citations ? renderTextWithCitations(skillInsight.market_context, insights.citations) : skillInsight.market_context}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                              <BarChart3 className="h-4 w-4 text-purple-600" />
                              <p className="text-xs font-medium text-purple-700">
                                Impact Score: {skillInsight.impact_score}/10
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                )}

                {/* Strategic Insights Tabs */}
                <Tabs defaultValue="positioning" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="positioning" className="text-xs">Positioning</TabsTrigger>
                    <TabsTrigger value="talent" className="text-xs">Talent Strategy</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="positioning" className="mt-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-sm text-gray-900">Competitive Positioning</h4>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {insights.citations ? renderTextWithCitations(insights.competitive_positioning, insights.citations) : insights.competitive_positioning}
                      </p>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="talent" className="mt-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-sm text-gray-900">Talent Strategy</h4>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {insights.citations ? renderTextWithCitations(insights.talent_strategy, insights.citations) : insights.talent_strategy}
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Prompt to select a skill */}
                {!selectedSkill && (
                  <Card className="p-3 bg-gray-50 border-gray-200">
                    <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-1">
                      <Info className="h-3 w-3" />
                      Click on any skill to see detailed analysis
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}</div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No market benchmark data available yet</p>
        </div>
      )}
    </div>
  );
}