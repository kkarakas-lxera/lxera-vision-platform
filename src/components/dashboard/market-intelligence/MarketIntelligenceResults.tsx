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
  showHeader?: boolean;
}

export default function MarketIntelligenceResults({
  request,
  onExport,
  onDelete,
  showHeader = true
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

      {/* Skills Analysis by Category - Compact */}
      {skillTrends.skills_by_category && skillTrends.skills_by_category.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Skills Demand Analysis</h2>
          <div className="space-y-3">
            {skillTrends.skills_by_category.map((categoryData: any, categoryIndex: number) => (
              <div key={categoryData.category} className="bg-white border border-gray-100 rounded-lg p-3">
                {/* Category Header - Compact */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{categoryData.category}</h3>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {categoryData.total_percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {categoryData.skill_count} skills
                  </div>
                </div>
                
                {/* Skills in Category - Compact */}
                <div className="space-y-1">
                  {categoryData.skills.slice(0, 10).map((skill: any, skillIndex: number) => (
                    <div key={skill.skill} className="flex items-center gap-2">
                      {/* Skill Name */}
                      <div className="flex-shrink-0 w-32 text-xs font-medium text-gray-900 truncate">
                        {skill.skill}
                      </div>
                      
                      {/* Progress Bar - Smaller */}
                      <div className="flex-1 bg-gray-100 rounded-full h-3 relative min-w-0">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.max(2, skill.percentage)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-1">
                          <span className="text-xs font-medium text-white mix-blend-difference">
                            {skill.percentage}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Job Count */}
                      <div className="flex-shrink-0 w-12 text-xs text-gray-500 text-right">
                        {skill.demand}
                      </div>
                    </div>
                  ))}
                  {categoryData.skills.length > 10 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{categoryData.skills.length - 10} more skills
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Enhanced Skill Context Analysis - Compact */}
      {analysisData.enhanced_skill_analysis && analysisData.enhanced_skill_analysis.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Skill Context Intelligence</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopySection('skill-context', JSON.stringify(analysisData.enhanced_skill_analysis, null, 2))}
              className="text-gray-400 hover:text-gray-600"
            >
              {copiedSection === 'skill-context' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="space-y-2">
              {analysisData.enhanced_skill_analysis.slice(0, 25).map((skillData: any, index: number) => (
                <div key={skillData.skill || index} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-b-0">
                  {/* Skill Name & Type */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 truncate">{skillData.skill}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${
                        skillData.enhanced_data?.skill_type === 'hard' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {skillData.enhanced_data?.skill_type === 'hard' ? 'Tech' : 'Soft'}
                      </span>
                    </div>
                    
                    {/* Compact Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      {/* Experience */}
                      {skillData.enhanced_data?.experience_patterns?.years_mentioned?.length > 0 && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          Exp: {skillData.enhanced_data.experience_patterns.years_mentioned.slice(0, 2).join(', ')}
                        </span>
                      )}
                      
                      {/* Seniority */}
                      {skillData.enhanced_data?.experience_patterns?.seniority_levels?.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {skillData.enhanced_data.experience_patterns.seniority_levels.slice(0, 3).join(', ')}
                        </span>
                      )}
                      
                      {/* Tools */}
                      {skillData.enhanced_data?.tools?.length > 0 && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Tools: {skillData.enhanced_data.tools.slice(0, 2).join(', ')}
                        </span>
                      )}
                      
                      {/* Certifications */}
                      {skillData.enhanced_data?.certifications?.length > 0 && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          Certs: {skillData.enhanced_data.certifications.slice(0, 1).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Certification Landscape */}
      {analysisData.certification_landscape && analysisData.certification_landscape.total_certifications_mentioned > 0 && (
        <div className="space-y-4">
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
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="space-y-4">
              {/* Most Requested Certifications */}
              {analysisData.certification_landscape.most_requested && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Most Requested Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.certification_landscape.most_requested.map((cert: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* High Value Certifications */}
              {analysisData.certification_landscape.high_value && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">High-Value Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.certification_landscape.high_value.map((cert: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Emerging Certifications */}
              {analysisData.certification_landscape.emerging && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Emerging Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.certification_landscape.emerging.map((cert: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        {cert}
                      </span>
                    ))}
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