import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  skills_gap_percentage: number;
  critical_gaps: number;
  moderate_gaps: number;
  last_course_date?: string;
  skills_last_analyzed?: string;
}

interface EmployeeSelectionGridProps {
  employees: Employee[];
  selectedIds: string[];
  onToggleSelect: (employeeId: string) => void;
}

export const EmployeeSelectionGrid: React.FC<EmployeeSelectionGridProps> = ({
  employees,
  selectedIds,
  onToggleSelect,
}) => {
  const formatRelativeDate = (date: string | undefined) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {employees.map(employee => (
        <div
          key={employee.id}
          onClick={() => onToggleSelect(employee.id)}
          className={cn(
            "relative p-3 rounded-lg border cursor-pointer transition-all",
            "hover:shadow-sm",
            selectedIds.includes(employee.id) 
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
          )}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-2 right-2">
            <Checkbox 
              checked={selectedIds.includes(employee.id)}
              onCheckedChange={() => onToggleSelect(employee.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Employee Info */}
          <div className="pr-8">
            <p className="font-medium text-sm truncate">{employee.name}</p>
            <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {employee.position} • {employee.department}
            </p>
            
            {/* Skills Gap Indicator */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      employee.skills_gap_percentage >= 70 ? "bg-red-500" :
                      employee.skills_gap_percentage >= 40 ? "bg-yellow-500" :
                      "bg-green-500"
                    )}
                    style={{ width: `${Math.min(100, employee.skills_gap_percentage)}%` }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {employee.skills_gap_percentage}% gap
                </span>
              </div>
              
              {/* Gap Breakdown */}
              <div className="flex items-center gap-3 text-xs">
                {employee.critical_gaps > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    {employee.critical_gaps} critical
                  </span>
                )}
                {employee.moderate_gaps > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {employee.moderate_gaps} moderate
                  </span>
                )}
                {employee.critical_gaps === 0 && employee.moderate_gaps === 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    No gaps
                  </span>
                )}
              </div>
            </div>
            
            {/* Last Analysis Date */}
            {employee.skills_last_analyzed && (
              <div className="mt-2 text-xs text-muted-foreground">
                Analyzed {formatRelativeDate(employee.skills_last_analyzed)}
              </div>
            )}
            
            {/* Last Course Date */}
            {employee.last_course_date && (
              <div className="text-xs text-muted-foreground">
                Last course {formatRelativeDate(employee.last_course_date)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};