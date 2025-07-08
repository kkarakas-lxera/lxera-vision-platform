import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'course_started' | 'module_completed' | 'achievement_earned' | 'progress_milestone';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    course_name?: string;
    module_name?: string;
    achievement_type?: string;
    progress_percentage?: number;
  };
}

interface MobileRecentActivityProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

const MobileRecentActivity: React.FC<MobileRecentActivityProps> = ({
  activities,
  onViewAll
}) => {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [pressedActivity, setPressedActivity] = useState<string | null>(null);
  const getActivityConfig = (type: string, isRecent: boolean = false) => {
    const baseConfig = {
      course_started: {
        icon: <PlayCircle className="h-4 w-4 text-blue-600" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-100',
        accentColor: 'bg-blue-500',
        textColor: 'text-blue-700'
      },
      module_completed: {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-100',
        accentColor: 'bg-green-500',
        textColor: 'text-green-700'
      },
      achievement_earned: {
        icon: <Award className="h-4 w-4 text-purple-600" />,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        iconBg: 'bg-purple-100',
        accentColor: 'bg-purple-500',
        textColor: 'text-purple-700'
      },
      progress_milestone: {
        icon: <TrendingUp className="h-4 w-4 text-orange-600" />,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconBg: 'bg-orange-100',
        accentColor: 'bg-orange-500',
        textColor: 'text-orange-700'
      }
    };
    
    const config = baseConfig[type as keyof typeof baseConfig] || {
      icon: <BookOpen className="h-4 w-4 text-gray-600" />,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconBg: 'bg-gray-100',
      accentColor: 'bg-gray-500',
      textColor: 'text-gray-700'
    };
    
    // Add recent activity highlight
    if (isRecent) {
      return {
        ...config,
        bgColor: config.bgColor.replace('-50', '-100'),
        icon: React.cloneElement(config.icon, { 
          className: config.icon.props.className + ' animate-pulse' 
        })
      };
    }
    
    return config;
  };
  
  const handleActivityPress = (activityId: string) => {
    setPressedActivity(activityId);
    setTimeout(() => setPressedActivity(null), 150);
  };
  
  const toggleExpanded = (activityId: string) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return { text: 'Just now', isRecent: true };
    } else if (diffInMinutes < 60) {
      return { text: `${diffInMinutes}m ago`, isRecent: diffInMinutes < 30 };
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return { text: `${hours}h ago`, isRecent: hours < 2 };
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return { text: `${days}d ago`, isRecent: false };
    }
  };
  
  const getActivityTitle = (activity: ActivityItem) => {
    const emoji = {
      course_started: '🚀',
      module_completed: '✅',
      achievement_earned: '🏆',
      progress_milestone: '📈'
    }[activity.type] || '📚';
    
    return `${emoji} ${activity.title}`;
  };

  // Show only the first 5 activities
  const displayedActivities = activities.slice(0, 5);

  if (activities.length === 0) {
    return (
      <div className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Recent Activity
        </h2>
        <Card className="p-6 bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="font-medium text-sm mb-2">Ready to start your journey?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start learning to see your progress and achievements here!
            </p>
            <Button size="sm" className="gap-2">
              <Zap className="h-3 w-3" />
              Begin Learning
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Activity
        </h2>
        {activities.length > 5 && onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="h-8 px-3 text-xs"
          >
            View All
          </Button>
        )}
      </div>
      
      {/* Timeline container */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-transparent" />
        
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => {
            const timeInfo = formatTimeAgo(activity.timestamp);
            const config = getActivityConfig(activity.type, timeInfo.isRecent);
            const isExpanded = expandedActivity === activity.id;
            const isPressed = pressedActivity === activity.id;
            
            return (
              <div key={activity.id} className="relative">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-4 w-4 h-4 rounded-full border-2 border-background z-10 transition-all duration-300",
                  config.accentColor,
                  timeInfo.isRecent && "animate-pulse shadow-lg",
                  isPressed && "scale-125"
                )} />
                
                {/* Activity card */}
                <Card 
                  className={cn(
                    "ml-10 transition-all duration-300 cursor-pointer touch-target",
                    config.bgColor,
                    config.borderColor,
                    "border-l-4 hover:shadow-md active:shadow-sm",
                    isPressed && "scale-98 shadow-sm",
                    timeInfo.isRecent && "ring-1 ring-primary/20"
                  )}
                  onClick={() => {
                    handleActivityPress(activity.id);
                    toggleExpanded(activity.id);
                  }}
                  onTouchStart={() => handleActivityPress(activity.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Enhanced activity icon */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        config.iconBg,
                        isPressed && "scale-110"
                      )}>
                        {config.icon}
                      </div>
                      
                      {/* Enhanced activity content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-medium text-sm line-clamp-1 transition-colors",
                              config.textColor
                            )}>
                              {getActivityTitle(activity)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                            
                            {/* Enhanced metadata */}
                            {activity.metadata && (
                              <div className="flex items-center gap-2 mt-3">
                                {activity.metadata.course_name && (
                                  <Badge variant="secondary" className="text-xs h-5">
                                    {activity.metadata.course_name}
                                  </Badge>
                                )}
                                {activity.metadata.progress_percentage && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs h-5",
                                      config.borderColor
                                    )}
                                  >
                                    {activity.metadata.progress_percentage}% complete
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Expandable content */}
                            {isExpanded && (
                              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                <p className="text-xs text-muted-foreground">
                                  Additional details about this activity would appear here.
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced timestamp with recent indicator */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className={cn(
                              "flex items-center gap-1 text-xs transition-colors",
                              timeInfo.isRecent ? config.textColor : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {timeInfo.text}
                            </div>
                            {timeInfo.isRecent && (
                              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                <Zap className="h-2 w-2" />
                                New
                              </div>
                            )}
                            <ChevronRight className={cn(
                              "h-3 w-3 text-muted-foreground transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Enhanced show more button */}
      {activities.length > 5 && onViewAll && (
        <div className="mt-6">
          <div className="relative">
            {/* Continue timeline */}
            <div className="absolute left-6 top-0 w-0.5 h-6 bg-gradient-to-b from-primary/40 to-transparent" />
            <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-muted border-2 border-background" />
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 ml-10 transition-all active:scale-98 touch-target hover:shadow-md"
              onClick={onViewAll}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>View All Activity ({activities.length - 5} more)</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileRecentActivity;

// Timeline-specific styles for better mobile experience
const timelineStyles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  /* Smooth animations for timeline */
  @keyframes timelinePulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
  
  .animate-timeline-pulse {
    animation: timelinePulse 2s ease-in-out infinite;
  }
  
  /* Optimize for touch devices */
  @media (hover: none) and (pointer: coarse) {
    .hover\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }
`;

// Inject timeline styles
if (typeof document !== 'undefined') {
  const existingTimelineStyles = document.getElementById('mobile-activity-timeline-styles');
  if (!existingTimelineStyles) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-activity-timeline-styles';
    styleSheet.textContent = timelineStyles;
    document.head.appendChild(styleSheet);
  }
}