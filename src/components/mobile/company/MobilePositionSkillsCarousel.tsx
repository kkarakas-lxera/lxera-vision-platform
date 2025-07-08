import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillGap {
  skill_name: string;
  skill_type: string;
  required_level: string;
  current_level: string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
}

interface PositionAnalysis {
  position_title: string;
  position_code: string;
  total_employees: number;
  avg_gap_score: number;
  critical_gaps: number;
  top_gaps: SkillGap[];
}

interface MobilePositionSkillsCarouselProps {
  positions: PositionAnalysis[];
  onPositionSelect?: (position: PositionAnalysis) => void;
  className?: string;
}

export const MobilePositionSkillsCarousel: React.FC<MobilePositionSkillsCarouselProps> = ({
  positions,
  onPositionSelect,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && activeIndex < positions.length - 1) {
        // Swipe left - next position
        setActiveIndex(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        // Swipe right - previous position
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  const goToSlide = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, positions.length - 1)));
  };

  const nextSlide = () => {
    if (activeIndex < positions.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevSlide = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  useEffect(() => {
    if (carouselRef.current && positions.length > 0) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: activeIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, positions.length]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (positions.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No position analysis available
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Position Skills Coverage</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={activeIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={activeIndex === positions.length - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-4" style={{ width: `${positions.length * 100}%` }}>
          {positions.map((position, index) => (
            <div
              key={position.position_code}
              className="flex-shrink-0 snap-center"
              style={{ width: `${100 / positions.length}%` }}
            >
              <Card
                className={cn(
                  "h-full cursor-pointer transition-all duration-200",
                  "active:scale-[0.98]",
                  index === activeIndex ? "ring-2 ring-primary" : ""
                )}
                onClick={() => onPositionSelect?.(position)}
              >
                <CardContent className="p-4 space-y-4">
                  {/* Position Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-base leading-tight">
                        {position.position_title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {position.position_code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{position.total_employees} employees</span>
                    </div>
                  </div>

                  {/* Skills Match Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Skills Match</span>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(position.avg_gap_score)}
                        <span className={cn(
                          "text-xl font-bold",
                          getScoreColor(position.avg_gap_score)
                        )}>
                          {position.avg_gap_score}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={cn(
                          "h-2.5 rounded-full transition-all duration-300",
                          position.avg_gap_score >= 80 ? "bg-green-500" :
                          position.avg_gap_score >= 60 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${position.avg_gap_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Target className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Match</p>
                      <p className="text-sm font-semibold">{position.avg_gap_score}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Critical</p>
                      <p className="text-sm font-semibold text-red-600">{position.critical_gaps}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <TrendingUp className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-semibold">{position.top_gaps.length}</p>
                    </div>
                  </div>

                  {/* Top Skills Gaps */}
                  {position.top_gaps.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        Top Skill Gaps
                      </h5>
                      <div className="space-y-1.5">
                        {position.top_gaps.slice(0, 3).map((gap, gapIndex) => (
                          <div 
                            key={gapIndex} 
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{gap.skill_name}</p>
                              <p className="text-muted-foreground">{gap.employees_affected} affected</p>
                            </div>
                            <Badge 
                              className={cn(
                                "text-xs ml-2",
                                getSeverityColor(gap.gap_severity)
                              )}
                            >
                              {gap.gap_severity}
                            </Badge>
                          </div>
                        ))}
                        {position.top_gaps.length > 3 && (
                          <p className="text-xs text-center text-muted-foreground pt-1">
                            +{position.top_gaps.length - 3} more gaps
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {positions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30"
            )}
            aria-label={`Go to position ${index + 1}`}
          />
        ))}
      </div>

      {/* Position counter */}
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground">
          {activeIndex + 1} of {positions.length} positions
        </span>
      </div>
    </div>
  );
};