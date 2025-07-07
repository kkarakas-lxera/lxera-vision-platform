import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Star, Trophy, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGameMetrics } from '@/hooks/useGameAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const MetricCard = ({ title, value, change, trend, icon: Icon, color = 'blue' }: MetricCardProps) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
    orange: 'border-orange-200 bg-orange-50/50',
    red: 'border-red-200 bg-red-50/50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600', 
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  const trendIcons = {
    up: <TrendingUp className="h-3 w-3 text-green-600" />,
    down: <TrendingDown className="h-3 w-3 text-red-600" />,
    neutral: <Minus className="h-3 w-3 text-gray-400" />
  };

  return (
    <Card className={`${colorClasses[color]} border-2 hover:shadow-lg transition-all duration-200`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-6 w-6 ${iconColors[color]}`} />
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {trend && trendIcons[trend]}
              <span className="text-sm text-muted-foreground font-medium">{change}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MetricsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map(i => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const MetricsOverview = () => {
  const { data: metrics, isLoading } = useGameMetrics();

  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No gamification data available yet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Players"
        value={metrics.activePlayers}
        change={`${metrics.playerGrowth > 0 ? '+' : ''}${metrics.playerGrowth}% this week`}
        trend={metrics.playerGrowth > 0 ? 'up' : metrics.playerGrowth < 0 ? 'down' : 'neutral'}
        icon={Users}
        color="blue"
      />
      <MetricCard
        title="Average Level"
        value={metrics.averageLevel.toFixed(1)}
        change={`${metrics.levelGrowth > 0 ? '+' : ''}${metrics.levelGrowth} this week`}
        trend={metrics.levelGrowth > 0 ? 'up' : 'neutral'}
        icon={Star}
        color="green"
      />
      <MetricCard
        title="Total Points"
        value={metrics.totalPoints.toLocaleString()}
        change={`+${metrics.pointsGrowth.toLocaleString()} this week`}
        trend="up"
        icon={Trophy}
        color="orange"
      />
      <MetricCard
        title="Completion Rate"
        value={`${Math.round(metrics.completionRate)}%`}
        change={`${metrics.completionGrowth > 0 ? '+' : ''}${metrics.completionGrowth}% this week`}
        trend={metrics.completionGrowth > 0 ? 'up' : 'down'}
        icon={Target}
        color={metrics.completionRate >= 80 ? 'green' : metrics.completionRate >= 60 ? 'orange' : 'red'}
      />
    </div>
  );
};