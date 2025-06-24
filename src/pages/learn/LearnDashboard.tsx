
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

const LearnDashboard = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockCourses = [
      {
        id: 1,
        title: 'Financial Analysis Fundamentals',
        description: 'Learn the basics of financial analysis and reporting',
        progress: 0,
        status: 'not_started',
        estimatedHours: 8,
        modules: 4
      },
      {
        id: 2,
        title: 'Excel for Financial Modeling',
        description: 'Advanced Excel techniques for financial professionals',
        progress: 0,
        status: 'not_started',
        estimatedHours: 12,
        modules: 6
      }
    ];
    
    setCourses(mockCourses);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {userProfile?.full_name}</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {/* Welcome Banner for First Login */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span>Welcome to Your Learning Platform!</span>
          </CardTitle>
          <CardDescription>
            Your personalized courses have been prepared based on your role as {userProfile?.position}. 
            Start with the fundamentals and progress at your own pace.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Learning Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20h</div>
            <p className="text-xs text-muted-foreground">Estimated total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1st</div>
            <p className="text-xs text-muted-foreground">Module completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                  <Badge variant={course.status === 'not_started' ? 'secondary' : 'default'}>
                    {course.status === 'not_started' ? 'Ready to Start' : course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.estimatedHours} hours
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.modules} modules
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <Button className="w-full" variant={course.status === 'not_started' ? 'default' : 'outline'}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {course.status === 'not_started' ? 'Start Course' : 'Continue Learning'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your learning milestones and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Start your first course to see your progress here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnDashboard;
