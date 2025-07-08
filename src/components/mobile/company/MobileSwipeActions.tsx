import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  BarChart3, 
  Eye, 
  Trash2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SwipeAction {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  action: () => void;
  position: 'left' | 'right';
}

interface MobileSwipeActionsProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  onSwipe?: (direction: 'left' | 'right', action?: SwipeAction) => void;
  disabled?: boolean;
  className?: string;
  threshold?: number;
}

export function MobileSwipeActions({
  children,
  actions,
  onSwipe,
  disabled = false,
  className,
  threshold = 80
}: MobileSwipeActionsProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const leftActions = actions.filter(action => action.position === 'left');
  const rightActions = actions.filter(action => action.position === 'right');

  const handleStart = (clientX: number) => {
    if (disabled) return;
    
    startX.current = clientX;
    currentX.current = clientX;
    setIsDragging(true);
    setIsAnimating(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    
    currentX.current = clientX;
    const deltaX = clientX - startX.current;
    
    // Constrain the drag to prevent over-scrolling
    const maxDrag = 120;
    const constrainedDeltaX = Math.max(-maxDrag, Math.min(maxDrag, deltaX));
    
    setDragX(constrainedDeltaX);
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    const deltaX = currentX.current - startX.current;
    const absX = Math.abs(deltaX);
    
    if (absX > threshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      const relevantActions = direction === 'right' ? leftActions : rightActions;
      
      if (relevantActions.length > 0) {
        // Execute the first action for simplicity
        const action = relevantActions[0];
        action.action();
        onSwipe?.(direction, action);
      }
    }
    
    // Reset position
    setDragX(0);
    
    // Remove animation class after animation completes
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Add global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const handleGlobalMouseUp = () => handleEnd();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  const renderActions = (actionsToRender: SwipeAction[], side: 'left' | 'right') => {
    if (actionsToRender.length === 0) return null;
    
    const isVisible = side === 'left' ? dragX > 0 : dragX < 0;
    const opacity = Math.min(1, Math.abs(dragX) / threshold);
    
    return (
      <div
        className={cn(
          "absolute top-0 bottom-0 flex items-center",
          side === 'left' ? "left-0" : "right-0"
        )}
        style={{
          width: Math.min(120, Math.abs(dragX)),
          opacity: isVisible ? opacity : 0
        }}
      >
        <div className="flex items-center h-full">
          {actionsToRender.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={cn(
                  "h-full flex items-center justify-center px-3",
                  action.color
                )}
                style={{
                  width: Math.min(120 / actionsToRender.length, Math.abs(dragX) / actionsToRender.length)
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Action backgrounds */}
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}
      
      {/* Main content */}
      <div
        ref={containerRef}
        className={cn(
          "relative bg-white transition-transform touch-pan-y",
          isAnimating && "duration-200 ease-out",
          isDragging && "duration-0"
        )}
        style={{
          transform: `translateX(${dragX}px)`,
          zIndex: 10
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? handleMouseUp : undefined}
      >
        {children}
        
        {/* Drag hints */}
        {!isDragging && !disabled && (
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none" />
        )}
        {!isDragging && !disabled && (
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-red-500/20 to-transparent pointer-events-none" />
        )}
        
        {/* Swipe indicators */}
        {isDragging && (
          <>
            {dragX > 0 && leftActions.length > 0 && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  {leftActions[0].label}
                </span>
              </div>
            )}
            {dragX < 0 && rightActions.length > 0 && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-xs text-red-600 font-medium">
                  {rightActions[0].label}
                </span>
                <ChevronLeft className="h-4 w-4 text-red-600" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Predefined employee actions
export const createEmployeeSwipeActions = (
  employee: any,
  handlers: {
    onUploadCV: (employee: any) => void;
    onAnalyzeSkills: (employee: any) => void;
    onViewDetails: (employee: any) => void;
    onAssignCourse: (employee: any) => void;
    onDelete: (employee: any) => void;
  }
): SwipeAction[] => {
  const actions: SwipeAction[] = [];

  // Left swipe actions (positive actions)
  if (!employee.cv_uploaded) {
    actions.push({
      id: 'upload_cv',
      icon: Upload,
      label: 'Upload CV',
      color: 'bg-blue-500',
      position: 'left',
      action: () => handlers.onUploadCV(employee)
    });
  }

  if (employee.cv_uploaded && !employee.skills_analyzed) {
    actions.push({
      id: 'analyze_skills',
      icon: BarChart3,
      label: 'Analyze',
      color: 'bg-green-500',
      position: 'left',
      action: () => handlers.onAnalyzeSkills(employee)
    });
  }

  if (employee.skills_analyzed) {
    actions.push({
      id: 'assign_course',
      icon: BookOpen,
      label: 'Assign Course',
      color: 'bg-purple-500',
      position: 'left',
      action: () => handlers.onAssignCourse(employee)
    });
  }

  // Right swipe actions (secondary actions)
  actions.push({
    id: 'view_details',
    icon: Eye,
    label: 'View Details',
    color: 'bg-gray-500',
    position: 'right',
    action: () => handlers.onViewDetails(employee)
  });

  actions.push({
    id: 'delete',
    icon: Trash2,
    label: 'Delete',
    color: 'bg-red-500',
    position: 'right',
    action: () => handlers.onDelete(employee)
  });

  return actions;
};

// Enhanced employee card with swipe actions
interface SwipeableEmployeeCardProps {
  employee: any;
  onUploadCV: (employee: any) => void;
  onAnalyzeSkills: (employee: any) => void;
  onViewDetails: (employee: any) => void;
  onAssignCourse: (employee: any) => void;
  onDelete: (employee: any) => void;
  children?: React.ReactNode;
}

export function SwipeableEmployeeCard({
  employee,
  onUploadCV,
  onAnalyzeSkills,
  onViewDetails,
  onAssignCourse,
  onDelete,
  children
}: SwipeableEmployeeCardProps) {
  const actions = createEmployeeSwipeActions(employee, {
    onUploadCV,
    onAnalyzeSkills,
    onViewDetails,
    onAssignCourse,
    onDelete
  });

  return (
    <MobileSwipeActions
      actions={actions}
      className="rounded-lg overflow-hidden"
      onSwipe={(direction, action) => {
        // Optional: Add haptic feedback or animations
        if (action) {
          console.log(`Swiped ${direction} for action: ${action.label}`);
        }
      }}
    >
      {children}
    </MobileSwipeActions>
  );
}

// Swipe hint component
export function SwipeHintCard() {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-4 text-gray-500">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm">Swipe right for actions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Swipe left for options</span>
            <ChevronLeft className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Try swiping on employee cards above
        </p>
      </CardContent>
    </Card>
  );
}