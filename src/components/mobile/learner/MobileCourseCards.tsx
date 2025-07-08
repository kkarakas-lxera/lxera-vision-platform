import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, ArrowRight, CheckCircle, Star, TrendingUp, Grid3x3, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseAssignment {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  started_at: string | null;
  cm_module_content: {
    module_name: string;
    introduction: string;
    content_id: string;
  };
}

interface MobileCourseCardsProps {
  assignments: CourseAssignment[];
  onContinueLearning: (assignment: CourseAssignment) => void;
  onViewAll: () => void;
  estimatedHours: number;
}

const MobileCourseCards: React.FC<MobileCourseCardsProps> = ({
  assignments,
  onContinueLearning,
  onViewAll,
  estimatedHours
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'assigned'>('all');
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const getStatusConfig = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return {
          icon: '✅',
          badge: { label: 'Completed', className: 'bg-green-100 text-green-800' },
          actionText: 'Review',
          timeText: 'Completed'
        };
      case 'in_progress':
        return {
          icon: '📖',
          badge: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
          actionText: 'Continue',
          timeText: `${Math.round((100 - progress) / 10)} modules left`
        };
      default:
        return {
          icon: '📋',
          badge: { label: 'Ready to Start', className: 'bg-gray-100 text-gray-800' },
          actionText: 'Start',
          timeText: `${Math.round(estimatedHours / assignments.length)}h estimated`
        };
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });
  
  const displayedCourses = filteredAssignments.slice(0, 6);
  
  const filterCounts = {
    all: assignments.length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    assigned: assignments.filter(a => a.status === 'assigned').length
  };
  
  const handleCardPress = (cardId: string) => {
    setPressedCard(cardId);
    setTimeout(() => setPressedCard(null), 150);
  };
  
  const handleScroll = () => {
    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 150);
  };
  
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Your Courses
        </h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-6 w-6 p-0"
            >
              <Grid3x3 className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-6 w-6 p-0"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="h-8 px-3 text-xs"
          >
            View All ({assignments.length})
          </Button>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide" ref={scrollRef}>
        {[
          { key: 'all', label: 'All', count: filterCounts.all },
          { key: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
          { key: 'completed', label: 'Completed', count: filterCounts.completed },
          { key: 'assigned', label: 'Ready', count: filterCounts.assigned }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "h-8 px-3 text-xs whitespace-nowrap transition-all",
              filter === tab.key && "bg-primary text-primary-foreground",
              isScrolling && "pointer-events-none"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
      
      <div className={cn(
        "gap-3",
        viewMode === 'grid' ? 'grid grid-cols-1' : 'flex flex-col space-y-2'
      )}>
        {displayedCourses.map((assignment) => {
          const statusConfig = getStatusConfig(assignment.status, assignment.progress_percentage || 0);
          
          return (
            <Card 
              key={assignment.id}
              className={cn(
                "overflow-hidden transition-all duration-300 cursor-pointer",
                "hover:shadow-md active:shadow-sm",
                pressedCard === assignment.id ? "scale-98 shadow-sm" : "scale-100",
                assignment.status === 'completed' && "bg-green-50/50 border-green-200",
                assignment.status === 'in_progress' && "bg-blue-50/50 border-blue-200",
                viewMode === 'list' && "hover:bg-muted/20"
              )}
              onClick={() => {
                handleCardPress(assignment.id);
                onContinueLearning(assignment);
              }}
              onTouchStart={() => handleCardPress(assignment.id)}
            >
              <CardContent className={cn(
                "p-4",
                viewMode === 'list' && "p-3"
              )}>
                <div className={cn(
                  "flex items-start gap-3",
                  viewMode === 'list' && "gap-2"
                )}>
                  {/* Enhanced course icon */}
                  <div className={cn(
                    "flex-shrink-0 rounded-lg flex items-center justify-center text-lg transition-all",
                    viewMode === 'grid' ? "w-10 h-10" : "w-8 h-8 text-sm",
                    assignment.status === 'completed' ? "bg-green-100" : 
                    assignment.status === 'in_progress' ? "bg-blue-100" : "bg-muted/50",
                    pressedCard === assignment.id && "scale-110"
                  )}>
                    {assignment.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : assignment.status === 'in_progress' ? (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Enhanced course content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={cn(
                        "font-medium line-clamp-2 leading-tight",
                        viewMode === 'grid' ? "text-sm" : "text-xs"
                      )}>
                        {assignment.cm_module_content.module_name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {assignment.status === 'completed' && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                        <Badge className={cn(
                          `${statusConfig.badge.className} text-xs transition-all`,
                          pressedCard === assignment.id && "scale-105"
                        )}>
                          {statusConfig.badge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="mb-3">
                      <Progress 
                        value={assignment.progress_percentage || 0} 
                        className={cn(
                          "transition-all duration-500",
                          viewMode === 'grid' ? "h-1.5" : "h-1",
                          assignment.status === 'completed' && "bg-green-200",
                          assignment.status === 'in_progress' && "bg-blue-200"
                        )}
                      />
                    </div>
                    
                    {/* Enhanced description */}
                    {viewMode === 'grid' && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {assignment.cm_module_content.introduction || 'No description available'}
                      </p>
                    )}
                    
                    {/* Enhanced bottom section */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {statusConfig.timeText}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "h-8 px-3 text-xs font-medium transition-all touch-target",
                          "active:scale-95 active:shadow-sm",
                          pressedCard === assignment.id && "bg-primary/10"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardPress(assignment.id);
                          onContinueLearning(assignment);
                        }}
                      >
                        {statusConfig.actionText}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Enhanced show more button */}
      {filteredAssignments.length > 6 && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12 transition-all active:scale-98 touch-target"
            onClick={onViewAll}
          >
            View All Courses ({filteredAssignments.length - 6} more)
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {displayedCourses.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            No courses found for "{filter === 'all' ? 'all' : filter.replace('_', ' ')}"
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            View All Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCourseCards;

// Touch-optimized styles for mobile
const mobileStyles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  @media (hover: none) and (pointer: coarse) {
    .hover\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }
`;

// Inject mobile styles
if (typeof document !== 'undefined') {
  const existingMobileStyles = document.getElementById('mobile-course-cards-styles');
  if (!existingMobileStyles) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-course-cards-styles';
    styleSheet.textContent = mobileStyles;
    document.head.appendChild(styleSheet);
  }
}