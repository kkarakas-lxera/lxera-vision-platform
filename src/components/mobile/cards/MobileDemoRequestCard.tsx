import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Mail, 
  Building2, 
  Calendar,
  Briefcase,
  Users as UsersIcon,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LocalDemoRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  job_title?: string;
  phone?: string;
  company_size?: string;
  country?: string;
  message?: string;
  source?: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  submitted_at?: string;
  updated_at?: string;
}

interface MobileDemoRequestCardProps {
  request: LocalDemoRequestRecord;
  onViewDetails: (request: LocalDemoRequestRecord) => void;
}

export const MobileDemoRequestCard: React.FC<MobileDemoRequestCardProps> = ({
  request,
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

  const getStatusColor = (status: string) => {
    const statusConfig = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action button - revealed on swipe */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(request)}
          className="h-full rounded-l-xl px-4"
        >
          View Details
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
        onClick={() => translateX === 0 && onViewDetails(request)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-base">
                {request.first_name} {request.last_name}
              </h3>
              <Badge className={cn(getStatusColor(request.status), "mt-1")}>
                {request.status}
              </Badge>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{request.email}</span>
            </div>
            {request.job_title && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{request.job_title}</span>
              </div>
            )}
          </div>

          {/* Company info */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{request.company}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {request.company_size && (
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-3 w-3" />
                  <span>{request.company_size} employees</span>
                </div>
              )}
              {request.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{request.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message preview if available */}
          {request.message && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 line-clamp-2">{request.message}</p>
            </div>
          )}

          {/* Footer with date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(request.created_at), 'MMM dd, yyyy')} at{' '}
              {format(new Date(request.created_at), 'HH:mm')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};