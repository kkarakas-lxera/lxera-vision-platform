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
        className={`p-3 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getStatusIcon(isOverdue ? 'overdue' : course.status)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{course.course_title}</h4>
              <p className="text-xs text-muted-foreground">
                Assigned: {formatDate(course.assigned_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge(course.status, course.due_date)}
            {course.status !== 'completed' && (
              <span className="text-xs font-medium">{course.progress_percentage}%</span>
            )}
            {course.status === 'completed' && course.quiz_score !== undefined && (
              <span className="text-xs font-medium">{course.quiz_score}%</span>
            )}
          </div>
        </div>
        {course.status !== 'completed' && (
          <Progress value={course.progress_percentage} className="h-1 mt-2" />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning & Development
          </CardTitle>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Assign Course
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="active" className="text-xs">
              Active ({activeCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-2 mt-3">
            {activeCourses.length > 0 ? (
              <div className="space-y-2">
                {activeCourses.slice(0, 3).map(renderCourseCard)}
                {activeCourses.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{activeCourses.length - 3} more courses
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active courses</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-2 mt-3">
            {completedCourses.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded text-center">
                  <div>
                    <p className="text-lg font-semibold">{stats.completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{Math.round(stats.avgScore)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stats.totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
                {completedCourses.slice(0, 3).map(renderCourseCard)}
                {completedCourses.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{completedCourses.length - 3} more courses
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No completed courses yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}