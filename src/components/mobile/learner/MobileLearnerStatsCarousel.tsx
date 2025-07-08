import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Target,
  TrendingUp,
  Flame,
  Zap,
  Trophy,
  Star
} from 'lucide-react';

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  gradient?: string;
}

interface MobileLearnerStatsCarouselProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    progressPercentage: number;
    estimatedHours: number;
    currentStreak: number;
    nextGoal: string;
  };
  onCardClick?: (cardId: string) => void;
}

const MobileLearnerStatsCarousel: React.FC<MobileLearnerStatsCarouselProps> = ({ 
  stats, 
  onCardClick 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const cards: StatCard[] = [
    {
      id: 'courses',
      title: 'Assigned Courses',
      value: stats.totalCourses,
      subtitle: stats.totalCourses === stats.completedCourses ? 'All completed' : 'Ready to learn',
      icon: <BookOpen className="h-5 w-5 text-white" />,
      iconBgColor: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'progress',
      title: 'Overall Progress',
      value: `${stats.progressPercentage}%`,
      subtitle: 'Course completion',
      icon: stats.progressPercentage > 80 ? <Trophy className="h-5 w-5 text-white" /> : <TrendingUp className="h-5 w-5 text-white" />,
      iconBgColor: stats.progressPercentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500',
      gradient: stats.progressPercentage > 80 ? 'from-yellow-500 to-orange-500' : 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'hours',
      title: 'Study Hours',
      value: `${stats.estimatedHours}h`,
      subtitle: 'Estimated total',
      icon: <Clock className="h-5 w-5 text-white" />,
      iconBgColor: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'streak',
      title: 'Learning Streak',
      value: stats.currentStreak,
      subtitle: stats.currentStreak > 0 ? 'days in a row' : 'Start your streak',
      icon: stats.currentStreak > 5 ? <Zap className="h-5 w-5 text-white" /> : <Flame className="h-5 w-5 text-white" />,
      iconBgColor: stats.currentStreak > 5 ? 'bg-red-500' : 'bg-orange-500',
      gradient: stats.currentStreak > 5 ? 'from-red-500 to-pink-500' : 'from-orange-500 to-red-500'
    },
    {
      id: 'goal',
      title: 'Next Goal',
      value: stats.nextGoal,
      subtitle: stats.completedCourses === stats.totalCourses ? 'All done!' : 'Course completion',
      icon: stats.completedCourses === stats.totalCourses ? <Star className="h-5 w-5 text-white" /> : <Target className="h-5 w-5 text-white" />,
      iconBgColor: stats.completedCourses === stats.totalCourses ? 'bg-yellow-500' : 'bg-indigo-500',
      gradient: stats.completedCourses === stats.totalCourses ? 'from-yellow-500 to-orange-500' : 'from-indigo-500 to-indigo-600'
    }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // Prevent vertical scrolling if horizontal swipe is detected
    const horizontalDiff = Math.abs(touchStartX.current - touchEndX.current);
    const verticalDiff = Math.abs(touchStartY.current - touchEndY.current);
    
    if (horizontalDiff > verticalDiff && horizontalDiff > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const horizontalDiff = touchStartX.current - touchEndX.current;
    const verticalDiff = Math.abs(touchStartY.current - touchEndY.current);

    // Only process horizontal swipes
    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > verticalDiff) {
      if (horizontalDiff > 0 && activeIndex < cards.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else if (horizontalDiff < 0 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
    
    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };
  
  const handleCardPress = (cardId: string) => {
    setPressedCard(cardId);
    setTimeout(() => setPressedCard(null), 150);
  };

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = 160; // 40 * 4 (w-40 = 10rem = 160px)
      const gap = 12; // gap-3 = 0.75rem = 12px
      const scrollLeft = activeIndex * (cardWidth + gap);
      carouselRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);
  
  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && cards.length > 1) {
      autoPlayRef.current = setTimeout(() => {
        setActiveIndex(current => {
          const next = current + 1;
          return next >= cards.length ? 0 : next;
        });
      }, 4000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [activeIndex, isAutoPlaying, cards.length]);

  const handleCardClick = (cardId: string) => {
    handleCardPress(cardId);
    if (onCardClick) {
      onCardClick(cardId);
    }
  };
  
  const getCardDisplayValue = (card: StatCard) => {
    if (typeof card.value === 'string') return card.value;
    if (card.id === 'streak' && card.value === 0) return '0';
    return card.value;
  };

  return (
    <div className="px-4 mb-6">
      <div className="relative">
        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            touchAction: 'pan-x'
          }}
        >
          <div className="flex gap-3 pb-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-40 snap-center"
              >
                <Card
                  className={cn(
                    "h-full cursor-pointer overflow-hidden transition-all duration-300",
                    "active:scale-95 hover:shadow-lg",
                    pressedCard === card.id ? "scale-95 shadow-lg" : "scale-100",
                    "touch-target"
                  )}
                  onClick={() => handleCardClick(card.id)}
                  onTouchStart={() => handleCardPress(card.id)}
                >
                  <CardContent className="p-0">
                    <div className={cn(
                      "bg-gradient-to-br p-4 h-full min-h-[120px] relative overflow-hidden",
                      card.gradient || "from-primary to-primary/80"
                    )}>
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full animate-pulse" />
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                      
                      <div className="relative flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                            card.iconBgColor,
                            pressedCard === card.id && "scale-110 shadow-lg"
                          )}>
                            {card.icon}
                          </div>
                          {/* Status indicator */}
                          {card.id === 'streak' && stats.currentStreak > 0 && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-xs font-medium text-white/90 mb-1">
                            {card.title}
                          </p>
                          <p className={cn(
                            "text-2xl font-bold text-white mb-1 transition-all duration-300",
                            pressedCard === card.id && "scale-105"
                          )}>
                            {getCardDisplayValue(card)}
                          </p>
                          <p className="text-xs text-white/80">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced pagination dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 3000);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 touch-target",
                "hover:bg-primary/60 active:scale-110",
                activeIndex === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 w-1.5"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Auto-play indicator */}
        {isAutoPlaying && cards.length > 1 && (
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <span>Auto-playing</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLearnerStatsCarousel;

// Enhanced touch styles for better mobile interaction
const touchOptimizedStyles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  .touch-pan-x {
    touch-action: pan-x;
  }
  
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Optimize for touch devices */
  @media (hover: none) and (pointer: coarse) {
    .hover\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .active\:scale-95:active {
      transform: scale(0.95);
    }
  }
  
  /* Smooth scrolling for carousel */
  .snap-x {
    scroll-snap-type: x mandatory;
  }
  
  .snap-center {
    scroll-snap-align: center;
  }
`;

// Inject enhanced touch styles
if (typeof document !== 'undefined') {
  const existingTouchStyles = document.getElementById('mobile-stats-carousel-styles');
  if (!existingTouchStyles) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-stats-carousel-styles';
    styleSheet.textContent = touchOptimizedStyles;
    document.head.appendChild(styleSheet);
  }
}