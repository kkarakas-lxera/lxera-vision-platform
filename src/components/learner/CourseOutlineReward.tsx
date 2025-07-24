import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CourseModule, 
  CourseOutlineData, 
  CourseOutlineRewardProps 
} from './CourseOutlineReward.types';

const difficultyColors = {
  Beginner: 'bg-green-50 text-green-700 border-0',
  Intermediate: 'bg-yellow-50 text-yellow-700 border-0',
  Advanced: 'bg-red-50 text-red-700 border-0'
};

interface ExtendedCourseOutlineRewardProps extends CourseOutlineRewardProps {
  onStartLearning?: () => void;
  onSkip?: () => void;
}

const CourseOutlineReward: React.FC<ExtendedCourseOutlineRewardProps> = ({
  courseOutline,
  employeeName = 'there',
  loading = false,
  error = null,
  onStartCourse,
  onViewFullCourse,
  onRetryGeneration,
  onStartLearning,
  onSkip
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border border-[#EFEFE3] shadow-sm">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-[#EFEFE3] rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-[#191919] animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-medium text-[#191919]">
                    Creating Your Personalized Course
                  </h2>
                  <p className="text-base text-[#4b5563]">
                    Analyzing your profile to generate a custom learning path.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseOutline) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border border-[#EFEFE3] shadow-sm">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-medium text-[#191919]">
                    Course Generation Failed
                  </h2>
                  <p className="text-base text-[#4b5563]">
                    {error || "We couldn't generate your course outline at this time. Please try again."}
                  </p>
                </div>
                {onRetryGeneration && (
                  <Button 
                    onClick={onRetryGeneration}
                    className="bg-[#191919] hover:bg-[#333333] text-white rounded-full"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const firstName = employeeName.split(' ')[0];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[960px] mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-semibold text-[#191919]">
            Welcome back, {firstName}
          </h1>
          <p className="text-base text-[#4b5563]">
            Your personalized course outline is ready
          </p>
        </motion.div>

        {/* Main Course Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="border border-[#EFEFE3] shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Course Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", difficultyColors[courseOutline.difficultyLevel])}>
                      {courseOutline.difficultyLevel}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-medium text-[#191919]">
                    {courseOutline.title}
                  </h2>
                  <p className="text-base text-[#4b5563]">
                    {courseOutline.description}
                  </p>
                </div>

                {/* Course Statistics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#EFEFE3] rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-medium text-[#191919]">
                      {courseOutline.modules.length}
                    </div>
                    <div className="text-xs text-[#888888]">modules</div>
                  </div>
                  <div className="text-center border-x border-[#E5E7EB]">
                    <div className="text-xl font-medium text-[#191919]">
                      {courseOutline.totalDuration}
                    </div>
                    <div className="text-xs text-[#888888]">duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-medium text-[#191919]">
                      {courseOutline.estimatedWeeks}
                    </div>
                    <div className="text-xs text-[#888888]">weeks</div>
                  </div>
                </div>

              {/* Learning Objectives */}
              {courseOutline.learningObjectives.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-[#191919]">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2">
                    {courseOutline.learningObjectives.slice(0, 4).map((objective, index) => (
                      <li key={index} className="text-sm text-[#4b5563] pl-4 relative">
                        <span className="absolute left-0">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Modules */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-[#191919]">
                  Course Modules
                </h3>
                <div className="space-y-3">
                  {courseOutline.modules.slice(0, 4).map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                      className="border border-[#E5E7EB] rounded-lg p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base text-[#191919]">
                            {index + 1}. {module.name}
                          </h4>
                          <span className="text-xs text-[#888888]">
                            {module.duration}
                          </span>
                        </div>
                        {module.description && (
                          <p className="text-sm text-[#4b5563]">
                            {module.description}
                          </p>
                        )}
                        {module.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {module.topics.slice(0, 3).map((topic, topicIndex) => (
                              <Badge
                                key={topicIndex}
                                variant="secondary"
                                className="text-xs bg-[#F3F4F6] text-[#4B5563] border-0"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {courseOutline.modules.length > 4 && (
                    <p className="text-sm text-[#888888] text-center pt-2">
                      + {courseOutline.modules.length - 4} more modules
                    </p>
                  )}
                </div>
              </div>


              {/* Call to Action */}
              <div className="pt-6 space-y-6 border-t border-[#EFEFE3]">
                <div className="space-y-2 text-center">
                  <h3 className="text-base font-medium text-[#191919]">
                    Ready to advance your career?
                  </h3>
                  <p className="text-sm text-[#4b5563]">
                    This course is tailored to your skills and career goals.
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  {(onStartCourse || onStartLearning) && (
                    <Button 
                      onClick={onStartCourse || onStartLearning}
                      className="bg-[#191919] hover:bg-[#333333] text-white rounded-full px-8 h-11"
                    >
                      Yes, I'm interested
                    </Button>
                  )}
                  {(onViewFullCourse || onSkip) && (
                    <Button 
                      onClick={onViewFullCourse || onSkip}
                      variant="outline"
                      className="border-[#191919] text-[#191919] hover:bg-[#EFEFE3] rounded-full px-6 h-11"
                    >
                      Provide feedback
                    </Button>
                  )}
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default CourseOutlineReward;

// Re-export types for convenience
export type { CourseModule, CourseOutlineData, CourseOutlineRewardProps } from './CourseOutlineReward.types';