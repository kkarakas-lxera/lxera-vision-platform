import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, AlertCircle } from 'lucide-react';
import { useMissionAnalytics, type MissionData } from '@/hooks/useGameAnalytics';

export const MissionAnalytics = () => {
  const { data: missions, isLoading } = useMissionAnalytics();

  if (isLoading) {
    return <div>Loading mission analytics...</div>;
  }

  if (!missions) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No mission data available yet. Start playing missions to see analytics!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const getPerformanceColor = (value: number, threshold1: number, threshold2: number) => {
    if (value >= threshold1) return 'text-green-600';
    if (value >= threshold2) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Category Performance Cards - Minimalistic Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Category Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {missions.categoryStats.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{category.emoji}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {category.mission_count} missions
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Progress value={category.completion_rate} className="h-1.5 flex-1 mr-2" />
                    <span className="text-xs font-medium w-10 text-right">{category.completion_rate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Accuracy: {category.avg_accuracy}%</span>
                    <span>Avg: {category.avg_time}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mission Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mission Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {missions.missionData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-sm">Mission</th>
                    <th className="text-center py-2 font-medium text-sm">Plays</th>
                    <th className="text-center py-2 font-medium text-sm">Completion %</th>
                    <th className="text-center py-2 font-medium text-sm">Accuracy %</th>
                    <th className="text-center py-2 font-medium text-sm">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.missionData
                    .sort((a, b) => b.play_count - a.play_count) // Sort by popularity
                    .map((mission) => (
                    <tr key={mission.mission_title} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="font-medium">{mission.mission_title}</div>
                            <div className="text-sm text-muted-foreground">
                              {mission.category} • 
                              <Badge 
                                variant={getDifficultyColor(mission.difficulty_level)}
                                className="ml-1 text-xs"
                              >
                                {mission.difficulty_level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <span className="font-mono text-sm">{mission.play_count}</span>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={mission.completion_rate} className="w-16 h-2" />
                          <span className="text-sm font-medium w-12">
                            {mission.completion_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            mission.avg_accuracy >= 80 ? 'bg-green-500' :
                            mission.avg_accuracy >= 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`} />
                          <span className={`font-mono text-sm ${
                            getPerformanceColor(mission.avg_accuracy, 80, 60)
                          }`}>
                            {mission.avg_accuracy}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <span className="font-mono text-sm">
                          {mission.avg_time_minutes.toFixed(1)}m
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No mission data available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mission Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Mission Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {missions.missionData.length > 0 ? (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">
                    <strong>Most Popular:</strong> {
                      missions.missionData.reduce((prev, current) => 
                        prev.play_count > current.play_count ? prev : current
                      ).mission_title
                    } with {
                      Math.max(...missions.missionData.map(m => m.play_count))
                    } plays
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <p className="text-sm">
                    <strong>Highest Accuracy:</strong> {
                      missions.missionData.reduce((prev, current) => 
                        prev.avg_accuracy > current.avg_accuracy ? prev : current
                      ).mission_title
                    } with {
                      Math.max(...missions.missionData.map(m => m.avg_accuracy))
                    }% accuracy
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm">
                    <strong>Average Session Time:</strong> {
                      (missions.missionData.reduce((sum, m) => sum + m.avg_time_minutes, 0) / 
                       missions.missionData.length).toFixed(1)
                    } minutes across all missions
                  </p>
                </div>
                {missions.missionData.some(m => m.avg_time_minutes > 15) && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm">
                      <strong>⚠️ Long missions:</strong> {
                        missions.missionData.filter(m => m.avg_time_minutes > 15).length
                      } missions take over 15 minutes on average - consider breaking them down
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start playing missions to see insights and recommendations!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};