import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Building, 
  Calendar,
  MoreVertical,
  MessageSquare,
  Download,
  Edit,
  UserX,
  Target,
  CheckCircle2,
  Award,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeProfileHeaderProps {
  employee: {
    full_name: string;
    email: string;
    avatar_url?: string;
    department: string;
    position: string;
    is_active: boolean;
    employee_since: string;
    current_position_title?: string;
    target_position_title?: string;
    skills_profile?: {
      skills_match_score: number;
      extracted_skills?: any[];
    };
    profileCompletion?: {
      completed: number;
      total: number;
    };
    verifiedSkills?: {
      count: number;
      total: number;
      avgScore: number;
      strongest?: {
        name: string;
        score: number;
      } | null;
      weakest?: {
        name: string;
        score: number;
      } | null;
    };
  };
}

export function EmployeeProfileHeader({ employee }: EmployeeProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Poor Match';
  };

  return (
    <>
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar_url} />
                <AvatarFallback className="text-lg bg-gradient-to-br from-future-green/20 to-emerald/20 text-business-black">
                  {getInitials(employee.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{employee.full_name}</h1>
                <p className="text-lg text-muted-foreground">{employee.position}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Since {formatDate(employee.employee_since)}</span>
                  </div>
                </div>
                
                {employee.current_position_title && employee.target_position_title && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="font-medium">Current:</span>
                    <span>{employee.current_position_title}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Target:</span>
                    <span>{employee.target_position_title}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Target className="mr-2 h-4 w-4" />
                    Change Position
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate Employee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position Match Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Position Match</h3>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(employee.skills_profile?.skills_match_score || 0)}`}>
                    {employee.skills_profile?.skills_match_score || 0}%
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {getMatchScoreLabel(employee.skills_profile?.skills_match_score || 0)}
                  </Badge>
                </div>
                <Progress 
                  value={employee.skills_profile?.skills_match_score || 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Progress Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Profile Progress</h3>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-green-600">
                    {employee.profileCompletion ? Math.round((employee.profileCompletion.completed / employee.profileCompletion.total) * 100) : 0}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {employee.profileCompletion?.completed || 0}/{employee.profileCompletion?.total || 7} Complete
                  </span>
                </div>
                <Progress 
                  value={employee.profileCompletion ? (employee.profileCompletion.completed / employee.profileCompletion.total) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Assessment Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Skills Assessment</h3>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-yellow-600">
                    {employee.verifiedSkills?.withScore || 0}/{employee.verifiedSkills?.assessed || 0}
                  </span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View Detail
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Avg Score: {employee.verifiedSkills?.avgScore || 0}%</div>
                  <div className="text-xs text-green-600">
                    Verified (≥80%): {employee.verifiedSkills?.verified || 0} skills
                  </div>
                  {employee.verifiedSkills?.strongest && (
                    <div className="text-xs">
                      <span className="text-green-600">Strongest:</span> {employee.verifiedSkills.strongest.name} ({employee.verifiedSkills.strongest.score}%)
                    </div>
                  )}
                  {employee.verifiedSkills?.weakest && (
                    <div className="text-xs">
                      <span className="text-red-600">Weakest:</span> {employee.verifiedSkills.weakest.name} ({employee.verifiedSkills.weakest.score}%)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}