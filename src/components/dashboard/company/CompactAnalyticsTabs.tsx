import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown,
  ExternalLink 
} from 'lucide-react';
import SkillsTrendsView from '@/components/dashboard/skills/SkillsTrendsView';
import MarketIntelligenceSection from '@/components/dashboard/company/MarketIntelligenceSection';
import { TrendingSkill } from '@/components/ui/RadarChart';

interface SkillMomentum {
  skill: string;
  currentAvg: number;
  previousAvg: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
  affectedEmployees: number;
}

interface HistoricalDataPoint {
  date: string;
  organization: number;
  departments: Record<string, number>;
  positions: Record<string, number>;
  critical_gaps: number;
  moderate_gaps: number;
}

interface TopRisk {
  position: string;
  coverage: number;
  employeesInPosition: number;
}

interface CompactAnalyticsTabsProps {
  skillsTrendsData: {
    historicalData: HistoricalDataPoint[];
    skillsMomentum: SkillMomentum[];
    isLoading: boolean;
  };
  marketIntelligenceData: {
    trendingSkills: TrendingSkill[];
    marketData: any;
  };
  topRisks: TopRisk[];
  onNavigate: (path: string) => void;
}

const CompactAnalyticsTabs: React.FC<CompactAnalyticsTabsProps> = ({
  skillsTrendsData,
  marketIntelligenceData,
  topRisks,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'market' | 'risks'>('skills');

  // Get top improving and declining skills for quick view
  const improvingSkills = skillsTrendsData.skillsMomentum
    .filter(s => s.direction === 'up')
    .slice(0, 3);
  const decliningSkills = skillsTrendsData.skillsMomentum
    .filter(s => s.direction === 'down')
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      {/* Compact Tab Header with Stats */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analytics Overview
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              <span>{improvingSkills.length} improving</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-red-500" />
              <span>{decliningSkills.length} declining</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              <span>{topRisks.length} at risk</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger 
                value="skills" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                <TrendingUp className="h-4 w-4" />
                Skills Progress
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                <BarChart3 className="h-4 w-4" />
                Market Intelligence
              </TabsTrigger>
              <TabsTrigger 
                value="risks" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                <AlertTriangle className="h-4 w-4" />
                Risk Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <CardContent className="p-0">
        {activeTab === 'skills' && (
          <div className="p-4">
            <SkillsTrendsView
              historicalData={skillsTrendsData.historicalData}
              skillsMomentum={skillsTrendsData.skillsMomentum}
              isLoading={skillsTrendsData.isLoading}
            />
          </div>
        )}

        {activeTab === 'market' && (
          <div className="p-4">
            <MarketIntelligenceSection
              trendingSkills={marketIntelligenceData.trendingSkills}
              marketData={marketIntelligenceData.marketData}
            />
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Top Position Risks
              </h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('/dashboard/employees')}
                className="flex items-center gap-1"
              >
                View All
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRisks.slice(0, 6).map((risk, index) => (
                <div 
                  key={risk.position} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                      {risk.position}
                    </h5>
                    <Badge 
                      variant={risk.coverage < 30 ? 'destructive' : risk.coverage < 60 ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {risk.coverage < 30 ? 'Critical' : risk.coverage < 60 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Skills Match:</span>
                      <span className={`font-medium ${
                        risk.coverage < 30 ? 'text-red-600' : 
                        risk.coverage < 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {risk.coverage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Employees:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {risk.employeesInPosition}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          risk.coverage < 30 ? 'bg-red-500' : 
                          risk.coverage < 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${risk.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {topRisks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No Risk Data Available</h4>
                <p className="text-sm">Complete employee analysis to see position risks.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactAnalyticsTabs;