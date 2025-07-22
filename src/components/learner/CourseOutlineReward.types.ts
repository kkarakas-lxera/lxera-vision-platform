// Types for CourseOutlineReward component

export interface CourseModule {
  id: string;
  name: string;
  description?: string;
  duration: string; // e.g., "2 hours", "1 week"
  topics: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites?: string[];
  estimatedCompletion?: string;
}

export interface CourseOutlineData {
  title: string;
  description: string;
  totalDuration: string; // e.g., "6-8 hours", "3 weeks"
  estimatedWeeks: number;
  modules: CourseModule[];
  learningObjectives: string[];
  skillsToGain: string[];
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  certificateAvailable: boolean;
  courseType?: 'Self-paced' | 'Instructor-led' | 'Blended';
  prerequisites?: string[];
  targetAudience?: string;
}

export interface CourseOutlineRewardProps {
  /**
   * The generated course outline data to display
   */
  courseOutline?: CourseOutlineData | null;
  
  /**
   * Employee's full name for personalization
   * If not provided, defaults to generic greeting
   */
  employeeName?: string;
  
  /**
   * Whether the course is still being generated
   */
  loading?: boolean;
  
  /**
   * Error message if course generation failed
   */
  error?: string | null;
  
  /**
   * Callback when user clicks "Start Learning" button
   */
  onStartCourse?: () => void;
  
  /**
   * Callback when user clicks "View Full Course" button
   */
  onViewFullCourse?: () => void;
  
  /**
   * Callback when user clicks "Try Again" on error state
   */
  onRetryGeneration?: () => void;
  
  /**
   * Custom CSS classes for the container
   */
  className?: string;
}

// Example data structure for integration
export const EXAMPLE_COURSE_OUTLINE: CourseOutlineData = {
  title: "Advanced React Development Mastery",
  description: "A comprehensive course designed to elevate your React skills from intermediate to advanced level, focusing on modern patterns, performance optimization, and scalable architecture.",
  totalDuration: "12-15 hours",
  estimatedWeeks: 4,
  difficultyLevel: "Advanced",
  certificateAvailable: true,
  courseType: "Self-paced",
  targetAudience: "Frontend developers with 2+ years React experience",
  learningObjectives: [
    "Master advanced React patterns and hooks",
    "Implement state management with Redux Toolkit",
    "Optimize React applications for performance",
    "Build scalable component architectures",
    "Implement testing strategies for React apps",
    "Deploy and monitor React applications"
  ],
  skillsToGain: [
    "Advanced React Patterns",
    "Performance Optimization",
    "State Management",
    "Component Architecture",
    "Testing Strategies",
    "Deployment & Monitoring",
    "TypeScript Integration",
    "API Integration"
  ],
  modules: [
    {
      id: "M01",
      name: "Advanced React Patterns",
      description: "Deep dive into advanced React patterns including render props, HOCs, and compound components",
      duration: "3-4 hours",
      difficulty: "Advanced",
      topics: ["Render Props", "Higher-Order Components", "Compound Components", "Custom Hooks"],
      prerequisites: ["Basic React knowledge", "JavaScript ES6+"]
    },
    {
      id: "M02", 
      name: "State Management & Redux Toolkit",
      description: "Master modern state management with Redux Toolkit and React Query",
      duration: "3-4 hours",
      difficulty: "Intermediate",
      topics: ["Redux Toolkit", "RTK Query", "Context API", "State Patterns"],
      prerequisites: ["Module 1 completion"]
    },
    {
      id: "M03",
      name: "Performance Optimization",
      description: "Learn to identify and fix performance bottlenecks in React applications",
      duration: "2-3 hours", 
      difficulty: "Advanced",
      topics: ["React Profiler", "Memoization", "Code Splitting", "Lazy Loading"],
      prerequisites: ["Understanding of React lifecycle"]
    },
    {
      id: "M04",
      name: "Testing & Deployment",
      description: "Comprehensive testing strategies and modern deployment practices",
      duration: "3-4 hours",
      difficulty: "Intermediate", 
      topics: ["Jest & React Testing Library", "E2E Testing", "CI/CD", "Monitoring"],
      prerequisites: ["All previous modules"]
    }
  ],
  prerequisites: [
    "2+ years React experience",
    "Strong JavaScript fundamentals",
    "Basic understanding of modern web development"
  ]
};