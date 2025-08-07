import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Info, Users, TrendingUp, TrendingDown, Minus, Filter, SortDesc, Building2, Briefcase, DollarSign, Stethoscope, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillLevel {
  position: string;
  skill: string;
  avgProficiency: number;
  employeeCount: number;
  employees: Array<{
    name: string;
    proficiency: number;
  }>;
  department?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

interface SkillsHeatmapViewProps {
  positionSkillsData: SkillLevel[][];
  positions: string[];
  skills: string[];
  isLoading?: boolean;
}

const SkillsHeatmapView: React.FC<SkillsHeatmapViewProps> = ({
  positionSkillsData,
  positions,
  skills,
  isLoading = false
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; data: SkillLevel } | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'developing' | 'proficient'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'gaps' | 'proficiency'>('name');
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'skills' | 'employees'>('skills');

  // Enhanced color scale with gradient intensity based on employee count
  const getColorForProficiency = (level: number, employeeCount: number): string => {
    // More employees = darker/more intense color
    const isHighCount = employeeCount > 5;
    
    if (level === 0) {
      return isHighCount 
        ? `bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg` 
        : `bg-gradient-to-br from-red-400 to-red-500 text-white`;
    } else if (level < 1) {
      return isHighCount
        ? `bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg`
        : `bg-gradient-to-br from-orange-400 to-orange-500 text-white`;
    } else if (level < 2) {
      return isHighCount
        ? `bg-gradient-to-br from-yellow-500 to-amber-600 text-gray-800 shadow-lg`
        : `bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-800`;
    } else if (level < 2.5) {
      return isHighCount
        ? `bg-gradient-to-br from-lime-500 to-lime-600 text-gray-800 shadow-lg`
        : `bg-gradient-to-br from-lime-400 to-lime-500 text-gray-800`;
    } else if (level < 3) {
      return isHighCount
        ? `bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg`
        : `bg-gradient-to-br from-green-400 to-green-500 text-white`;
    }
    return isHighCount
      ? `bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg`
      : `bg-gradient-to-br from-emerald-400 to-emerald-500 text-white`;
  };

  // Get department icon
  const getDepartmentIcon = (department?: string) => {
    const dept = department?.toLowerCase() || '';
    if (dept.includes('engineering') || dept.includes('tech')) return Briefcase;
    if (dept.includes('finance') || dept.includes('accounting')) return DollarSign;
    if (dept.includes('health') || dept.includes('medical')) return Stethoscope;
    if (dept.includes('education') || dept.includes('training')) return BookOpen;
    return Building2;
  };

  // Get proficiency label
  const getProficiencyLabel = (level: number): string => {
    if (level === 0) return 'None';
    if (level < 1) return 'Basic';
    if (level < 2) return 'Developing';
    if (level < 2.5) return 'Proficient';
    if (level < 3) return 'Advanced';
    return 'Expert';
  };

  // Group positions by department
  const groupedPositions = useMemo(() => {
    const groups: { [key: string]: string[] } = {};
    positions.forEach(position => {
      // Detect department from position name
      let dept = 'Other';
      const posLower = position.toLowerCase();
      if (posLower.includes('engineer') || posLower.includes('developer') || posLower.includes('tech')) {
        dept = 'Engineering';
      } else if (posLower.includes('marketing') || posLower.includes('brand')) {
        dept = 'Marketing';
      } else if (posLower.includes('sales') || posLower.includes('account')) {
        dept = 'Sales';
      } else if (posLower.includes('finance') || posLower.includes('accounting')) {
        dept = 'Finance';
      } else if (posLower.includes('hr') || posLower.includes('human') || posLower.includes('people')) {
        dept = 'Human Resources';
      } else if (posLower.includes('product') || posLower.includes('design')) {
        dept = 'Product';
      } else if (posLower.includes('health') || posLower.includes('medical') || posLower.includes('nurse')) {
        dept = 'Healthcare';
      }
      
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(position);
    });
    return groups;
  }, [positions]);

  // Filter and sort skills
  const processedData = useMemo(() => {
    let filteredData = [...positionSkillsData];
    
    // Apply filter
    if (filterLevel !== 'all') {
      filteredData = filteredData.map(row => 
        row.filter(cell => {
          if (filterLevel === 'critical') return cell.avgProficiency < 1;
          if (filterLevel === 'developing') return cell.avgProficiency >= 1 && cell.avgProficiency < 2;
          if (filterLevel === 'proficient') return cell.avgProficiency >= 2;
          return true;
        })
      );
    }

    // Apply sort
    if (sortBy === 'gaps') {
      // Sort skills by number of critical gaps
      const skillGaps = skills.map(skill => {
        const gaps = filteredData.reduce((acc, row) => {
          const cell = row.find(c => c.skill === skill);
          return acc + (cell && cell.avgProficiency < 1 ? 1 : 0);
        }, 0);
        return { skill, gaps };
      });
      skillGaps.sort((a, b) => b.gaps - a.gaps);
      return {
        data: filteredData,
        sortedSkills: skillGaps.map(s => s.skill)
      };
    } else if (sortBy === 'proficiency') {
      // Sort by average proficiency
      const skillAvgs = skills.map(skill => {
        const total = filteredData.reduce((acc, row) => {
          const cell = row.find(c => c.skill === skill);
          return acc + (cell ? cell.avgProficiency : 0);
        }, 0);
        return { skill, avg: total / filteredData.length };
      });
      skillAvgs.sort((a, b) => a.avg - b.avg);
      return {
        data: filteredData,
        sortedSkills: skillAvgs.map(s => s.skill)
      };
    }
    
    return {
      data: filteredData,
      sortedSkills: skills
    };
  }, [positionSkillsData, skills, filterLevel, sortBy]);

  const handleCellClick = (row: number, col: number) => {
    const cellData = processedData.data[row]?.[col];
    if (cellData) {
      setSelectedCell({ row, col, data: cellData });
      setDetailPanelOpen(true);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!positionSkillsData || positionSkillsData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No skills data available. Analyze employees to see the skills heatmap.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Controls Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('skills')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded transition-all",
                      viewMode === 'skills' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Skills View
                  </button>
                  <button
                    onClick={() => setViewMode('employees')}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded transition-all",
                      viewMode === 'employees' 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Employee View
                  </button>
                </div>

                <Select value={filterLevel} onValueChange={(value: any) => setFilterLevel(value)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical Gaps</SelectItem>
                    <SelectItem value="developing">Developing</SelectItem>
                    <SelectItem value="proficient">Proficient</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SortDesc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Alphabetical</SelectItem>
                    <SelectItem value="gaps">Most Critical First</SelectItem>
                    <SelectItem value="proficiency">Lowest Skills First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded shadow-sm"></div>
                  <span className="text-gray-600">0-0.9<br/>Critical</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded shadow-sm"></div>
                  <span className="text-gray-600">1.0-1.4<br/>Basic</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded shadow-sm"></div>
                  <span className="text-gray-600">1.5-1.9<br/>Developing</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-lime-500 rounded shadow-sm"></div>
                  <span className="text-gray-600">2.0-2.4<br/>Proficient</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded shadow-sm"></div>
                  <span className="text-gray-600">2.5-2.9<br/>Advanced</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded shadow-sm"></div>
                  <span className="text-gray-600">3.0<br/>Expert</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Heatmap */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Skills Distribution Matrix</CardTitle>
            <CardDescription>
              Click any cell to see detailed information about employees and their proficiency levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-white border-r-2 border-gray-200 p-3 w-48">
                      <div className="text-left text-sm font-semibold text-gray-700">Positions</div>
                    </th>
                    {processedData.sortedSkills.map((skill) => (
                      <th key={skill} className="p-2 min-w-[120px] bg-gray-50 border-b-2 border-gray-200">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-xs font-medium text-gray-700 text-center">
                              <div className="truncate max-w-[100px] mx-auto">
                                {skill.length > 15 ? skill.substring(0, 15) + '...' : skill}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{skill}</p>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedPositions).map(([dept, deptPositions]) => (
                    <React.Fragment key={dept}>
                      {/* Department Header Row */}
                      <tr className="bg-gray-100">
                        <td colSpan={processedData.sortedSkills.length + 1} className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {React.createElement(getDepartmentIcon(dept), { className: "h-4 w-4 text-gray-600" })}
                            <span className="text-sm font-semibold text-gray-700">{dept}</span>
                            <span className="text-xs text-gray-500">({deptPositions.length} positions)</span>
                          </div>
                        </td>
                      </tr>
                      {/* Position Rows */}
                      {deptPositions.map(position => {
                        const rowIndex = positions.indexOf(position);
                        const DeptIcon = getDepartmentIcon(position);
                        return (
                          <tr key={position} className="hover:bg-gray-50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white border-r-2 border-gray-200 p-3">
                          <div className="flex items-center gap-2">
                            <DeptIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {position}
                            </span>
                          </div>
                        </td>
                        {processedData.sortedSkills.map((skill, colIndex) => {
                          const cellData = processedData.data[rowIndex]?.find(c => c.skill === skill);
                          
                          if (!cellData || cellData.employeeCount === 0) {
                            return (
                              <td key={skill} className="p-2">
                                <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  <span className="text-xs">No data</span>
                                </div>
                              </td>
                            );
                          }

                          // Get trend data (mock for now, would come from historical data)
                          const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';
                          const changePercent = trend === 'up' ? Math.floor(Math.random() * 20) + 1 : 
                                              trend === 'down' ? -(Math.floor(Math.random() * 20) + 1) : 0;

                          return (
                            <td key={skill} className="p-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleCellClick(rowIndex, colIndex)}
                                      className={cn(
                                        "w-full h-16 rounded-lg shadow-sm transition-all hover:shadow-lg hover:scale-105 cursor-pointer relative",
                                        "flex flex-col items-center justify-center gap-1 font-medium",
                                        getColorForProficiency(cellData.avgProficiency, cellData.employeeCount)
                                      )}
                                    >
                                      {/* Trend Indicator */}
                                      {trend !== 'stable' && (
                                        <div className="absolute top-1 right-1">
                                          {trend === 'up' ? (
                                            <TrendingUp className="h-3 w-3 text-white/80" />
                                          ) : (
                                            <TrendingDown className="h-3 w-3 text-white/80" />
                                          )}
                                        </div>
                                      )}
                                      
                                      <span className="text-lg font-bold">
                                        {viewMode === 'skills' 
                                          ? cellData.avgProficiency.toFixed(1)
                                          : cellData.employeeCount
                                        }
                                      </span>
                                      <span className="text-xs opacity-90">
                                        {viewMode === 'skills'
                                          ? `${cellData.employeeCount} ${cellData.employeeCount === 1 ? 'emp' : 'emps'}`
                                          : getProficiencyLabel(cellData.avgProficiency)
                                        }
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3">
                                    <div className="space-y-2">
                                      <div className="font-semibold">{skill}</div>
                                      <div className="text-sm space-y-1">
                                        <div>Position: {position}</div>
                                        <div>Level: {getProficiencyLabel(cellData.avgProficiency)}</div>
                                        <div>{cellData.employeeCount} employee{cellData.employeeCount !== 1 ? 's' : ''} with this skill</div>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          );
                        })}
                      </tr>
                    );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedCell?.data && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCell.data.skill}</SheetTitle>
                <SheetDescription>
                  {selectedCell.data.position} • {getProficiencyLabel(selectedCell.data.avgProficiency)}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {selectedCell.data.avgProficiency.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Average Proficiency</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {selectedCell.data.employeeCount}
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600">Employees</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee List */}
                <div>
                  <h3 className="font-semibold mb-3">Employee Proficiency</h3>
                  <div className="space-y-2">
                    {selectedCell.data.employees.map((emp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{emp.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3].map(level => (
                              <div
                                key={level}
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  emp.proficiency >= level ? "bg-primary" : "bg-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <Badge variant={emp.proficiency >= 2 ? "default" : "secondary"}>
                            {getProficiencyLabel(emp.proficiency)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Training Options
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SkillsHeatmapView;