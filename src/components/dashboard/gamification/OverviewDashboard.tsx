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
                    <div className="font-medium">Player {player.employee_id.slice(0, 8)}</div>
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

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {missionData?.categoryStats.map((category) => (
              <div key={category.name} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <span className="text-lg">{category.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.mission_count} missions
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">{category.completion_rate}%</span>
                  </div>
                  <Progress value={category.completion_rate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg Accuracy: {category.avg_accuracy}%</span>
                    <span>Avg Time: {category.avg_time}m</span>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground col-span-4 text-center py-4">
                No mission data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Segments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Player Engagement Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">High Performers</h3>
                  <p className="text-sm text-green-600">
                    >80% accuracy, >10 missions/week
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-800">
                  {playerData?.segments.high.count || 0}
                </div>
                <div className="text-sm text-green-600">
                  {playerData?.segments.high.percentage || 0}% of all players
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Regular Players</h3>
                  <p className="text-sm text-blue-600">
                    50-80% accuracy, 5-10 missions/week
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-800">
                  {playerData?.segments.regular.count || 0}
                </div>
                <div className="text-sm text-blue-600">
                  {playerData?.segments.regular.percentage || 0}% of all players
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Beginners</h3>
                  <p className="text-sm text-orange-600">
                    <50% accuracy, <5 missions/week
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-800">
                  {playerData?.segments.beginner.count || 0}
                </div>
                <div className="text-sm text-orange-600">
                  {playerData?.segments.beginner.percentage || 0}% of all players
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};