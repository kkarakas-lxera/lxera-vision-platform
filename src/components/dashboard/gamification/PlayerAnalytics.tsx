import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Star, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePlayerAnalytics } from '@/hooks/useGameAnalytics';

export const PlayerAnalytics = () => {
  const { data: players, isLoading } = usePlayerAnalytics();

  if (isLoading) {
    return <div>Loading player analytics...</div>;
  }

  if (!players) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No player data available yet. Players need to start playing missions to see analytics!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPlayers = players.segments.high.count + players.segments.regular.count + players.segments.beginner.count;

  return (
    <div className="space-y-6">
      {/* Player Segments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border border-green-200 bg-green-50/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800">High Performers</h3>
                <p className="text-xs text-green-600">
                  &gt;80% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-green-800">
                {players.segments.high.count}
              </div>
              <div className="text-xs text-green-600">
                {players.segments.high.percentage}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800">Regular Players</h3>
                <p className="text-xs text-blue-600">
                  50-80% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-blue-800">
                {players.segments.regular.count}
              </div>
              <div className="text-xs text-blue-600">
                {players.segments.regular.percentage}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-800">Beginners</h3>
                <p className="text-xs text-orange-600">
                  &lt;50% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-orange-800">
                {players.segments.beginner.count}
              </div>
              <div className="text-xs text-orange-600">
                {players.segments.beginner.percentage}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {players.levelDistribution.some(level => level.player_count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={players.levelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level_range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="player_count" fill="#89baef" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No level progression data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.topPerformers.length > 0 ? (
            <div className="space-y-3">
              {players.topPerformers.map((player, index) => (
                <div key={player.employee_id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{player.employee_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Lvl {player.current_level}
                      {player.current_streak > 0 && (
                        <span className="ml-1">• {player.current_streak}d 🔥</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{player.total_points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.accuracy}%
                    </div>
                  </div>
                  {index < 3 && (
                    <span className="text-sm">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No player performance data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Alerts */}
      {totalPlayers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Engagement Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {players.segments.beginner.percentage > 50 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High beginner population:</strong> {players.segments.beginner.percentage}% of players are beginners. 
                    Consider adding more onboarding content or easier missions.
                  </AlertDescription>
                </Alert>
              )}
              
              {players.segments.high.percentage < 20 && totalPlayers > 5 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low high performer rate:</strong> Only {players.segments.high.percentage}% are high performers. 
                    Review mission difficulty and provide more engaging challenges.
                  </AlertDescription>
                </Alert>
              )}

              {players.topPerformers.filter(p => p.current_streak === 0).length > players.topPerformers.length * 0.7 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low streak activity:</strong> Most top performers have no active streaks. 
                    Consider daily challenge mechanics to improve retention.
                  </AlertDescription>
                </Alert>
              )}

              {totalPlayers > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">📊 Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Active Players:</span>
                      <span className="font-medium ml-2">{totalPlayers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Level:</span>
                      <span className="font-medium ml-2">
                        {players.topPerformers.length > 0 
                          ? (players.topPerformers.reduce((sum, p) => sum + p.current_level, 0) / players.topPerformers.length).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Points:</span>
                      <span className="font-medium ml-2">
                        {players.topPerformers.reduce((sum, p) => sum + p.total_points, 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Streaks:</span>
                      <span className="font-medium ml-2">
                        {players.topPerformers.filter(p => p.current_streak > 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};