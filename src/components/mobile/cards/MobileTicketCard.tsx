import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TicketRecord, TicketType } from '@/services/ticketService';
import { 
  ChevronRight, 
  Trash2, 
  Mail, 
  Building2, 
  Calendar,
  MessageSquare,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTicketCardProps {
  ticket: TicketRecord;
  onViewDetails: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const MobileTicketCard: React.FC<MobileTicketCardProps> = ({
  ticket,
  onViewDetails,
  onDelete
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

  const getStatusColor = (status: TicketRecord['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: TicketRecord['priority'] | null | undefined) => {
    const effectivePriority = priority || 'medium';
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[effectivePriority];
  };

  const getTicketTypeIcon = (type: TicketType) => {
    const icons = {
      demo_request: '🎯',
      contact_sales: '💰',
      early_access: '🚀'
    };
    return icons[type];
  };

  const getTicketTypeLabel = (type: TicketType) => {
    const labels = {
      demo_request: 'Demo Request',
      contact_sales: 'Sales Contact',
      early_access: 'Early Access'
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete button - revealed on swipe */}
      {onDelete && (
        <div className="absolute right-0 top-0 h-full flex items-center pr-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(ticket.id)}
            className="h-full rounded-l-xl px-4"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
      
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
        onClick={() => translateX === 0 && onViewDetails(ticket.id)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with type and status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTicketTypeIcon(ticket.ticket_type)}</span>
              <div>
                <p className="text-sm font-medium">{getTicketTypeLabel(ticket.ticket_type)}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority || 'medium'}
                  </Badge>
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{ticket.first_name} {ticket.last_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{ticket.email}</span>
            </div>
            {ticket.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{ticket.company}</span>
              </div>
            )}
          </div>

          {/* Message preview */}
          {ticket.message && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 line-clamp-2">{ticket.message}</p>
            </div>
          )}

          {/* Footer with date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(ticket.submitted_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};