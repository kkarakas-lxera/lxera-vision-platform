import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Building2, 
  Users,
  BookOpen,
  Globe,
  Calendar,
  Eye,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  plan_type: string;
  max_employees: number;
  max_courses: number;
  is_active: boolean;
  created_at: string;
  employeeCount?: number;
  activeEmployees?: number;
  courseCount?: number;
}

interface MobileCompanyCardProps {
  company: Company;
  onViewDetails: (company: Company) => void;
  onNavigateToUsers: (companyId: string) => void;
}

export const MobileCompanyCard: React.FC<MobileCompanyCardProps> = ({
  company,
  onViewDetails,
  onNavigateToUsers
}) => {
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Only allow left swipe (negative values) up to 160px for two buttons
    setTranslateX(Math.max(-160, Math.min(0, diff)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If swiped more than 80px, keep it open, otherwise close
    if (translateX < -80) {
      setTranslateX(-160);
    } else {
      setTranslateX(0);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    const colors = {
      starter: 'bg-gray-100 text-gray-800',
      growth: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[plan as keyof typeof colors] || colors.starter;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons - revealed on swipe */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateToUsers(company.id)}
          className="h-full rounded-l-xl px-4"
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(company)}
          className="h-full rounded-l-xl px-4"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main card content */}
      <Card
        className={cn(
          "transition-transform duration-200 ease-out cursor-pointer active:scale-[0.98]",
          isDragging && "transition-none"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => translateX === 0 && onViewDetails(company)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with logo and name */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-base">{company.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPlanBadgeColor(company.plan_type)}>
                    {company.plan_type}
                  </Badge>
                  <Badge variant={company.is_active ? 'default' : 'secondary'}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Domain */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="h-4 w-4 text-gray-400" />
            <span>{company.domain}</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500">
                <Users className="h-3 w-3" />
                <span className="text-xs">Employees</span>
              </div>
              <p className="text-sm font-medium mt-1">
                {company.employeeCount || 0}/{company.max_employees}
              </p>
            </div>
            <div className="text-center border-x">
              <div className="flex items-center justify-center gap-1 text-gray-500">
                <UserCheck className="h-3 w-3" />
                <span className="text-xs">Active</span>
              </div>
              <p className="text-sm font-medium mt-1">
                {company.activeEmployees || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500">
                <BookOpen className="h-3 w-3" />
                <span className="text-xs">Courses</span>
              </div>
              <p className="text-sm font-medium mt-1">
                {company.courseCount || 0}/{company.max_courses}
              </p>
            </div>
          </div>

          {/* Footer with created date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>Created {format(new Date(company.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};