import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Building, 
  Users, 
  BookOpen, 
  Mail, 
  MessageSquare,
  Star
} from 'lucide-react';

interface StatCard {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  rating?: number;
  onClick?: () => void;
}

interface MobileStatsCarouselProps {
  stats: {
    totalCompanies: number;
    activeCompanies: number;
    totalEmployees: number;
    activeLearners: number;
    totalCourses: number;
    completionRate: number;
    totalTickets: number;
    newTickets: number;
    totalFeedback: number;
    criticalIssues: number;
    averageRating: number;
    newFeedback: number;
  };
  onCardClick?: (cardId: string) => void;
}

const MobileStatsCarousel: React.FC<MobileStatsCarouselProps> = ({ stats, onCardClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const cards: StatCard[] = [
    {
      id: 'companies',
      title: 'Total Companies',
      value: stats.totalCompanies,
      subtitle: `${stats.activeCompanies} active`,
      icon: <Building className="h-6 w-6 text-primary" />,
      iconBgColor: 'bg-primary/10',
    },
    {
      id: 'users',
      title: 'Total Users',
      value: stats.totalEmployees,
      subtitle: `${stats.activeLearners} active learners`,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      iconBgColor: 'bg-blue-100',
    },
    {
      id: 'courses',
      title: 'Total Courses',
      value: stats.totalCourses,
      subtitle: `${stats.completionRate.toFixed(0)}% completion`,
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      iconBgColor: 'bg-green-100',
    },
    {
      id: 'tickets',
      title: 'Customer Tickets',
      value: stats.totalTickets,
      icon: <Mail className="h-6 w-6 text-purple-600" />,
      iconBgColor: 'bg-purple-100',
      badge: stats.newTickets > 0 ? {
        label: `${stats.newTickets} new`,
        variant: 'default' as const
      } : undefined,
    },
    {
      id: 'feedback',
      title: 'Customer Feedback',
      value: stats.totalFeedback,
      icon: <MessageSquare className="h-6 w-6 text-orange-600" />,
      iconBgColor: 'bg-orange-100',
      badge: stats.criticalIssues > 0 ? {
        label: `${stats.criticalIssues} critical`,
        variant: 'destructive' as const
      } : undefined,
      rating: stats.averageRating > 0 ? stats.averageRating : undefined,
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
                className="h-full cursor-pointer active:scale-95 transition-transform"
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold mt-1">{card.value}</p>
                      {card.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {card.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {card.badge && (
                          <Badge variant={card.badge.variant}>
                            {card.badge.label}
                          </Badge>
                        )}
                        {card.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {card.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ml-4",
                      card.iconBgColor
                    )}>
                      {card.icon}
                    </div>
                  </div>
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

export default MobileStatsCarousel;