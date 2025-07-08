import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle,
  BarChart3,
  Target,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseProgress {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent: number;
  cm_module_content: {
    module_name: string;
    introduction: string;
  };
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpent: number;
  averageProgress: number;
  streak: number;
}

export default function Progress() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    streak: 0,
  });

  useEffect(() => {
    if (userProfile) {
      fetchProgressData();
    }
  }, [userProfile]);

  const fetchProgressData = async () => {
    try {
      // Get employee record linked to this user
      const { data: employees } = await supabase
        .from('employees')
        .select('id, learning_streak')
        .eq('user_id', userProfile?.id);
      
      const employee = employees?.[0];
      if (!employee) {
        toast.error('Employee profile not found');
        return;
      }

      // Fetch course assignments with progress
      const { data: assignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          progress_percentage,
          status,
          started_at,
          completed_at,
          time_spent
        `)
        .eq('employee_id', employee.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      let progressData: CourseProgress[] = [];
      
      if (assignments && assignments.length > 0) {
        const progressWithContent = await Promise.all(
          assignments.map(async (assignment) => {
            const { data: content } = await supabase
              .from('cm_module_content')
              .select('module_name, introduction')
              .eq('content_id', assignment.course_id)
              .single();
            
            return {
              ...assignment,
              cm_module_content: content || { module_name: 'Unknown Course', introduction: '' }
            };
          })
        );
        
        progressData = progressWithContent;
      }

      setCourseProgress(progressData);

      // Calculate statistics
      const totalCourses = progressData.length;
      const completedCourses = progressData.filter(p => p.status === 'completed').length;
      const inProgressCourses = progressData.filter(p => p.status === 'in_progress').length;
      const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0);
      const averageProgress = totalCourses > 0 
        ? progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalCourses
        : 0;

      setStats({
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalTimeSpent,
        averageProgress,
        streak: employee.learning_streak || 0,
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${Math.round(remainingMinutes)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Learning Progress</h1>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Track your journey</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</div>
            <p className="text-xs text-muted-foreground">Average across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalCourses} courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Course Progress</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {courseProgress.map((progress) => (
            <Card key={progress.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{progress.cm_module_content.module_name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {progress.cm_module_content.introduction}
                      </p>
                    </div>
                    <Badge className={getStatusColor(progress.status)}>
                      {progress.status === 'completed' ? 'Completed' : 
                       progress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress.progress_percentage || 0}%</span>
                    </div>
                    <ProgressBar value={progress.progress_percentage || 0} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time spent: {formatTime(progress.time_spent || 0)}</span>
                    </div>
                    {progress.started_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Started: {new Date(progress.started_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courseProgress.length === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-foreground">No courses assigned yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your learning journey will appear here once courses are assigned to you.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}