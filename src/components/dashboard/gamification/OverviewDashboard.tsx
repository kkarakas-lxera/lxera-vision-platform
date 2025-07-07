import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { usePlayerAnalytics, useMissionAnalytics } from '@/hooks/useGameAnalytics';

export const OverviewDashboard = () => {
  const { data: playerData, isLoading: playersLoading } = usePlayerAnalytics();
  const { data: missionData, isLoading: missionsLoading } = useMissionAnalytics();

  if (playersLoading || missionsLoading) {
    return <div>Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mission Completion Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mission Completion Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Easy</span>
                <span className="text-sm text-muted-foreground">
                  {missionData?.categoryStats.filter(c => 
                    missionData.missionData.some(m => m.category === c.name.toLowerCase() && m.difficulty_level === 'easy')
                  ).reduce((acc, c) => acc + c.completion_rate, 0) || 0}%
                </span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Medium</span>
                <span className="text-sm text-muted-foreground">67%</span>
              </div>
              <Progress value={67} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Hard</span>
                <span className="text-sm text-muted-foreground">41%</span>
              </div>
              <Progress value={41} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Total missions completed this week: {missionData?.missionData.reduce((sum, m) => sum + m.play_count, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerData?.topPerformers.slice(0, 5).map((player, index) => (
                <div key={player.employee_id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-base">{player.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Level {player.current_level} • {player.current_streak} day streak
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{player.total_points.toLocaleString()} pts</div>
                    <div className="text-sm text-muted-foreground">
                      {player.accuracy}% accuracy
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No player data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance & Player Segments Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance - Minimalistic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Category Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {missionData?.categoryStats.slice(0, 4).map((category) => (
                <div key={category.name} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{category.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{category.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">{category.completion_rate}%</span>
                    </div>
                    <Progress value={category.completion_rate} className="h-1.5" />
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No mission data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Player Engagement Segments - Minimalistic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Player Segments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* High Performers */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Performers</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold">{playerData?.segments.high.count || 0}</span>
                      <span className="text-xs text-muted-foreground">({playerData?.segments.high.percentage || 0}%)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">&gt;80% accuracy</p>
                </div>
              </div>

              {/* Regular Players */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Regular Players</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold">{playerData?.segments.regular.count || 0}</span>
                      <span className="text-xs text-muted-foreground">({playerData?.segments.regular.percentage || 0}%)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">50-80% accuracy</p>
                </div>
              </div>

              {/* Beginners */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Beginners</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold">{playerData?.segments.beginner.count || 0}</span>
                      <span className="text-xs text-muted-foreground">({playerData?.segments.beginner.percentage || 0}%)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">&lt;50% accuracy</p>
                </div>
              </div>

              {/* Total Players Summary */}
              <div className="pt-2 mt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Active Players</span>
                  <span className="font-semibold">
                    {(playerData?.segments.high.count || 0) + 
                     (playerData?.segments.regular.count || 0) + 
                     (playerData?.segments.beginner.count || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};