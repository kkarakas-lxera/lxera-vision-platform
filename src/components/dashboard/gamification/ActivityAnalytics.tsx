import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Flame, Award, Activity, CheckCircle, Star, Trophy } from 'lucide-react';
import { useActivityAnalytics } from '@/hooks/useGameAnalytics';

export const ActivityAnalytics = () => {
  const { data: activity, isLoading } = useActivityAnalytics();

  if (isLoading) {
    return <div>Loading activity analytics...</div>;
  }

  if (!activity) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No activity data available yet. Start playing to see your activity analytics!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'level_up': return <Star className="h-4 w-4 text-green-600" />;
      case 'mission_complete': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Play className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100';
      case 'level_up': return 'bg-green-100';
      case 'mission_complete': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Sessions Today</span>
            </div>
            <div className="text-2xl font-bold">{activity.todaySessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold">{activity.avgDuration}m</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Active Streaks</span>
            </div>
            <div className="text-2xl font-bold">{activity.activeStreaks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Achievements</span>
            </div>
            <div className="text-2xl font-bold">{activity.todayAchievements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Puzzle Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Puzzle Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activity.puzzleProgress.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activity.puzzleProgress.map((puzzle) => (
                <div key={puzzle.category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{puzzle.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{puzzle.category}</h4>
                      <p className="text-xs text-muted-foreground">
                        {puzzle.pieces_unlocked}/{puzzle.total_pieces}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={puzzle.completion_percentage} className="h-1.5" />
                    <div className="text-xs text-muted-foreground text-right">
                      {puzzle.completion_percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No puzzle progress data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {activity.recentActivity.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${getActivityBgColor(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                  {item.points && (
                    <Badge variant="outline" className="text-xs">
                      +{item.points} pts
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent activity to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Engagement Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Activity</span>
                  <span className="font-medium">
                    {activity.todaySessions > 0 ? 'Active' : 'No activity'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Focus Time</span>
                  <span className="font-medium">{activity.avgDuration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Streaks Maintained</span>
                  <span className="font-medium">{activity.activeStreaks} players</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Achievement Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Achievements Unlocked</span>
                  <span className="font-medium">{activity.todayAchievements}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Puzzle Pieces Earned</span>
                  <span className="font-medium">
                    {activity.puzzleProgress.reduce((sum, p) => sum + p.pieces_unlocked, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">
                    {activity.puzzleProgress.length > 0 
                      ? Math.round(activity.puzzleProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / activity.puzzleProgress.length)
                      : 0
                    }% avg
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {activity.todaySessions === 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>No activity today:</strong> Encourage players to start missions to maintain engagement and streaks!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};