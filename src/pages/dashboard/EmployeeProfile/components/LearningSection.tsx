import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  Trophy,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  course_id: string;
  course_title: string;
  status: string;
  progress_percentage: number;
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  quiz_score?: number;
}

interface LearningSectionProps {
  employee: {
    courses?: Course[];
  };
}

export function LearningSection({ employee }: LearningSectionProps) {
  const [activeTab, setActiveTab] = useState('active');

  const courses = employee.courses || [];
  const activeCourses = courses.filter(c => c.status === 'in_progress' || c.status === 'not_started' || c.status === 'assigned');
  const completedCourses = courses.filter(c => c.status === 'completed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'completed';
    
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'assigned':
        return <Badge variant="outline">Assigned</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalCourses = courses.length;
    const completedCount = completedCourses.length;
    const avgScore = completedCourses.length > 0
      ? completedCourses.reduce((sum, c) => sum + (c.quiz_score || 0), 0) / completedCourses.length
      : 0;
    const totalHours = completedCourses.length * 6; // Assuming 6 hours per course average

    return { totalCourses, completedCount, avgScore, totalHours };
  };

  const stats = calculateStats();

  const renderCourseCard = (course: Course) => {
    const isOverdue = course.due_date && new Date(course.due_date) < new Date() && course.status !== 'completed';

    return (
      <div
        key={course.id}
        className={`p-4 border rounded-lg space-y-3 ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium flex items-center gap-2">
              {getStatusIcon(isOverdue ? 'overdue' : course.status)}
              {course.course_title}
            </h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Assigned: {formatDate(course.assigned_at)}
              </span>
              {course.due_date && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due: {formatDate(course.due_date)}
                </span>
              )}
            </div>
          </div>
          {getStatusBadge(course.status, course.due_date)}
        </div>

        {course.status !== 'completed' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{course.progress_percentage}%</span>
            </div>
            <Progress value={course.progress_percentage} className="h-2" />
          </div>
        )}

        {course.status === 'completed' && course.quiz_score !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Quiz Score</span>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">{course.quiz_score}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning & Development
          </CardTitle>
          <Button variant="outline" size="sm">
            Assign Course
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Courses ({activeCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activeCourses.length > 0 ? (
              activeCourses.map(renderCourseCard)
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active courses</p>
                <Button className="mt-4" variant="outline" size="sm">
                  Browse Course Catalog
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats.completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(stats.avgScore)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats.totalHours}</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>
                </div>
                {completedCourses.map(renderCourseCard)}
              </>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No completed courses yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}