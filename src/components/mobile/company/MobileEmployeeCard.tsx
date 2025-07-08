import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  FileText, 
  ChevronRight, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  department?: string;
  date_of_joining?: string;
  cv_uploaded?: boolean;
  skills_analyzed?: boolean;
  skill_gap_score?: number;
  profile_image?: string;
}

interface MobileEmployeeCardProps {
  employee: Employee;
  onViewDetails?: (employee: Employee) => void;
  onUploadCV?: (employee: Employee) => void;
  onAnalyzeSkills?: (employee: Employee) => void;
  onAssignCourse?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  showActions?: boolean;
}

export function MobileEmployeeCard({
  employee,
  onViewDetails,
  onUploadCV,
  onAnalyzeSkills,
  onAssignCourse,
  onDelete,
  onSwipeLeft,
  onSwipeRight,
  showActions = true
}: MobileEmployeeCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart && Math.abs(e.targetTouches[0].clientX - touchStart) > 10) {
      setIsSwiping(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    setIsSwiping(false);
  };

  const getStatusBadge = () => {
    if (employee.skills_analyzed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Analyzed
        </Badge>
      );
    }
    if (employee.cv_uploaded) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
          <FileText className="h-3 w-3 mr-1" />
          CV Uploaded
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-gray-100 text-gray-800 border-gray-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getSkillGapIndicator = () => {
    if (!employee.skill_gap_score) return null;
    
    const score = employee.skill_gap_score;
    let color = 'text-green-600';
    let bgColor = 'bg-green-100';
    let Icon = CheckCircle;
    
    if (score > 70) {
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      Icon = XCircle;
    } else if (score > 40) {
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      Icon = AlertCircle;
    }

    return (
      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", bgColor)}>
        <Icon className={cn("h-3 w-3", color)} />
        <span className={cn("text-xs font-medium", color)}>{score}% gap</span>
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 touch-manipulation",
        "hover:shadow-md active:scale-[0.98]",
        isSwiping && "opacity-80"
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CardContent className="p-0">
        <div 
          className="flex items-start gap-4 p-4 cursor-pointer"
          onClick={() => onViewDetails?.(employee)}
        >
          {/* Avatar/Initial */}
          <div className="flex-shrink-0">
            {employee.profile_image ? (
              <img 
                src={employee.profile_image} 
                alt={`${employee.first_name} ${employee.last_name}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {employee.first_name[0]}{employee.last_name[0]}
              </div>
            )}
          </div>

          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {employee.email}
                </p>
              </div>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!employee.cv_uploaded && (
                      <DropdownMenuItem onClick={() => onUploadCV?.(employee)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CV
                      </DropdownMenuItem>
                    )}
                    {employee.cv_uploaded && !employee.skills_analyzed && (
                      <DropdownMenuItem onClick={() => onAnalyzeSkills?.(employee)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze Skills
                      </DropdownMenuItem>
                    )}
                    {employee.skills_analyzed && (
                      <DropdownMenuItem onClick={() => onAssignCourse?.(employee)}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Assign Course
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(employee)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Position & Department */}
            <div className="mt-2 space-y-1">
              {employee.position && (
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-gray-400" />
                  {employee.position}
                  {employee.department && (
                    <span className="text-gray-500"> • {employee.department}</span>
                  )}
                </p>
              )}
              {employee.date_of_joining && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  Joined {format(new Date(employee.date_of_joining), 'MMM d, yyyy')}
                </p>
              )}
            </div>

            {/* Status & Skill Gap */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              {getSkillGapIndicator()}
            </div>
          </div>

          {/* Chevron for navigation hint */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-4" />
        </div>

        {/* Quick Actions Bar (shown when CV is uploaded but not analyzed) */}
        {employee.cv_uploaded && !employee.skills_analyzed && showActions && (
          <div className="border-t bg-gray-50 px-4 py-2">
            <Button
              size="sm"
              variant="default"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyzeSkills?.(employee);
              }}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Skills Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// List component for multiple employees
interface MobileEmployeeListProps {
  employees: Employee[];
  onViewDetails?: (employee: Employee) => void;
  onUploadCV?: (employee: Employee) => void;
  onAnalyzeSkills?: (employee: Employee) => void;
  onAssignCourse?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function MobileEmployeeList({
  employees,
  onViewDetails,
  onUploadCV,
  onAnalyzeSkills,
  onAssignCourse,
  onDelete,
  showActions = true,
  emptyMessage = "No employees found"
}: MobileEmployeeListProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map((employee) => (
        <MobileEmployeeCard
          key={employee.id}
          employee={employee}
          onViewDetails={onViewDetails}
          onUploadCV={onUploadCV}
          onAnalyzeSkills={onAnalyzeSkills}
          onAssignCourse={onAssignCourse}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}