import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, ArrowRight, PlayCircle, Zap, CheckCircle2 } from 'lucide-react';
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

interface MobileLearningProgressProps {
  currentCourse: CourseAssignment | null;
  onContinueLearning: (assignment: CourseAssignment) => void;
}

const MobileLearningProgress: React.FC<MobileLearningProgressProps> = ({
  currentCourse,
  onContinueLearning
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);

  const progressPercentage = currentCourse?.progress_percentage || 0;
  const isNearCompletion = progressPercentage > 80;

  useEffect(() => {
    if (isNearCompletion && !showMotivation) {
      setShowMotivation(true);
      const timer = setTimeout(() => setShowMotivation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNearCompletion, showMotivation]);

  if (!currentCourse) return null;

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "Let's get started! 🚀";
    if (progressPercentage < 25) return "Great start! Keep going! 💪";
    if (progressPercentage < 50) return "You're making progress! 🌟";
    if (progressPercentage < 75) return "Over halfway there! 🎯";
    if (progressPercentage < 90) return "Almost done! You've got this! 🏁";
    return "So close to finishing! 🎉";
  };

  const getTimeEstimate = () => {
    const remainingPercentage = 100 - progressPercentage;
    const estimatedMinutes = Math.ceil(remainingPercentage / 10) * 5; // 5 min per 10%
    if (estimatedMinutes < 60) return `~${estimatedMinutes} min left`;
    return `~${Math.ceil(estimatedMinutes / 60)}h left`;
  };

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Continue Learning
          </h2>
          {isNearCompletion && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Zap className="h-3 w-3" />
              <span className="font-medium">Nearly done!</span>
            </div>
          )}
        </div>
        <Badge 
          variant={isNearCompletion ? "default" : "outline"} 
          className={cn(
            "text-xs transition-colors",
            isNearCompletion && "bg-orange-500 text-white"
          )}
        >
          {progressPercentage}% Complete
        </Badge>
      </div>
      
      <Card 
        className={cn(
          "p-0 overflow-hidden transition-all duration-300 cursor-pointer",
          "hover:shadow-lg active:shadow-md",
          isPressed ? "scale-98" : "scale-100",
          isNearCompletion && "ring-1 ring-orange-200"
        )}
        onClick={() => onContinueLearning(currentCourse)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        <div className="relative">
          {/* Enhanced progress bar overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                isNearCompletion 
                  ? "bg-gradient-to-r from-orange-500 to-red-500" 
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isNearCompletion ? "bg-orange-100" : "bg-primary/10"
              )}>
                {isNearCompletion ? (
                  <CheckCircle2 className="h-6 w-6 text-orange-600" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  {currentCourse.cm_module_content.module_name}
                </CardTitle>
                <CardDescription className="text-sm mt-1 line-clamp-2">
                  {currentCourse.cm_module_content.introduction}
                </CardDescription>
                {/* Motivational message */}
                {showMotivation && (
                  <div className="mt-2 text-xs text-orange-600 font-medium animate-pulse">
                    {getMotivationalMessage()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Enhanced progress section */}
              <div className="space-y-3">
                <Progress 
                  value={progressPercentage} 
                  className={cn(
                    "h-2 transition-all duration-500",
                    isNearCompletion && "bg-orange-100"
                  )}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progressPercentage}% complete
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeEstimate()}
                  </span>
                </div>
                
                {/* Progress milestone indicator */}
                {progressPercentage > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-px bg-muted">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage * 4, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">Progress</span>
                  </div>
                )}
              </div>
              
              {/* Enhanced next section info */}
              <div className={cn(
                "rounded-lg p-3 transition-colors",
                isNearCompletion ? "bg-orange-50" : "bg-muted/30"
              )}>
                <div className="flex items-center gap-2 text-sm">
                  <PlayCircle className={cn(
                    "h-4 w-4",
                    isNearCompletion ? "text-orange-600" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    isNearCompletion ? "text-orange-700" : "text-muted-foreground"
                  )}>
                    {isNearCompletion ? "Final stretch: Complete course" : "Next: Module Overview"}
                  </span>
                </div>
              </div>
              
              {/* Enhanced continue button */}
              <Button 
                size="lg" 
                className={cn(
                  "w-full h-12 gap-2 font-medium transition-all duration-300",
                  "active:scale-98 active:shadow-sm",
                  isNearCompletion && "bg-orange-500 hover:bg-orange-600 text-white"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onContinueLearning(currentCourse);
                }}
              >
                {isNearCompletion ? "Finish Course" : "Continue Learning"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
      
      {/* Achievement preview for near completion */}
      {isNearCompletion && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Almost there! Complete this course to unlock your certificate.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLearningProgress;

// Add touch-friendly styles
const touchStyles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  @media (hover: none) {
    .hover\:shadow-lg:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = touchStyles;
  document.head.appendChild(styleSheet);
}