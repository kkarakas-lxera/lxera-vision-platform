import React, { createContext, useContext, useState, useCallback } from 'react';
import CourseGenerationTracker from '@/components/CourseGenerationTracker';

interface CourseGenerationContextType {
  startGeneration: (jobId: string) => void;
  hideTracker: () => void;
  currentJobId: string | null;
}

const CourseGenerationContext = createContext<CourseGenerationContextType | undefined>(undefined);

export const CourseGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showTracker, setShowTracker] = useState(false);

  const startGeneration = useCallback((jobId: string) => {
    setCurrentJobId(jobId);
    setShowTracker(true);
  }, []);

  const hideTracker = useCallback(() => {
    setShowTracker(false);
  }, []);

  return (
    <CourseGenerationContext.Provider value={{ startGeneration, hideTracker, currentJobId }}>
      {children}
      {showTracker && <CourseGenerationTracker jobId={currentJobId || undefined} />}
    </CourseGenerationContext.Provider>
  );
};

export const useCourseGeneration = () => {
  const context = useContext(CourseGenerationContext);
  if (!context) {
    throw new Error('useCourseGeneration must be used within CourseGenerationProvider');
  }
  return context;
};