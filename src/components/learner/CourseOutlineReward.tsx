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
  Loader2,
  Calendar,
  Target,
  Award,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CourseModule, 
  CourseOutlineData, 
  CourseOutlineRewardProps 
} from './CourseOutlineReward.types';

const difficultyColors = {
  Beginner: 'bg-[#dcfce7] text-[#15803d] border-0',
  Intermediate: 'bg-[#fef3c7] text-[#92400e] border-0',
  Advanced: 'bg-[#fee2e2] text-[#991b1b] border-0'
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
          <Card className="border border-[#E5E7EB] shadow-[0_6px_12px_rgba(25,25,25,0.05)]">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-[#7AE5C6] bg-opacity-20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-[#029c55] animate-spin" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-medium text-[#191919]">
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
          <Card className="border border-[#E5E7EB] shadow-[0_6px_12px_rgba(25,25,25,0.05)]">
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
                    className="bg-[#029c55] hover:bg-[#027a42] text-white rounded-full px-6 h-11 text-base"
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
          <h1 className="text-3xl font-medium text-[#191919]">
            Welcome back, {firstName}
          </h1>
          <p className="text-lg text-[#4b5563]">
            Your personalized course outline is ready
          </p>
        </motion.div>

        {/* Main Course Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="border border-[#E5E7EB] shadow-[0_8px_16px_rgba(25,25,25,0.06)]">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Course Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", difficultyColors[courseOutline.difficultyLevel])}>
                      {courseOutline.difficultyLevel}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-medium text-[#191919]">
                    {courseOutline.title}
                  </h2>
                  <p className="text-lg text-[#4b5563]">
                    {courseOutline.description}
                  </p>
                </div>

                {/* Course Statistics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#f7f9fa] rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-[#029c55]" />
                      <div className="text-2xl font-semibold text-[#191919]">
                        {courseOutline.modules.length}
                      </div>
                    </div>
                    <div className="text-sm text-[#888888]">modules</div>
                  </div>
                  <div className="text-center p-4 bg-[#f2f9ff] rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-[#0066ff]" />
                      <div className="text-2xl font-semibold text-[#191919]">
                        {courseOutline.totalDuration}
                      </div>
                    </div>
                    <div className="text-sm text-[#888888]">duration</div>
                  </div>
                  <div className="text-center p-4 bg-[#fff9f0] rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-[#ff6b00]" />
                      <div className="text-2xl font-semibold text-[#191919]">
                        {courseOutline.estimatedWeeks}
                      </div>
                    </div>
                    <div className="text-sm text-[#888888]">weeks</div>
                  </div>
                  <div className="text-center p-4 bg-[#f5f3ff] rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <PlayCircle className="h-4 w-4 text-[#8b5cf6]" />
                      <div className="text-2xl font-semibold text-[#191919]">
                        Rich
                      </div>
                    </div>
                    <div className="text-sm text-[#888888]">multimedia</div>
                  </div>
                </div>

                {/* Call to Action - Horizontal */}
                <div className="flex items-center justify-between p-6 bg-[#f7f9fa] rounded-xl">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#191919]">
                      Ready to advance your career?
                    </h3>
                    <p className="text-base text-[#4b5563] mt-1">
                      This course is tailored to your skills and career goals.
                    </p>
                  </div>
                  {(onStartCourse || onStartLearning) && (
                    <Button 
                      onClick={onStartCourse || onStartLearning}
                      className="bg-[#029c55] hover:bg-[#027a42] text-white rounded-full px-8 h-12 text-base font-medium shadow-[0_4px_12px_rgba(2,156,85,0.2)] transition-all hover:shadow-[0_6px_16px_rgba(2,156,85,0.3)] ml-6"
                    >
                      Yes, I want to grow my skills
                    </Button>
                  )}
                </div>

              {/* Learning Objectives */}
              {courseOutline.learningObjectives.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-[#191919]">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-3">
                    {courseOutline.learningObjectives.slice(0, 4).map((objective, index) => (
                      <li key={index} className="text-base text-[#4b5563] pl-6 relative">
                        <CheckCircle className="absolute left-0 top-0.5 h-4 w-4 text-[#029c55]" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Modules */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#191919]">
                  Course Modules
                </h3>
                <div className="space-y-3">
                  {courseOutline.modules.slice(0, 4).map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                      className="border border-[#E5E7EB] rounded-xl p-5 hover:shadow-[0_4px_12px_rgba(25,25,25,0.04)] transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-[#191919]">
                            {index + 1}. {module.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#888888]" />
                            <span className="text-sm text-[#888888]">
                              {module.duration}
                            </span>
                          </div>
                        </div>
                        {module.description && (
                          <p className="text-base text-[#4b5563] leading-relaxed">
                            {module.description}
                          </p>
                        )}
                        {module.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {module.topics.slice(0, 3).map((topic, topicIndex) => (
                              <Badge
                                key={topicIndex}
                                variant="secondary"
                                className="text-xs bg-[#f7f9fa] text-[#4B5563] border-0 px-3 py-1"
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
                    <p className="text-base text-[#888888] text-center pt-3">
                      + {courseOutline.modules.length - 4} more modules
                    </p>
                  )}
                </div>
              </div>


              {/* Feedback Section */}
              {(onViewFullCourse || onSkip) && (
                <div className="pt-8 border-t border-[#E5E7EB]">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-[#191919]">
                        Not quite what you need?
                      </h3>
                      <p className="text-base text-[#4b5563]">
                        Help us improve this course by sharing your feedback. Your input helps us create better learning experiences.
                      </p>
                    </div>
                    <Button 
                      onClick={onViewFullCourse || onSkip}
                      variant="outline"
                      className="border-[#E5E7EB] text-[#191919] hover:bg-[#f7f9fa] rounded-full px-6 h-12 text-base"
                    >
                      Help us improve this course
                    </Button>
                  </div>
                </div>
              )}
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