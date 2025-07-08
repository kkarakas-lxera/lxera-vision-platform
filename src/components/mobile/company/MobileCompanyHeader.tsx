import React from 'react';
import { 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  ChevronDown, 
  Settings,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CompanyStats {
  totalEmployees: number;
  employeesWithCVs: number;
  employeesAnalyzed: number;
  averageSkillGap: number;
  topSkillGaps: string[];
}

interface MobileCompanyHeaderProps {
  companyName: string;
  companyLogo?: string;
  stats: CompanyStats;
  userRole?: 'admin' | 'hr' | 'manager';
  onMenuToggle?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  onCompanySwitch?: () => void;
  notificationCount?: number;
}

export function MobileCompanyHeader({
  companyName,
  companyLogo,
  stats,
  userRole = 'admin',
  onMenuToggle,
  onSearch,
  onNotifications,
  onSettings,
  onCompanySwitch,
  notificationCount = 0
}: MobileCompanyHeaderProps) {
  const getCompanyInitials = () => {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProgressPercentage = () => {
    if (stats.totalEmployees === 0) return 0;
    return Math.round((stats.employeesAnalyzed / stats.totalEmployees) * 100);
  };

  const getSkillGapColor = (gap: number) => {
    if (gap < 30) return 'text-green-600 bg-green-100';
    if (gap < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 px-2 flex items-center gap-2"
                onClick={onCompanySwitch}
              >
                {companyLogo ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={companyLogo} alt={companyName} />
                    <AvatarFallback className="text-xs">
                      {getCompanyInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getCompanyInitials()}
                  </div>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={onCompanySwitch}>
                <Building2 className="h-4 w-4 mr-2" />
                Switch Company
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Company Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotifications}
            className="h-8 w-8 p-0 relative"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Company Info Card */}
      <Card className="mx-4 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {companyLogo ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={companyLogo} alt={companyName} />
                <AvatarFallback className="text-lg font-bold">
                  {getCompanyInitials()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                {getCompanyInitials()}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {companyName}
              </h1>
              <p className="text-sm text-gray-600 capitalize">
                {userRole} Dashboard
              </p>
              
              {/* Quick Progress Indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {getProgressPercentage()}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-semibold">{stats.totalEmployees}</p>
              <p className="text-xs text-gray-600">Total Employees</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-semibold">{stats.employeesAnalyzed}</p>
              <p className="text-xs text-gray-600">Skills Analyzed</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Gap Overview */}
        {stats.averageSkillGap > 0 && (
          <Card className="mt-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Avg. Skill Gap</span>
                </div>
                <Badge className={cn(
                  "text-xs px-2 py-1",
                  getSkillGapColor(stats.averageSkillGap)
                )}>
                  {stats.averageSkillGap}%
                </Badge>
              </div>
              
              {stats.topSkillGaps.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Top Missing Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {stats.topSkillGaps.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {stats.topSkillGaps.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{stats.topSkillGaps.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}