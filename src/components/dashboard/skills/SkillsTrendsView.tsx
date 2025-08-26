import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Users, Building2, Briefcase, ArrowUp, ArrowDown, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'custom'>('3m');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Generate mock data for custom date range
  const generateMockDataForRange = (startDate: Date, endDate: Date): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate data points every few days based on range
    const interval = days > 90 ? 7 : days > 30 ? 3 : 1;
    
    for (let i = 0; i <= days; i += interval) {
      const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Generate realistic but mock trends
      const baseOrg = 65 + Math.sin(i / 10) * 5 + Math.random() * 10;
      const criticalGaps = Math.max(0, 15 - Math.sin(i / 15) * 3 + Math.random() * 5);
      const moderateGaps = Math.max(0, 25 - Math.sin(i / 12) * 4 + Math.random() * 6);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        organization: Math.round(baseOrg),
        departments: {
          'Engineering': Math.round(baseOrg + Math.random() * 15 - 7),
          'Marketing': Math.round(baseOrg + Math.random() * 12 - 6),
          'Sales': Math.round(baseOrg + Math.random() * 10 - 5),
          'HR': Math.round(baseOrg + Math.random() * 8 - 4)
        },
        positions: {
          'Software Engineer': Math.round(baseOrg + Math.random() * 20 - 10),
          'Product Manager': Math.round(baseOrg + Math.random() * 15 - 8),
          'Data Analyst': Math.round(baseOrg + Math.random() * 18 - 9),
          'UX Designer': Math.round(baseOrg + Math.random() * 12 - 6),
          'Marketing Specialist': Math.round(baseOrg + Math.random() * 10 - 5)
        },
        critical_gaps: Math.round(criticalGaps),
        moderate_gaps: Math.round(moderateGaps)
      });
    }
    
    return data;
  };

  // Filter data based on time range
  const getFilteredData = () => {
    // For custom range, generate mock data
    if (timeRange === 'custom' && dateRange.from && dateRange.to) {
      return generateMockDataForRange(dateRange.from, dateRange.to);
    }
    
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
          const formatted: Record<string, string | number> = {
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
          Object.entries(point.departments).forEach(([dept, value]) => {
            formatted[dept] = value;
          });
          return formatted;
        });
      
      case 'positions':
        return filtered.map(point => {
          const formatted: Record<string, string | number> = {
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
      {/* Progress Trends Chart - Compact Layout */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left side - Content and Controls */}
          <div className="lg:col-span-3 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50 border-r">
            <div className="space-y-3">
              <div>
                <CardTitle className="text-lg mb-1">Skills Progress Over Time</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Track improvement trends across organizational levels
                </CardDescription>
              </div>

              {/* Compact Controls */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Analysis View</div>
                <ToggleGroup 
                  type="single" 
                  value={trendView} 
                  onValueChange={(value) => value && setTrendView(value as 'organization' | 'departments' | 'positions')}
                  className="grid grid-cols-1 gap-1 w-full"
                >
                  <ToggleGroupItem value="organization" size="sm" className="justify-start h-8 text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    Organization
                  </ToggleGroupItem>
                  <ToggleGroupItem value="departments" size="sm" className="justify-start h-8 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Departments
                  </ToggleGroupItem>
                  <ToggleGroupItem value="positions" size="sm" className="justify-start h-8 text-xs">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Positions
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Time Range Selector */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Time Period</div>
                <ToggleGroup 
                  type="single" 
                  value={timeRange} 
                  onValueChange={(value) => value && setTimeRange(value as '3m' | '6m' | '1y' | 'custom')}
                  className="grid grid-cols-2 gap-1 w-full"
                >
                  <ToggleGroupItem value="3m" size="sm" className="h-7 text-xs">3M</ToggleGroupItem>
                  <ToggleGroupItem value="6m" size="sm" className="h-7 text-xs">6M</ToggleGroupItem>
                  <ToggleGroupItem value="1y" size="sm" className="h-7 text-xs">1Y</ToggleGroupItem>
                  <ToggleGroupItem value="custom" size="sm" className="h-7 text-xs">Custom</ToggleGroupItem>
                </ToggleGroup>

                {/* Custom Date Picker */}
                {timeRange === 'custom' && (
                  <div className="pt-2">
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Compact Stats */}
              {chartData.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Current Period</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {chartData.length} points
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trendView === 'organization' ? 'Org-wide' : 
                     trendView === 'departments' ? `${chartKeys.length} depts` : 
                     `${chartKeys.length} roles`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Chart */}
          <div className="lg:col-span-9 p-4">
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
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
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No historical data available yet.</p>
                    <p className="text-sm mt-2">Data will appear after multiple benchmark generations.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Momentum - Compact Design */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Improving Skills - Compact */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/60">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-800/40 rounded-md">
                  <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Fastest Improving Skills</CardTitle>
                  <p className="text-xs text-muted-foreground">Top performers</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-0">
                {improvingSkills.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-1">
              {improvingSkills.length > 0 ? (
                improvingSkills.map((skill, index) => (
                  <div key={skill.skill} className="group hover:bg-white/60 dark:hover:bg-gray-800/40 transition-colors duration-200 p-2 rounded-lg border border-transparent hover:border-green-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{skill.skill}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>{skill.affectedEmployees} emp</span>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">↗</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold text-green-700 dark:text-green-400">
                          +{skill.change.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.previousAvg.toFixed(0)}→{skill.currentAvg.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">No improving skills detected</p>
                  <p className="text-xs text-gray-400">Data will appear after analysis completion</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Declining Skills - Compact */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/60">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 dark:bg-red-800/40 rounded-md">
                  <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Skills Needing Attention</CardTitle>
                  <p className="text-xs text-muted-foreground">Areas requiring focus</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300 text-xs px-2 py-0">
                {decliningSkills.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-1">
              {decliningSkills.length > 0 ? (
                decliningSkills.map((skill, index) => (
                  <div key={skill.skill} className="group hover:bg-white/60 dark:hover:bg-gray-800/40 transition-colors duration-200 p-2 rounded-lg border border-transparent hover:border-red-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">{skill.skill}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>{skill.affectedEmployees} emp</span>
                            <span>•</span>
                            <span className="text-red-600 dark:text-red-400">↘</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold text-red-700 dark:text-red-400">
                          {skill.change.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.previousAvg.toFixed(0)}→{skill.currentAvg.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-3">
                    <TrendingDown className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">No declining skills detected</p>
                  <p className="text-xs text-gray-400">Great! All skills are stable or improving</p>
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