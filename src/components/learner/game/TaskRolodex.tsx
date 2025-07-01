import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Flame,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  points_value: number;
  content_section_id: string;
}

interface TaskRolodexProps {
  onTaskSelect: (task: Task) => void;
  onBackToCourse: () => void;
}

const CATEGORIES = {
  finance: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  marketing: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  hr: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  production: { icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
  general: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50' }
};

export default function TaskRolodex({ onTaskSelect, onBackToCourse }: TaskRolodexProps) {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [interestScores, setInterestScores] = useState<Record<string, number>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    if (userProfile) {
      initializeRolodex();
    }
  }, [userProfile]);

  const initializeRolodex = async () => {
    try {
      setLoading(true);

      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (!employee) throw new Error('Employee not found');
      setEmployeeId(employee.id);

      // Load interest scores
      const { data: interests } = await supabase
        .from('employee_interest_scores')
        .select('category, interest_score')
        .eq('employee_id', employee.id);

      const interestMap: Record<string, number> = {};
      interests?.forEach(interest => {
        interestMap[interest.category] = interest.interest_score;
      });
      setInterestScores(interestMap);

      // Load available tasks
      await loadTasks(employee.id, interestMap);
    } catch (error) {
      console.error('Error initializing rolodex:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (employeeId: string, interests: Record<string, number>) => {
    try {
      // Get available tasks from content sections
      const { data: contentSections } = await supabase
        .from('cm_content_sections')
        .select('*')
        .order('created_at');

      if (!contentSections) return;

      // Create tasks from content sections with AI-generated variety
      const generatedTasks: Task[] = contentSections.map((section, index) => {
        const categories = ['finance', 'marketing', 'hr', 'production'];
        const difficulties = ['easy', 'medium', 'hard'];
        const pointValues = { easy: 10, medium: 20, hard: 50 };
        
        const category = categories[index % categories.length];
        const difficulty = difficulties[index % difficulties.length];
        
        return {
          id: `task-${section.section_id}-${index}`,
          title: generateTaskTitle(section.title || 'Learning Challenge', category),
          description: generateTaskDescription(section.content?.substring(0, 100) || '', category),
          category,
          difficulty_level: difficulty,
          points_value: pointValues[difficulty as keyof typeof pointValues],
          content_section_id: section.section_id
        };
      });

      // Sort tasks by interest scores (higher interest first)
      const sortedTasks = generatedTasks.sort((a, b) => {
        const aScore = interests[a.category] || 0;
        const bScore = interests[b.category] || 0;
        return bScore - aScore;
      });

      setTasks(sortedTasks.slice(0, 10)); // Limit to 10 tasks for demo
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const generateTaskTitle = (baseTitle: string, category: string): string => {
    const prefixes = {
      finance: ['💰 Finance Challenge:', '📊 Budget Master:', '💳 Financial Quiz:'],
      marketing: ['📈 Marketing Mission:', '🎯 Brand Builder:', '📱 Campaign Creator:'],
      hr: ['👥 People Power:', '🎓 Team Builder:', '💼 HR Challenge:'],
      production: ['⚙️ Production Pro:', '🏭 Operations Quest:', '📦 Efficiency Expert:'],
      general: ['🎯 Quick Challenge:', '💡 Knowledge Test:', '📚 Learning Quest:']
    };
    
    const categoryPrefixes = prefixes[category as keyof typeof prefixes] || prefixes.general;
    const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)];
    
    return `${prefix} ${baseTitle}`;
  };

  const generateTaskDescription = (baseContent: string, category: string): string => {
    const templates = {
      finance: 'Test your financial knowledge and help optimize our budget decisions...',
      marketing: 'Boost our marketing strategy with your creative insights and market knowledge...',
      hr: 'Help build a stronger team culture and improve our people management...',
      production: 'Optimize our operations and increase efficiency in production processes...',
      general: 'Expand your knowledge and contribute to our organizational success...'
    };
    
    return templates[category as keyof typeof templates] || templates.general;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
      
      if (Math.abs(diff) > 50) {
        setSwipeDirection(diff > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    
    const diff = currentXRef.current - startXRef.current;
    
    if (Math.abs(diff) > 100) {
      // Complete the swipe
      if (diff > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Snap back
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
      }
    }
    
    setSwiping(false);
    setSwipeDirection(null);
  };

  const handleSwipeRight = async () => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !employeeId) return;

    // Update interest score (+2 for selection)
    await updateInterestScore(currentTask.category, 2);
    
    // Show task selection
    onTaskSelect(currentTask);
  };

  const handleSwipeLeft = async () => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !employeeId) return;

    // Update interest score (-1 for rejection)
    await updateInterestScore(currentTask.category, -1);
    
    // Move to next task
    nextTask();
  };

  const updateInterestScore = async (category: string, change: number) => {
    if (!employeeId) return;

    try {
      const currentScore = interestScores[category] || 0;
      const newScore = Math.max(0, currentScore + change);

      await supabase
        .from('employee_interest_scores')
        .upsert({
          employee_id: employeeId,
          category,
          interest_score: newScore,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,category' });

      setInterestScores(prev => ({
        ...prev,
        [category]: newScore
      }));
    } catch (error) {
      console.error('Error updating interest score:', error);
    }
  };

  const nextTask = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
    }
    setCurrentIndex((prev) => (prev + 1) % tasks.length);
  };

  const previousTask = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
    }
    setCurrentIndex((prev) => (prev - 1 + tasks.length) % tasks.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your personalized tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Tasks Available</h3>
          <p className="text-muted-foreground mb-4">Complete more course content to unlock new challenges!</p>
          <Button onClick={onBackToCourse}>
            Back to Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentTask = tasks[currentIndex];
  const CategoryIcon = CATEGORIES[currentTask.category as keyof typeof CATEGORIES]?.icon || Target;
  const categoryColor = CATEGORIES[currentTask.category as keyof typeof CATEGORIES]?.color || 'text-gray-600';
  const categoryBg = CATEGORIES[currentTask.category as keyof typeof CATEGORIES]?.bg || 'bg-gray-50';

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">🎮 Task Rolodex</h2>
        <p className="text-muted-foreground">Swipe right to select, left to skip</p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>{Object.values(interestScores).reduce((a, b) => a + b, 0)} points</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-blue-500" />
            <span>{currentIndex + 1}/{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Task Card Stack */}
      <div className="relative h-96">
        {/* Background cards */}
        {tasks.slice(currentIndex + 1, currentIndex + 3).map((task, index) => (
          <Card 
            key={task.id}
            className={`absolute inset-0 transition-all duration-300 ${index === 0 ? 'scale-95 opacity-50' : 'scale-90 opacity-25'}`}
            style={{ 
              zIndex: -index - 1,
              transform: `scale(${0.95 - index * 0.05}) translateY(${index * 8}px)`
            }}
          >
            <CardContent className="p-6">
              <div className="h-full flex items-center justify-center">
                <div className="text-center opacity-50">
                  <h3 className="font-semibold">{task.title}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Current task card */}
        <Card 
          ref={cardRef}
          className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-200 ${
            swipeDirection === 'right' ? 'border-green-500 shadow-green-200' : 
            swipeDirection === 'left' ? 'border-red-500 shadow-red-200' : 
            'border-primary shadow-lg'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ zIndex: 10 }}
        >
          <CardHeader className={`${categoryBg} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryIcon className={`h-5 w-5 ${categoryColor}`} />
                <span className="font-medium capitalize">{currentTask.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentTask.difficulty_level)}>
                  {currentTask.difficulty_level}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {currentTask.points_value}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-lg">{currentTask.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentTask.description}</p>
            </div>

            {/* Interest indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Your interest in {currentTask.category}</span>
                <span>{interestScores[currentTask.category] || 0} points</span>
              </div>
              <Progress 
                value={Math.min(100, (interestScores[currentTask.category] || 0) * 10)} 
                className="h-2" 
              />
            </div>

            {/* Swipe indicators */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-2 text-red-500">
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Skip</span>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
                <span className="text-xs text-muted-foreground">2-5 min</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <span className="text-sm">Select</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swipe overlay indicators */}
        {swipeDirection && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 ${
            swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`text-6xl font-bold ${
              swipeDirection === 'right' ? 'text-green-600' : 'text-red-600'
            }`}>
              {swipeDirection === 'right' ? '✓' : '✗'}
            </div>
          </div>
        )}
      </div>

      {/* Manual controls */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" onClick={previousTask}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleSwipeLeft} className="text-red-600">
          ✗ Skip
        </Button>
        <Button onClick={handleSwipeRight} className="bg-green-600 hover:bg-green-700">
          ✓ Select
        </Button>
        <Button variant="outline" size="icon" onClick={nextTask}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Back button */}
      <div className="text-center">
        <Button variant="ghost" onClick={onBackToCourse}>
          ← Back to Course
        </Button>
      </div>
    </div>
  );
}