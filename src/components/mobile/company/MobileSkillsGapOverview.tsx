import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Download,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MobileSkillsGapCard } from './MobileSkillsGapCard';
import { MobilePositionSkillsCarousel } from './MobilePositionSkillsCarousel';
import { MobileEmptyState } from './MobileEmptyState';
import { MobileProgressBar } from './MobileProgressBar';
import { cn } from '@/lib/utils';

interface SkillGap {
  skill_name: string;
  skill_type: string;
  required_level: string;
  current_level: string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
}

interface PositionAnalysis {
  position_title: string;
  position_code: string;
  total_employees: number;
  avg_gap_score: number;
  critical_gaps: number;
  top_gaps: SkillGap[];
}

interface MobileSkillsGapOverviewProps {
  positions: PositionAnalysis[];
  topSkillGaps: SkillGap[];
  totalEmployees: number;
  analyzedEmployees: number;
  onExportReport?: () => void;
  onPositionSelect?: (position: PositionAnalysis) => void;
  isLoading?: boolean;
}

export const MobileSkillsGapOverview: React.FC<MobileSkillsGapOverviewProps> = ({
  positions,
  topSkillGaps,
  totalEmployees,
  analyzedEmployees,
  onExportReport,
  onPositionSelect,
  isLoading = false
}) => {
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'important' | 'minor'>('all');

  const totalCriticalGaps = positions.reduce((sum, pos) => sum + pos.critical_gaps, 0);
  const averageMatchScore = positions.length > 0 
    ? Math.round(positions.reduce((sum, pos) => sum + pos.avg_gap_score, 0) / positions.length)
    : 0;

  const filteredGaps = selectedSeverity === 'all' 
    ? topSkillGaps 
    : topSkillGaps.filter(gap => gap.gap_severity === selectedSeverity);

  const displayedGaps = showAllGaps ? filteredGaps : filteredGaps.slice(0, 5);

  const getSeverityCount = (severity: 'critical' | 'important' | 'minor') => {
    return topSkillGaps.filter(gap => gap.gap_severity === severity).length;
  };

  if (isLoading) {
    return (
      <MobileEmptyState 
        type="loading" 
        title="Analyzing Skills Data"
        description="Please wait while we process employee skills and identify gaps."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Skills Gap Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {analyzedEmployees} of {totalEmployees} employees analyzed
              </p>
            </div>
            {onExportReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportReport}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Match</p>
                <p className="text-xl font-bold text-blue-600">{averageMatchScore}%</p>
              </div>
            </div>
            <div className="mt-2">
              <MobileProgressBar
                value={averageMatchScore}
                size="sm"
                showValue={false}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Gaps</p>
                <p className="text-xl font-bold text-red-600">{totalCriticalGaps}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Across {positions.length} positions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Skills Carousel */}
      {positions.length > 0 ? (
        <MobilePositionSkillsCarousel
          positions={positions}
          onPositionSelect={onPositionSelect}
        />
      ) : (
        <MobileEmptyState
          type="no-analysis"
          title="No Position Analysis"
          description="Import employees and analyze their CVs to see skills gaps."
        />
      )}

      {/* Top Skill Gaps */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Top Skill Gaps</CardTitle>
            <div className="flex items-center gap-2">
              {/* Severity Filter */}
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity('all')}
                  className="h-7 px-2 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={selectedSeverity === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity('critical')}
                  className="h-7 px-2 text-xs"
                >
                  Critical ({getSeverityCount('critical')})
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGaps.length > 0 ? (
            <div className="space-y-3">
              {displayedGaps.map((gap, index) => (
                <MobileSkillsGapCard
                  key={`${gap.skill_name}-${index}`}
                  gap={gap}
                  totalEmployees={totalEmployees}
                  rank={index + 1}
                  isExpanded={expandedGap === `${gap.skill_name}-${index}`}
                  onToggleExpand={() => {
                    setExpandedGap(
                      expandedGap === `${gap.skill_name}-${index}` 
                        ? null 
                        : `${gap.skill_name}-${index}`
                    );
                  }}
                />
              ))}
              
              {/* Show More/Less Controls */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {filteredGaps.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllGaps(!showAllGaps)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {showAllGaps ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Show {filteredGaps.length - 5} More
                      </>
                    )}
                  </Button>
                )}
                
                {onExportReport && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExportReport}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    Export Report
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <MobileEmptyState
              type="no-skills"
              title="No Skill Gaps Found"
              description={
                selectedSeverity === 'all' 
                  ? "All employees meet position requirements or analysis is pending."
                  : `No ${selectedSeverity} skill gaps found.`
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Gaps</p>
              <p className="text-lg font-semibold">{topSkillGaps.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Positions</p>
              <p className="text-lg font-semibold">{positions.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Employees</p>
              <p className="text-lg font-semibold">{analyzedEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};