import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Users, 
  GraduationCap, 
  Target, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BarChart3
} from 'lucide-react';

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  progress?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  highlight?: boolean;
}

interface MobileMetricsCarouselProps {
  metrics: {
    totalEmployees: number;
    activeLearningPaths: number;
    skillsCoverage: number;
    avgReadinessScore: number;
    employeesWithCVs: number;
    analyzedCVs: number;
    positionsWithGaps: number;
    criticalGaps: number;
  };
  onCardClick?: (cardId: string) => void;
  isFreeTrialUser?: boolean;
}

const MobileMetricsCarousel: React.FC<MobileMetricsCarouselProps> = ({ metrics, onCardClick, isFreeTrialUser = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const cards: MetricCard[] = [
    {
      id: 'employees',
      title: 'Total Employees',
      value: metrics.totalEmployees,
      subtitle: `${metrics.employeesWithCVs} with CVs uploaded`,
      icon: <Users className="h-6 w-6 text-primary" />,
      iconBgColor: 'bg-primary/10',
      progress: metrics.totalEmployees > 0 ? (metrics.employeesWithCVs / metrics.totalEmployees) * 100 : 0,
    },
    {
      id: 'cv-analysis',
      title: 'CV Analysis',
      value: metrics.analyzedCVs,
      subtitle: `of ${metrics.totalEmployees} total employees`,
      icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
      iconBgColor: 'bg-green-100',
      progress: metrics.totalEmployees > 0 ? (metrics.analyzedCVs / metrics.totalEmployees) * 100 : 0,
    },
    {
      id: 'skills-match',
      title: 'Skills Match',
      value: `${metrics.skillsCoverage}%`,
      subtitle: 'Average match score',
      icon: <Target className="h-6 w-6 text-blue-600" />,
      iconBgColor: 'bg-blue-100',
      progress: metrics.skillsCoverage,
    },
    {
      id: 'readiness',
      title: 'Career Readiness',
      value: `${metrics.avgReadinessScore}%`,
      subtitle: 'Average readiness score',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      iconBgColor: 'bg-purple-100',
      progress: metrics.avgReadinessScore,
    },
    {
      id: 'positions-gaps',
      title: 'Positions with Gaps',
      value: metrics.positionsWithGaps,
      subtitle: 'Need skill development',
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      iconBgColor: 'bg-orange-100',
      highlight: metrics.positionsWithGaps > 0,
      badge: metrics.positionsWithGaps > 0 ? {
        label: 'Action needed',
        variant: 'destructive' as const
      } : undefined,
    },
    {
      id: 'critical-gaps',
      title: 'Critical Gaps',
      value: metrics.criticalGaps,
      subtitle: 'Below 50% match',
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      iconBgColor: 'bg-red-100',
      highlight: metrics.criticalGaps > 0,
      badge: metrics.criticalGaps > 0 ? {
        label: 'Urgent',
        variant: 'destructive' as const
      } : undefined,
    },
    {
      id: 'active-learning',
      title: 'Active Learning',
      value: metrics.activeLearningPaths,
      subtitle: 'Courses in progress',
      icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
      iconBgColor: 'bg-indigo-100',
    },
  ];

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
      if (diff > 0 && activeIndex < cards.length - 1) {
        // Swipe left - next card
        setActiveIndex(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        // Swipe right - previous card
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: activeIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const handleCardClick = (cardId: string) => {
    if (onCardClick) {
      onCardClick(cardId);
    }
  };

  return (
    <div className="relative w-full">
      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-4 px-4" style={{ width: `${cards.length * 100}%` }}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="flex-shrink-0 w-full snap-center"
              style={{ width: `${100 / cards.length}%` }}
            >
              <Card
                className={cn(
                  "h-full cursor-pointer active:scale-95 transition-transform",
                  card.highlight && "border-orange-200",
                  isFreeTrialUser && "bg-white/60 backdrop-blur-sm border-indigo-100"
                )}
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className={cn(
                        "text-3xl font-bold mt-1",
                        card.highlight && card.id === 'critical-gaps' && "text-red-600",
                        card.highlight && card.id === 'positions-gaps' && "text-orange-600"
                      )}>
                        {card.value}
                      </p>
                      {card.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                      card.iconBgColor
                    )}>
                      {card.icon}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {card.progress !== undefined && (
                    <Progress 
                      value={card.progress} 
                      className={cn(
                        "h-2 mb-3",
                        card.progress < 60 && "[&>div]:bg-red-500",
                        card.progress >= 60 && card.progress < 80 && "[&>div]:bg-orange-500"
                      )}
                    />
                  )}
                  
                  {/* Badge */}
                  {card.badge && (
                    <Badge variant={card.badge.variant} className="mt-2">
                      {card.badge.label}
                    </Badge>
                  )}
                  
                  {/* Trend */}
                  {card.trend && (
                    <div className={cn(
                      "flex items-center gap-1 mt-2",
                      card.trend.direction === 'up' ? "text-green-600" : "text-red-600"
                    )}>
                      <span className="text-sm font-medium">
                        {card.trend.direction === 'up' ? '↑' : '↓'} {card.trend.value}%
                      </span>
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
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileMetricsCarousel;