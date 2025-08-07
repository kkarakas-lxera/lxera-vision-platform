import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  value, 
  label, 
  trend, 
  trendType = 'neutral',
  description 
}) => {
  const getTrendIcon = () => {
    switch (trendType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">{trend}</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface SkillsMetricCardsProps {
  averageMatch: number;
  criticalGaps: number;
  topGap: string | null;
  fastestGrowing: string | null;
  previousMatch?: number;
  previousGaps?: number;
}

export const SkillsMetricCards: React.FC<SkillsMetricCardsProps> = ({
  averageMatch,
  criticalGaps,
  topGap,
  fastestGrowing,
  previousMatch,
  previousGaps
}) => {
  // Calculate trends
  const matchTrend = previousMatch 
    ? `${averageMatch > previousMatch ? '+' : ''}${(averageMatch - previousMatch).toFixed(1)}%`
    : undefined;
  
  const gapsTrend = previousGaps !== undefined
    ? `${criticalGaps > previousGaps ? '+' : ''}${criticalGaps - previousGaps}`
    : undefined;

  const matchTrendType = previousMatch 
    ? averageMatch > previousMatch ? 'positive' : averageMatch < previousMatch ? 'negative' : 'neutral'
    : 'neutral';

  // For gaps, lower is better
  const gapsTrendType = previousGaps !== undefined
    ? criticalGaps < previousGaps ? 'positive' : criticalGaps > previousGaps ? 'negative' : 'neutral'
    : 'neutral';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        value={`${averageMatch}%`}
        label="Average Skills Match"
        trend={matchTrend}
        trendType={matchTrendType}
        description="Organization-wide average"
      />
      <MetricCard
        value={criticalGaps}
        label="Critical Gaps"
        trend={gapsTrend}
        trendType={gapsTrendType}
        description="Skills needing immediate attention"
      />
      <MetricCard
        value={topGap || 'None'}
        label="Top Missing Skill"
        description="Most common gap across teams"
      />
      <MetricCard
        value={fastestGrowing || 'None'}
        label="Fastest Improving"
        trendType="positive"
        description="Skill with highest growth rate"
      />
    </div>
  );
};

export default SkillsMetricCards;