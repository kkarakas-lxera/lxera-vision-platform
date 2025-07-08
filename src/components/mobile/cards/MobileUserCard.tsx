import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mail, 
  Shield, 
  UserCheck, 
  Users,
  Calendar,
  BookOpen,
  Clock,
  Building,
  Eye,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  position?: string;
  department?: string;
  last_login?: string;
  employee?: {
    courses_completed: number;
    total_learning_hours: number;
    skill_level: string;
  };
}

interface MobileUserCardProps {
  user: User;
  isSelected: boolean;
  onToggleSelection: (userId: string) => void;
  onViewDetails: (user: User) => void;
}

export const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  isSelected,
  onToggleSelection,
  onViewDetails
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
    // Only allow left swipe (negative values) up to 80px
    setTranslateX(Math.max(-80, Math.min(0, diff)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If swiped more than 40px, keep it open, otherwise close
    if (translateX < -40) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'company_admin':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action button - revealed on swipe */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(user)}
          className="h-full rounded-l-xl px-4"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main card content */}
      <Card
        className={cn(
          "transition-transform duration-200 ease-out cursor-pointer active:scale-[0.98]",
          isDragging && "transition-none",
          isSelected && "ring-2 ring-blue-500"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => translateX === 0 && onViewDetails(user)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with checkbox and user info */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(user.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base">{user.full_name}</h3>
                <p className="text-sm text-gray-600 break-all">{user.email}</p>
                {user.position && (
                  <p className="text-sm text-gray-500">{user.position}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Role and status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === 'company_admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
              {getRoleIcon(user.role)}
              <span>{user.role.replace('_', ' ')}</span>
            </Badge>
            <Badge variant={user.is_active ? 'default' : 'secondary'}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {!user.email_verified && (
              <Badge variant="outline" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>

          {/* Department and learning info */}
          <div className="space-y-2 text-sm">
            {user.department && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4 text-gray-400" />
                <span>{user.department}</span>
              </div>
            )}
            
            {user.employee && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user.employee.courses_completed} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user.employee.total_learning_hours}h</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer with last login */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Created {formatDate(user.created_at)}</span>
            {user.last_login && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Last login: {formatDate(user.last_login)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};