import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MarketSkill {
  skill_name: string;
  match_percentage: number;
  source?: 'ai' | 'cv' | 'verified';
  confidence?: number;
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
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'ai':
        return '🧠';
      case 'cv':
        return '📄';
      case 'verified':
        return '✅';
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Skills Gap to Market</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  This shows how your team's skills compare to market expectations for similar roles. 
                  Data is generated using GPT-4o analysis of current job market requirements and industry standards.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {industry && (
          <Badge variant="outline" className="text-xs">
            Industry: {industry}
          </Badge>
        )}
        {role && (
          <Badge variant="outline" className="text-xs">
            Role: {role}
          </Badge>
        )}
      </div>
      
      {skills.length > 0 ? (
        <>
          <div className="space-y-2">
            {skills.slice(0, 8).map((skill, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showSource && (
                      <span className="text-xs">{getSourceIcon(skill.source)}</span>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm text-gray-700 hover:text-gray-900 cursor-help">
                            {skill.skill_name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {showSource && skill.confidence ? 
                              `${skill.source === 'ai' ? 'AI assessed' : skill.source === 'cv' ? 'Extracted from CV' : 'Verified'} with ${skill.confidence}% confidence` : 
                              'Benchmarked from GPT-4o and industry datasets'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {skill.match_percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={skill.match_percentage} 
                    className="h-2 flex-1"
                    indicatorClassName={getProgressColor(skill.match_percentage)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {skills.length > 8 && (
            <p className="text-xs text-gray-500 text-center">
              +{skills.length - 8} more skills
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No market benchmark data available yet
        </p>
      )}
    </div>
  );
}