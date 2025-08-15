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
  ChevronUp,
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
import SkillsDemandAnalysis from './SkillsDemandAnalysis';

interface MarketIntelligenceResultsProps {
  request: MarketIntelligenceRequest;
  onExport: (format: 'pdf' | 'csv') => void;
  onDelete: () => void;
  showHeader?: boolean;
}

export default function MarketIntelligenceResults({
  request,
  onExport,
  onDelete,
  showHeader = true
}: MarketIntelligenceResultsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedCertCategories, setExpandedCertCategories] = useState<Record<string, boolean>>({
    most_requested: true,
    high_value: true, 
    emerging: true
  });
  const [showAllCerts, setShowAllCerts] = useState<Record<string, boolean>>({});

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

  const toggleCertCategory = (category: string) => {
    setExpandedCertCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleShowAllCerts = (category: string) => {
    setShowAllCerts(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Parse analysis data for structured display
  const analysisData = request.analysis_data || {};
  const skillTrends = analysisData.skill_trends || {};
  const jobsCount = request.scraped_data?.total_jobs || request.scraped_data?.jobs_count || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Minimalistic Header */}
      {showHeader && (
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
            <div className="prose max-w-none prose-gray prose-sm">
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b border-gray-100">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base font-medium text-gray-900 mt-4 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-medium text-gray-900 mt-3 mb-1">{children}</h3>,
                  p: ({children}) => {
                    // Convert React elements/objects to plain text properly
                    const getTextContent = (element: any): string => {
                      if (typeof element === 'string') return element;
                      if (typeof element === 'number') return element.toString();
                      if (React.isValidElement(element)) {
                        // Handle React elements by extracting their text content
                        if (typeof element.props.children === 'string') {
                          return element.props.children;
                        }
                        if (Array.isArray(element.props.children)) {
                          return element.props.children.map(getTextContent).join('');
                        }
                        return getTextContent(element.props.children);
                      }
                      if (Array.isArray(element)) {
                        return element.map(getTextContent).join('');
                      }
                      if (element && typeof element === 'object') {
                        // For objects, try to extract meaningful text
                        if (element.props && element.props.children) {
                          return getTextContent(element.props.children);
                        }
                        return '';
                      }
                      return String(element || '');
                    };

                    const content = getTextContent(children);
                    
                    // Check for callout patterns
                    if (content.includes('💡') || content.includes('Key Insight')) {
                      return (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
                          <div className="flex items-start">
                            <span className="text-blue-600 text-base mr-2">💡</span>
                            <p className="text-blue-800 text-sm font-medium leading-relaxed">{content}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    if (content.includes('⚠️') || content.includes('Market Alert')) {
                      return (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded-r">
                          <div className="flex items-start">
                            <span className="text-yellow-600 text-base mr-2">⚠️</span>
                            <p className="text-yellow-800 text-sm font-medium leading-relaxed">{content}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    if (content.includes('🚀') || content.includes('Opportunity')) {
                      return (
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3 rounded-r">
                          <div className="flex items-start">
                            <span className="text-green-600 text-base mr-2">🚀</span>
                            <p className="text-green-800 text-sm font-medium leading-relaxed">{content}</p>
                          </div>
                        </div>
                      );
                    }
                    
                    // Regular paragraph with number/location/position highlighting
                    return (
                      <p 
                        className="text-gray-700 leading-relaxed mb-3 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: content
                            // Highlight numbers (especially job counts, percentages)
                            .replace(/\b(\d+(?:,\d{3})*(?:\.\d+)?%?)\b/g, '<span class="font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-xs">$1</span>')
                            // Highlight locations
                            .replace(/\b(North America|United States|US|USA|Canada|UK|Europe|Asia|MENA|Middle East|UAE|Saudi Arabia|Qatar|Kuwait|Turkey)\b/g, '<span class="font-medium text-purple-600 bg-purple-50 px-1 py-0.5 rounded text-xs">📍 $1</span>')
                            // Highlight positions/roles
                            .replace(/\b(Content Manager|Go To Market Strategist|Software Engineer|Data Scientist|Product Manager|Marketing Manager|Sales Manager)\b/gi, '<span class="font-medium text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded text-xs">👔 $1</span>')
                            // Highlight time periods
                            .replace(/\b(\d+\s+(?:days?|weeks?|months?|years?))\b/gi, '<span class="font-medium text-green-600 bg-green-50 px-1 py-0.5 rounded text-xs">⏰ $1</span>')
                        }}
                      />
                    );
                  },
                  ul: ({children}) => <ul className="space-y-1 mb-3" role="list">{children}</ul>,
                  ol: ({children}) => <ol className="space-y-1 mb-3 list-decimal list-inside" role="list">{children}</ol>,
                  li: ({children, ...props}) => {
                    // Use the same text extraction function as paragraphs
                    const getTextContent = (element: any): string => {
                      if (typeof element === 'string') return element;
                      if (typeof element === 'number') return element.toString();
                      if (React.isValidElement(element)) {
                        if (typeof element.props.children === 'string') {
                          return element.props.children;
                        }
                        if (Array.isArray(element.props.children)) {
                          return element.props.children.map(getTextContent).join('');
                        }
                        return getTextContent(element.props.children);
                      }
                      if (Array.isArray(element)) {
                        return element.map(getTextContent).join('');
                      }
                      if (element && typeof element === 'object') {
                        if (element.props && element.props.children) {
                          return getTextContent(element.props.children);
                        }
                        return '';
                      }
                      return String(element || '');
                    };

                    const content = getTextContent(children);
                    // Enhanced bullet points with color coding
                    if (content.includes('High Demand') || content.includes('Critical')) {
                      return (
                        <li className="text-red-700 text-sm flex items-start mb-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      );
                    }
                    if (content.includes('Opportunity') || content.includes('Growth')) {
                      return (
                        <li className="text-green-700 text-sm flex items-start mb-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      );
                    }
                    if (content.includes('Market') || content.includes('Competition')) {
                      return (
                        <li className="text-blue-700 text-sm flex items-start mb-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      );
                    }
                    // Default bullet point
                    return (
                      <li className="text-gray-700 text-sm flex items-start mb-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>{children}</span>
                      </li>
                    );
                  },
                  strong: ({children}) => <strong className="font-semibold text-gray-900 bg-gray-100 px-1 py-0.5 rounded text-xs">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-3 bg-gray-50 rounded-r">
                      <div className="text-gray-700 text-sm italic">{children}</div>
                    </blockquote>
                  )
                }}
              >
                {request.ai_insights}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Key Findings from Structured Data */}
      {(request as any).structured_insights?.key_findings && Array.isArray((request as any).structured_insights.key_findings) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Key Findings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('key-findings', JSON.stringify((request as any).structured_insights.key_findings, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'key-findings' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="space-y-3">
              {(request as any).structured_insights.key_findings.map((finding: any, index: number) => {
                const getTypeStyles = (type: string) => {
                  switch (type) {
                    case 'high_demand':
                      return {
                        bg: 'bg-red-50 border-red-200',
                        text: 'text-red-800',
                        dot: 'bg-red-500'
                      };
                    case 'opportunity':
                      return {
                        bg: 'bg-green-50 border-green-200', 
                        text: 'text-green-800',
                        dot: 'bg-green-500'
                      };
                    case 'market':
                      return {
                        bg: 'bg-blue-50 border-blue-200',
                        text: 'text-blue-800',
                        dot: 'bg-blue-500'
                      };
                    default:
                      return {
                        bg: 'bg-gray-50 border-gray-200',
                        text: 'text-gray-800',
                        dot: 'bg-gray-500'
                      };
                  }
                };
                
                const styles = getTypeStyles(finding.type);
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${styles.bg}`}>
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${styles.dot} mt-2 mr-3 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${styles.text} mb-1`}>{finding.title}</h4>
                        <p className={`text-sm ${styles.text}`}>{finding.description}</p>
                        {finding.metrics && Object.keys(finding.metrics).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {finding.metrics.percentage && (
                              <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium">
                                {finding.metrics.percentage}%
                              </span>
                            )}
                            {finding.metrics.count && (
                              <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium">
                                {finding.metrics.count} jobs
                              </span>
                            )}
                            {finding.metrics.skill_name && (
                              <span className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium">
                                {finding.metrics.skill_name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Strategic Recommendations from Structured Data */}
      {(request as any).structured_insights?.strategic_recommendations && Array.isArray((request as any).structured_insights.strategic_recommendations) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('strategic-recommendations', JSON.stringify((request as any).structured_insights.strategic_recommendations, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'strategic-recommendations' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="space-y-4">
              {(request as any).structured_insights.strategic_recommendations.map((recommendation: any, index: number) => {
                const getCategoryStyles = (category: string) => {
                  switch (category) {
                    case 'training_priorities':
                      return {
                        bg: 'bg-blue-50 border-blue-200',
                        text: 'text-blue-800',
                        icon: '🎯',
                        badge: 'bg-blue-100 text-blue-800'
                      };
                    case 'skill_combinations':
                      return {
                        bg: 'bg-purple-50 border-purple-200',
                        text: 'text-purple-800',
                        icon: '🔗',
                        badge: 'bg-purple-100 text-purple-800'
                      };
                    case 'hiring_strategy':
                      return {
                        bg: 'bg-green-50 border-green-200',
                        text: 'text-green-800',
                        icon: '👥',
                        badge: 'bg-green-100 text-green-800'
                      };
                    case 'competitive_positioning':
                      return {
                        bg: 'bg-orange-50 border-orange-200',
                        text: 'text-orange-800',
                        icon: '⚡',
                        badge: 'bg-orange-100 text-orange-800'
                      };
                    default:
                      return {
                        bg: 'bg-gray-50 border-gray-200',
                        text: 'text-gray-800',
                        icon: '📋',
                        badge: 'bg-gray-100 text-gray-800'
                      };
                  }
                };
                
                const styles = getCategoryStyles(recommendation.category);
                
                return (
                  <div key={index} className={`p-5 rounded-lg border ${styles.bg}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{styles.icon}</span>
                        <h3 className={`font-semibold ${styles.text}`}>{recommendation.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${styles.badge}`}>
                          {recommendation.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                        {recommendation.priority && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {recommendation.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className={`${styles.text} mb-3 leading-relaxed`}>
                      {recommendation.strategy}
                    </p>
                    
                    {recommendation.focus_areas && recommendation.focus_areas.length > 0 && (
                      <div className="mb-3">
                        <h4 className={`text-sm font-medium ${styles.text} mb-2`}>Focus Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.focus_areas.map((area: string, areaIndex: number) => (
                            <span key={areaIndex} className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {recommendation.business_impact && (
                      <div className={`mt-3 pt-3 border-t border-white border-opacity-40`}>
                        <p className={`text-sm ${styles.text} font-medium`}>
                          <span className="opacity-75">Expected Impact:</span> {recommendation.business_impact}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Skills Analysis by Category - Enhanced with Collapsible and Context */}
      {skillTrends.skills_by_category && skillTrends.skills_by_category.length > 0 ? (
        <SkillsDemandAnalysis skillsByCategory={skillTrends.skills_by_category} />
      ) : (
        /* Fallback to old view if categories not available */
        skillTrends.top_skills && skillTrends.top_skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Skills Demand Ranking</h2>
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <div className="space-y-3">
                {skillTrends.top_skills.slice(0, 20).map((skill: any, index: number) => (
                  <div key={skill.skill || index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 text-sm font-medium text-gray-500">
                      {index + 1}
                    </div>
                    <div className="flex-shrink-0 w-32 text-sm font-medium text-gray-900 truncate">
                      {skill.skill}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative min-w-0">
                      {/* Inline style necessary for dynamic progress bar width based on skill.percentage data */}
                      <div 
                        className="bg-blue-500 h-6 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(2, skill.percentage)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {skill.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-16 text-xs text-gray-500 text-right">
                      {skill.demand} jobs
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {skillTrends.top_skills[0]?.percentage || 0}%
                    </div>
                    <div className="text-xs text-gray-600">Top Skill Demand</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round(skillTrends.top_skills.slice(0, 5).reduce((sum: number, skill: any) => sum + (skill.percentage || 0), 0) / 5) || 0}%
                    </div>
                    <div className="text-xs text-gray-600">Top 5 Average</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {skillTrends.top_skills.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Skills Identified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Skill Combinations Analysis */}
      {skillTrends.skill_combinations && skillTrends.skill_combinations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Top Skill Combinations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('skill-combos', JSON.stringify(skillTrends.skill_combinations, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'skill-combos' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="space-y-3">
              {skillTrends.skill_combinations.slice(0, 10).map((combo: any, index: number) => (
                <div key={combo.combination} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 text-sm font-medium text-gray-500">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {combo.combination}
                    </div>
                    <div className="text-xs text-gray-600">
                      {combo.frequency} jobs • {combo.percentage}% of analyzed positions
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {combo.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {skillTrends.skill_combinations.length > 10 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    +{skillTrends.skill_combinations.length - 10} more combinations available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Depth Summary - Compact */}
      {analysisData.technical_depth_summary && Object.keys(analysisData.technical_depth_summary).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Technical Depth Analysis</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('tech-depth', JSON.stringify(analysisData.technical_depth_summary, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'tech-depth' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-900">
                  {analysisData.technical_depth_summary.hard_skills_percentage || 0}%
                </div>
                <div className="text-xs text-blue-700">Technical</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-900">
                  {analysisData.technical_depth_summary.soft_skills_percentage || 0}%
                </div>
                <div className="text-xs text-purple-700">Soft Skills</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-900">
                  {analysisData.technical_depth_summary.skills_with_certifications || 0}
                </div>
                <div className="text-xs text-yellow-700">Certs</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-900">
                  {analysisData.technical_depth_summary.total_skills_analyzed || 0}
                </div>
                <div className="text-xs text-green-700">Total</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certification Landscape - Enhanced UI */}
      {analysisData.certification_landscape && analysisData.certification_landscape.total_certifications_mentioned > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Certification Landscape</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('certifications', JSON.stringify(analysisData.certification_landscape, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'certifications' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="space-y-3">
            {(() => {
              const INITIAL_DISPLAY_COUNT = 8;
              const categories = [
                {
                  key: 'most_requested',
                  title: 'Most Requested Certifications',
                  data: analysisData.certification_landscape.most_requested,
                  colorClasses: 'bg-blue-50 text-blue-700 border-blue-200',
                  count: analysisData.certification_landscape.most_requested?.length || 0
                },
                {
                  key: 'high_value',
                  title: 'High-Value Certifications',
                  data: analysisData.certification_landscape.high_value,
                  colorClasses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  count: analysisData.certification_landscape.high_value?.length || 0
                },
                {
                  key: 'emerging',
                  title: 'Emerging Certifications',
                  data: analysisData.certification_landscape.emerging,
                  colorClasses: 'bg-green-50 text-green-700 border-green-200',
                  count: analysisData.certification_landscape.emerging?.length || 0
                }
              ].filter(category => category.data && category.data.length > 0);

              return categories.map((category) => {
                const isExpanded = expandedCertCategories[category.key] ?? true;
                const showAll = showAllCerts[category.key] ?? false;
                const displayCerts = showAll ? category.data : category.data.slice(0, INITIAL_DISPLAY_COUNT);
                const hasMore = category.data.length > INITIAL_DISPLAY_COUNT;

                return (
                  <div key={category.key} className="bg-white border border-gray-100 rounded-lg">
                    {/* Category Header - Clickable */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCertCategory(category.key)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {category.count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Certifications in Category - Collapsible */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {displayCerts.map((cert: string, index: number) => (
                            <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium border ${category.colorClasses}`}>
                              {cert}
                            </span>
                          ))}
                        </div>
                        
                        {/* Show More/Less Toggle */}
                        {hasMore && (
                          <div className="flex justify-center pt-2 border-t border-gray-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleShowAllCerts(category.key);
                              }}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                              {showAll ? (
                                <>
                                  Show Less
                                  <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  Show {category.data.length - INITIAL_DISPLAY_COUNT} More Certifications
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Market Opportunities - Structured JSON Rendering */}
      {(request as any)?.structured_insights?.market_opportunities && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Market Opportunities</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('opportunities', JSON.stringify((request as any).structured_insights.market_opportunities, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'opportunities' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="space-y-6">
              {/* Skill Gaps */}
              {(request as any).structured_insights.market_opportunities.skill_gaps && (request as any).structured_insights.market_opportunities.skill_gaps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Skill Gaps
                  </h3>
                  <div className="space-y-2">
                    {(request as any).structured_insights.market_opportunities.skill_gaps.map((gap: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emerging Trends */}
              {(request as any).structured_insights.market_opportunities.emerging_trends && (request as any).structured_insights.market_opportunities.emerging_trends.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Emerging Trends
                  </h3>
                  <div className="space-y-2">
                    {(request as any).structured_insights.market_opportunities.emerging_trends.map((trend: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Advantages */}
              {(request as any).structured_insights.market_opportunities.competitive_advantages && (request as any).structured_insights.market_opportunities.competitive_advantages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Competitive Advantages
                  </h3>
                  <div className="space-y-2">
                    {(request as any).structured_insights.market_opportunities.competitive_advantages.map((advantage: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiring Insights */}
              {(request as any).structured_insights.market_opportunities.hiring_insights && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Hiring Insights
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {(request as any).structured_insights.market_opportunities.hiring_insights}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Experience Level Distribution - Compact */}
      {skillTrends.experience_distribution && Object.keys(skillTrends.experience_distribution).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Experience Requirements</h2>
          <div className="bg-white border border-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-4">
              {/* Mini Donut Chart */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {(() => {
                  const entries = Object.entries(skillTrends.experience_distribution);
                  const total = entries.reduce((sum, [, count]) => sum + (count as number), 0);
                  let currentAngle = 0;
                  
                  const colors = {
                    'Entry': '#10B981', 'Junior': '#10B981',
                    'Mid': '#F59E0B', 
                    'Senior': '#EF4444', 'Lead': '#EF4444', 'Principal': '#EF4444'
                  };
                  
                  return (
                    <>
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                        {entries.map(([level, count], index) => {
                          const percentage = (count as number) / total;
                          const angle = percentage * 360;
                          const radius = 35;
                          const circumference = 2 * Math.PI * radius;
                          const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
                          const strokeDashoffset = -currentAngle / 360 * circumference;
                          
                          const color = colors[level as keyof typeof colors] || '#6B7280';
                          currentAngle += angle;
                          
                          return (
                            <circle
                              key={level}
                              cx="50" cy="50" r={radius}
                              fill="none" stroke={color} strokeWidth="12"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-sm font-bold text-gray-900">{total}</div>
                        <div className="text-xs text-gray-600">Jobs</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {/* Compact Legend */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                {Object.entries(skillTrends.experience_distribution).map(([level, count]) => {
                  const total = Object.values(skillTrends.experience_distribution).reduce((a: any, b: any) => a + b, 0);
                  const percentage = Math.round(((count as any) / total) * 100);
                  const isAbundant = percentage > 50;
                  const isModerate = percentage > 20;
                  const dotColor = isAbundant ? 'bg-green-500' : isModerate ? 'bg-yellow-500' : 'bg-red-500';
                  
                  return (
                    <div key={level} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-900 truncate">{level}</span>
                          <span className="text-xs font-medium text-gray-600">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}