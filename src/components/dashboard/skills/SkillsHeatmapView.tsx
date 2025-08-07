import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, Users } from 'lucide-react';

interface SkillLevel {
  position: string;
  skill: string;
  avgProficiency: number;
  employeeCount: number;
  employees: Array<{
    name: string;
    proficiency: number;
  }>;
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
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Color scale for proficiency levels (0-3 scale)
  const getColorForProficiency = (level: number): string => {
    if (level === 0) return 'bg-red-100 hover:bg-red-200 border-red-300';
    if (level < 1) return 'bg-orange-100 hover:bg-orange-200 border-orange-300';
    if (level < 2) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
    if (level < 2.5) return 'bg-lime-100 hover:bg-lime-200 border-lime-300';
    if (level < 3) return 'bg-green-100 hover:bg-green-200 border-green-300';
    return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300';
  };

  const getTextColorForProficiency = (level: number): string => {
    if (level === 0) return 'text-red-700';
    if (level < 1) return 'text-orange-700';
    if (level < 2) return 'text-yellow-700';
    if (level < 2.5) return 'text-lime-700';
    if (level < 3) return 'text-green-700';
    return 'text-emerald-700';
  };

  const getProficiencyLabel = (level: number): string => {
    if (level === 0) return 'None';
    if (level < 1) return 'Learning';
    if (level < 2) return 'Using';
    if (level < 3) return 'Proficient';
    return 'Expert';
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
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
    <div className="space-y-6">
      {/* Main Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skills Distribution Heatmap</CardTitle>
              <CardDescription>
                Average proficiency levels across positions and skills (click cells for details)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-gray-600">Critical Gap</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span className="text-gray-600">Developing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Proficient</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                <span className="text-gray-600">Expert</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header Row - Skills */}
              <div className="flex">
                <div className="w-32 p-2"></div> {/* Empty corner cell */}
                {skills.map((skill, index) => (
                  <div
                    key={skill}
                    className="flex-1 min-w-[100px] p-2 text-xs font-medium text-gray-700 text-center border-b-2 border-gray-200"
                  >
                    <div className="transform -rotate-45 origin-center whitespace-nowrap">
                      {skill}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Rows - Positions */}
              {positions.map((position, rowIndex) => (
                <div key={position} className="flex hover:bg-gray-50">
                  {/* Position Label */}
                  <div className="w-32 p-2 text-sm font-medium text-gray-700 border-r-2 border-gray-200 sticky left-0 bg-white">
                    {position}
                  </div>

                  {/* Skill Cells */}
                  {skills.map((skill, colIndex) => {
                    const cellData = positionSkillsData[rowIndex]?.[colIndex];
                    if (!cellData) return <div key={skill} className="flex-1 min-w-[100px] p-1"></div>;

                    return (
                      <TooltipProvider key={skill}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex-1 min-w-[100px] p-1 cursor-pointer transition-all`}
                              onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                            >
                              <div
                                className={`
                                  h-12 rounded-md border flex flex-col items-center justify-center
                                  ${getColorForProficiency(cellData.avgProficiency)}
                                  transition-all hover:shadow-md
                                `}
                              >
                                <span className={`text-lg font-semibold ${getTextColorForProficiency(cellData.avgProficiency)}`}>
                                  {cellData.avgProficiency.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {cellData.employeeCount} emp
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-2">
                              <div className="font-semibold">{position} - {skill}</div>
                              <div className="text-sm">
                                <div>Average: {cellData.avgProficiency.toFixed(2)} ({getProficiencyLabel(cellData.avgProficiency)})</div>
                                <div>{cellData.employeeCount} employees with this skill</div>
                              </div>
                              {cellData.employees.length > 0 && (
                                <div className="text-xs border-t pt-2">
                                  <div className="font-medium mb-1">Top performers:</div>
                                  {cellData.employees.slice(0, 3).map((emp, i) => (
                                    <div key={i} className="flex justify-between">
                                      <span>{emp.name}</span>
                                      <span className="font-medium">{emp.proficiency}/3</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedCell && positionSkillsData[selectedCell.row]?.[selectedCell.col] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {positions[selectedCell.row]} - {skills[selectedCell.col]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Average: {positionSkillsData[selectedCell.row][selectedCell.col].avgProficiency.toFixed(2)}
                </Badge>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {positionSkillsData[selectedCell.row][selectedCell.col].employeeCount} employees
                </span>
              </div>

              {/* Employee List */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Employees with this skill:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {positionSkillsData[selectedCell.row][selectedCell.col].employees.map((emp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{emp.name}</span>
                      <Badge variant={emp.proficiency >= 2 ? "default" : "secondary"} className="text-xs">
                        {emp.proficiency}/3
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillsHeatmapView;