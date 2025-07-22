import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Target,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  PlayCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CourseModule, 
  CourseOutlineData, 
  CourseOutlineRewardProps 
} from './CourseOutlineReward.types';

const moduleIcons = [
  BookOpen,
  Target,
  Users,
  TrendingUp,
  GraduationCap,
  Award
];

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800'
};

const CourseOutlineReward: React.FC<CourseOutlineRewardProps> = ({
  courseOutline,
  employeeName = 'there',
  loading = false,
  error = null,
  onStartCourse,
  onViewFullCourse,
  onRetryGeneration
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Creating Your Personalized Course...
                  </h2>
                  <p className="text-gray-600">
                    Our AI is analyzing your profile and generating a custom learning path just for you.
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-red-200 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Target className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Course Generation Failed
                  </h2>
                  <p className="text-gray-600">
                    {error || "We couldn't generate your course outline at this time. Please try again."}
                  </p>
                </div>
                {onRetryGeneration && (
                  <Button 
                    onClick={onRetryGeneration}
                    className="bg-red-600 hover:bg-red-700"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Congratulations Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Award className="h-12 w-12 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Congratulations, {firstName}! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Your personalized learning course is ready
            </p>
          </div>
        </motion.div>

        {/* Main Course Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-green-200 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", difficultyColors[courseOutline.difficultyLevel])}>
                      {courseOutline.difficultyLevel}
                    </Badge>
                    {courseOutline.certificateAvailable && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Certificate
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl text-gray-900 leading-tight">
                    {courseOutline.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {courseOutline.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Course Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {courseOutline.modules.length}
                    </div>
                    <div className="text-sm text-blue-700">modules</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {courseOutline.totalDuration}
                    </div>
                    <div className="text-sm text-green-700">total time</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {courseOutline.estimatedWeeks}
                    </div>
                    <div className="text-sm text-purple-700">weeks</div>
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              {courseOutline.learningObjectives.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    What You'll Learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {courseOutline.learningObjectives.slice(0, 6).map((objective, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Modules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Course Modules
                </h3>
                <div className="space-y-4">
                  {courseOutline.modules.slice(0, 4).map((module, index) => {
                    const IconComponent = moduleIcons[index % moduleIcons.length];
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  Module {index + 1}: {module.name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {module.duration}
                                </Badge>
                              </div>
                              {module.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {module.description}
                                </p>
                              )}
                              {module.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {module.topics.slice(0, 3).map((topic, topicIndex) => (
                                    <Badge
                                      key={topicIndex}
                                      variant="secondary"
                                      className="text-xs bg-gray-100"
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                  {module.topics.length > 3 && (
                                    <Badge variant="secondary" className="text-xs bg-gray-100">
                                      +{module.topics.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {courseOutline.modules.length > 4 && (
                    <div className="text-center py-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        + {courseOutline.modules.length - 4} more modules to discover
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills to Gain */}
              {courseOutline.skillsToGain.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Skills You'll Gain
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {courseOutline.skillsToGain.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="text-center space-y-4 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {onStartCourse && (
                    <Button 
                      onClick={onStartCourse}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Learning
                    </Button>
                  )}
                  {onViewFullCourse && (
                    <Button 
                      onClick={onViewFullCourse}
                      variant="outline"
                      size="lg"
                      className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3"
                    >
                      View Full Course
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Next Steps:</strong> Your course will be available in your learning dashboard. 
                    You'll receive a notification once it's ready to start.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            🚀 Ready to advance your career? Your learning journey starts now!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseOutlineReward;

// Re-export types for convenience
export type { CourseModule, CourseOutlineData, CourseOutlineRewardProps } from './CourseOutlineReward.types';