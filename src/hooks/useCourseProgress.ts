import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  estimatedTimeRemaining: number;
  lastAccessedAt: string;
}

export const useCourseProgress = () => {
  const { user } = useAuth();
  const [currentCourseProgress, setCurrentCourseProgress] = useState<CourseProgress | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCourseProgress = async () => {
      try {
        // This would typically fetch from Supabase
        // For now, simulate with mock data
        const mockProgress: CourseProgress = {
          courseId: '1',
          courseName: 'React Fundamentals',
          progress: 65,
          completedLessons: 13,
          totalLessons: 20,
          estimatedTimeRemaining: 120, // minutes
          lastAccessedAt: new Date().toISOString()
        };

        // Simulate enrolled state
        setIsEnrolled(true);
        setCurrentCourseProgress(mockProgress);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        setIsEnrolled(false);
        setCurrentCourseProgress(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseProgress();
  }, [user]);

  const updateProgress = (courseId: string, newProgress: number) => {
    if (currentCourseProgress && currentCourseProgress.courseId === courseId) {
      setCurrentCourseProgress(prev => prev ? {
        ...prev,
        progress: newProgress,
        lastAccessedAt: new Date().toISOString()
      } : null);
    }
  };

  return {
    currentCourseProgress,
    isEnrolled,
    loading,
    updateProgress
  };
};