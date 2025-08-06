import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, HelpCircle, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MarketSkill {
  skill_name: string;
  match_percentage: number;
  source?: 'ai' | 'cv' | 'verified';
  confidence?: number;
  category?: 'critical' | 'emerging' | 'foundational';
  market_demand?: 'high' | 'medium' | 'low';
}

interface MarketGapBarsProps {
  skills: MarketSkill[];
  industry?: string;
  role?: string;
  showSource?: boolean;
  className?: string;
}

export default function MarketGapBars({ 
  skills, 
  industry, 
  role, 
  showSource = false,
  className = ''
}: MarketGapBarsProps) {
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
    
    // Determine color based on match percentage
    const getMatchColor = (percentage: number) => {
      if (percentage <= 40) return 'text-red-500';
      if (percentage <= 60) return 'text-orange-500';
      if (percentage <= 80) return 'text-yellow-500';
      return 'text-green-500';
    };
    
    return (
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm text-gray-900 truncate">{skill.skill_name}</span>
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
      </div>
      
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Missing Skills Column */}
          {missingSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h4 className="text-sm font-medium text-gray-900">
                  Missing Skills ({missingSkills.length})
                </h4>
              </div>
              <div className="space-y-2">
                {missingSkills.slice(0, 5).map((skill, index) => (
                  <SkillRow key={`missing-${index}`} skill={skill} />
                ))}
                {missingSkills.length > 5 && (
                  <p className="text-xs text-gray-500 pl-4">
                    +{missingSkills.length - 5} more missing skills
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Emerging/Partially Covered Column */}
          {emergingSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <h4 className="text-sm font-medium text-gray-900">
                  Emerging Skills ({emergingSkills.length})
                </h4>
              </div>
              <div className="space-y-2">
                {emergingSkills.slice(0, 5).map((skill, index) => (
                  <SkillRow key={`emerging-${index}`} skill={skill} />
                ))}
                {emergingSkills.length > 5 && (
                  <p className="text-xs text-gray-500 pl-4">
                    +{emergingSkills.length - 5} more emerging skills
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Show covered skills if no other categories exist */}
          {missingSkills.length === 0 && emergingSkills.length === 0 && coveredSkills.length > 0 && (
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h4 className="text-sm font-medium text-gray-900">
                  Covered Skills ({coveredSkills.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {coveredSkills.slice(0, 10).map((skill, index) => (
                  <SkillRow key={`covered-${index}`} skill={skill} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No market benchmark data available yet</p>
        </div>
      )}
    </div>
  );
}