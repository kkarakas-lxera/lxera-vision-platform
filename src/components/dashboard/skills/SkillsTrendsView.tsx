import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Users, Building2, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';

interface HistoricalDataPoint {
  date: string;
  organization: number;
  departments: Record<string, number>;
  positions: Record<string, number>;
  critical_gaps: number;
  moderate_gaps: number;
}

interface SkillMomentum {
  skill: string;
  currentAvg: number;
  previousAvg: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
  affectedEmployees: number;
}

interface SkillsTrendsViewProps {
  historicalData: HistoricalDataPoint[];
  skillsMomentum: SkillMomentum[];
  isLoading?: boolean;
}

const SkillsTrendsView: React.FC<SkillsTrendsViewProps> = ({
  historicalData,
  skillsMomentum,
  isLoading = false
}) => {
  const [trendView, setTrendView] = useState<'organization' | 'departments' | 'positions'>('organization');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('3m');

  // Filter data based on time range
  const getFilteredData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return historicalData.filter(point => new Date(point.date) >= cutoffDate);
  };

  // Prepare chart data based on view
  const getChartData = () => {
    const filtered = getFilteredData();
    
    switch (trendView) {
      case 'organization':
        return filtered.map(point => ({
          date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Organization Average': point.organization,
          'Critical Gaps': point.critical_gaps,
          'Moderate Gaps': point.moderate_gaps
        }));
      
      case 'departments':
        return filtered.map(point => {
          const formatted: any = {
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
          Object.entries(point.departments).forEach(([dept, value]) => {
            formatted[dept] = value;
          });
          return formatted;
        });
      
      case 'positions':
        return filtered.map(point => {
          const formatted: any = {
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
          Object.entries(point.positions).slice(0, 5).forEach(([pos, value]) => {
            formatted[pos] = value;
          });
          return formatted;
        });
    }
  };

  // Get trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Split momentum into improving and declining
  const improvingSkills = skillsMomentum.filter(s => s.direction === 'up').slice(0, 5);
  const decliningSkills = skillsMomentum.filter(s => s.direction === 'down').slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();
  const chartKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'date') : [];

  // Define colors for lines
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Progress Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skills Progress Over Time</CardTitle>
              <CardDescription>
                Track improvement trends across different organizational levels
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as any)}>
                <ToggleGroupItem value="3m" size="sm">
                  3M
                </ToggleGroupItem>
                <ToggleGroupItem value="6m" size="sm">
                  6M
                </ToggleGroupItem>
                <ToggleGroupItem value="1y" size="sm">
                  1Y
                </ToggleGroupItem>
              </ToggleGroup>

              {/* View Selector */}
              <ToggleGroup type="single" value={trendView} onValueChange={(value) => value && setTrendView(value as any)}>
                <ToggleGroupItem value="organization" size="sm">
                  <Building2 className="h-4 w-4 mr-1" />
                  Org
                </ToggleGroupItem>
                <ToggleGroupItem value="departments" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Dept
                </ToggleGroupItem>
                <ToggleGroupItem value="positions" size="sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Roles
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {trendView === 'organization' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Organization Average" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Critical Gaps" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Moderate Gaps" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend />
                  {chartKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No historical data available yet.</p>
                <p className="text-sm mt-2">Data will appear after multiple benchmark generations.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Improving Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
              Fastest Improving Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {improvingSkills.length > 0 ? (
                improvingSkills.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-green-700">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{skill.skill}</div>
                        <div className="text-sm text-gray-600">
                          {skill.affectedEmployees} employees improving
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        +{skill.change.toFixed(1)} pts
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">
                        {skill.previousAvg.toFixed(1)} → {skill.currentAvg.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No improving skills detected yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Declining Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-600" />
              Skills Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {decliningSkills.length > 0 ? (
                decliningSkills.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-red-700">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{skill.skill}</div>
                        <div className="text-sm text-gray-600">
                          {skill.affectedEmployees} employees affected
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                        {skill.change.toFixed(1)} pts
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">
                        {skill.previousAvg.toFixed(1)} → {skill.currentAvg.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No declining skills detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillsTrendsView;