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
  module_content_id?: string;
  section_name?: string;
}

interface TaskRolodexProps {
  onTaskSelect: (task: Task) => void;
  onBackToCourse: () => void;
  courseContentId?: string;
  currentSection?: string;
  moduleId?: string;
}

const CATEGORIES = {
  finance: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  marketing: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  hr: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  production: { icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
  general: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50' }
};

export default function TaskRolodex({ onTaskSelect, onBackToCourse, courseContentId, currentSection, moduleId }: TaskRolodexProps) {
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
      await loadTasks(employee.id, interestMap, courseContentId, currentSection, moduleId);
    } catch (error) {
      console.error('Error initializing rolodex:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (employeeId: string, interests: Record<string, number>, contentId?: string, section?: string, moduleId?: string) => {
    try {
      // Get content from cm_module_content
      let query = supabase
        .from('cm_module_content')
        .select('*');
      
      // Filter by content_id if provided
      if (contentId || moduleId) {
        query = query.eq('content_id', moduleId || contentId);
      }
      
      const { data: modules } = await query;
      if (!modules || modules.length === 0) return;

      // Convert module content to task sections
      const contentSections: any[] = [];
      const sectionNames = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'];
      
      for (const module of modules) {
        // If specific section requested, only use that one
        const sectionsToProcess = section ? [section] : sectionNames;
        
        for (const sectionName of sectionsToProcess) {
          const sectionContent = module[sectionName];
          if (sectionContent && sectionContent.trim() && sectionContent !== 'Content will be available when unlocked') {
            contentSections.push({
              section_id: `${module.content_id}-${sectionName}`,
              content_id: module.content_id,
              section_name: sectionName,
              title: sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              content: sectionContent,
              module_name: module.module_name
            });
          }
        }
      }

      // Create tasks from content sections with intelligent categorization
      const generatedTasks: Task[] = [];
      
      for (const section of contentSections) {
        // Determine category based on content keywords
        const category = determineCategory(section.content || '', section.title || '');
        
        // Generate multiple difficulty levels for each section
        const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
        const pointValues = { easy: 15, medium: 20, hard: 30 };
        
        // Create one task per difficulty level
        difficulties.forEach((difficulty, idx) => {
          generatedTasks.push({
            id: `task-${section.section_id}-${difficulty}`,
            title: generateTaskTitle(section.title || section.section_name || 'Learning Challenge', category, difficulty),
            description: generateTaskDescription(section.content?.substring(0, 200) || '', category, difficulty),
            category,
            difficulty_level: difficulty,
            points_value: pointValues[difficulty],
            content_section_id: section.section_id,
            module_content_id: section.content_id,
            section_name: section.section_name
          });
        });
        
      }

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

  const determineCategory = (content: string, title: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    
    // Keywords for each category
    const categoryKeywords = {
      finance: ['budget', 'cost', 'revenue', 'profit', 'financial', 'investment', 'roi', 'expense', 'accounting', 'cash flow'],
      marketing: ['marketing', 'brand', 'customer', 'campaign', 'advertising', 'promotion', 'sales', 'market', 'audience', 'engagement'],
      hr: ['employee', 'team', 'culture', 'recruitment', 'performance', 'training', 'development', 'talent', 'hr', 'human resources'],
      production: ['production', 'operations', 'efficiency', 'process', 'quality', 'manufacturing', 'supply chain', 'logistics', 'workflow', 'optimization']
    };
    
    // Count keyword matches for each category
    let maxMatches = 0;
    let bestCategory = 'general';
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  };

  const generateTaskTitle = (baseTitle: string, category: string, difficulty: string): string => {
    const prefixes = {
      finance: {
        easy: ['💰 Finance Basics:', '📊 Budget Introduction:', '💳 Financial Fundamentals:'],
        medium: ['💰 Finance Challenge:', '📊 Budget Analysis:', '💳 Financial Strategy:'],
        hard: ['💰 Finance Mastery:', '📊 Advanced Budgeting:', '💳 Financial Excellence:']
      },
      marketing: {
        easy: ['📈 Marketing Basics:', '🎯 Brand Essentials:', '📱 Campaign Fundamentals:'],
        medium: ['📈 Marketing Mission:', '🎯 Brand Builder:', '📱 Campaign Creator:'],
        hard: ['📈 Marketing Mastery:', '🎯 Brand Excellence:', '📱 Campaign Expert:']
      },
      hr: {
        easy: ['👥 People Basics:', '🎓 Team Essentials:', '💼 HR Fundamentals:'],
        medium: ['👥 People Power:', '🎓 Team Builder:', '💼 HR Challenge:'],
        hard: ['👥 People Excellence:', '🎓 Team Mastery:', '💼 HR Expert:']
      },
      production: {
        easy: ['⚙️ Operations Basics:', '🏭 Process Essentials:', '📦 Efficiency 101:'],
        medium: ['⚙️ Production Pro:', '🏭 Operations Quest:', '📦 Efficiency Expert:'],
        hard: ['⚙️ Operations Mastery:', '🏭 Production Excellence:', '📦 Peak Efficiency:']
      },
      general: {
        easy: ['🎯 Quick Review:', '💡 Knowledge Check:', '📚 Learning Basics:'],
        medium: ['🎯 Quick Challenge:', '💡 Knowledge Test:', '📚 Learning Quest:'],
        hard: ['🎯 Expert Challenge:', '💡 Knowledge Mastery:', '📚 Advanced Learning:']
      }
    };
    
    const categoryPrefixes = prefixes[category as keyof typeof prefixes] || prefixes.general;
    const difficultyPrefixes = categoryPrefixes[difficulty as keyof typeof categoryPrefixes] || categoryPrefixes.medium;
    const prefix = difficultyPrefixes[Math.floor(Math.random() * difficultyPrefixes.length)];
    
    return `${prefix} ${baseTitle}`;
  };

  const generateTaskDescription = (baseContent: string, category: string, difficulty: string): string => {
    const templates = {
      finance: {
        easy: 'Learn the fundamentals of financial management and basic budgeting concepts.',
        medium: 'Apply financial knowledge to solve real-world budget optimization challenges.',
        hard: 'Master advanced financial strategies and complex investment decisions.'
      },
      marketing: {
        easy: 'Understand core marketing principles and customer engagement basics.',
        medium: 'Develop effective marketing strategies and campaign optimization skills.',
        hard: 'Lead strategic marketing initiatives and drive brand excellence.'
      },
      hr: {
        easy: 'Learn essential people management and team building fundamentals.',
        medium: 'Build strong team cultures and effective performance management systems.',
        hard: 'Transform organizational culture and lead strategic HR initiatives.'
      },
      production: {
        easy: 'Understand basic operations and efficiency improvement concepts.',
        medium: 'Optimize production processes and implement quality improvements.',
        hard: 'Lead operational excellence and strategic process transformation.'
      },
      general: {
        easy: 'Build foundational knowledge in this important area.',
        medium: 'Apply your knowledge to solve practical challenges.',
        hard: 'Demonstrate mastery and strategic thinking in this domain.'
      }
    };
    
    const categoryTemplates = templates[category as keyof typeof templates] || templates.general;
    const template = categoryTemplates[difficulty as keyof typeof categoryTemplates] || categoryTemplates.medium;
    
    // Add snippet of actual content if available
    if (baseContent && baseContent.trim()) {
      const snippet = baseContent.substring(0, 100).trim();
      return `${template} Topic focus: "${snippet}..."`;  
    }
    
    return template;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    e.preventDefault();
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(-50%, -50%) translateX(${diff}px) rotate(${diff * 0.1}deg)`;
      
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
        cardRef.current.style.transform = 'translate(-50%, -50%) translateX(0px) rotate(0deg)';
      }
    }
    
    setSwiping(false);
    setSwipeDirection(null);
  };

  // Mouse event handlers for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swiping) return;
    e.preventDefault();
    
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(-50%, -50%) translateX(${diff}px) rotate(${diff * 0.1}deg)`;
      
      if (Math.abs(diff) > 50) {
        setSwipeDirection(diff > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleMouseUp = () => {
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
        cardRef.current.style.transform = 'translate(-50%, -50%) translateX(0px) rotate(0deg)';
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
      cardRef.current.style.transition = 'transform 0.3s ease-out';
      cardRef.current.style.transform = 'translate(-50%, -50%) translateX(0px) rotate(0deg)';
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 300);
    }
    setCurrentIndex((prev) => (prev + 1) % tasks.length);
  };

  const previousTask = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out';
      cardRef.current.style.transform = 'translate(-50%, -50%) translateX(0px) rotate(0deg)';
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 300);
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
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">🎡 Wheel of Learning</h2>
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

      {/* Wheel Container */}
      <div className="relative h-96">
        {/* Wheel Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 rounded-full border-4 border-dashed border-gray-300 opacity-30"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border-2 border-gray-200 opacity-50"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-gray-100 opacity-30"></div>
        </div>

        {/* Task Card Stack */}
        <div className="relative h-full">
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

        {/* Current task card - Wheel-like design */}
        <Card 
          ref={cardRef}
          className={`absolute top-1/2 left-1/2 w-72 h-72 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden ${
            swipeDirection === 'right' ? 'border-green-500 shadow-green-200 shadow-2xl scale-105' : 
            swipeDirection === 'left' ? 'border-red-500 shadow-red-200 shadow-2xl scale-105' : 
            'border-primary shadow-xl hover:shadow-2xl'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            zIndex: 10,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Circular Card Content */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Category Icon - Top */}
            <div className={`${categoryBg} rounded-full p-4 mb-4 shadow-md`}>
              <CategoryIcon className={`h-8 w-8 ${categoryColor}`} />
            </div>
            
            {/* Category & Difficulty */}
            <div className="mb-3">
              <h3 className="font-bold text-lg capitalize text-gray-800">{currentTask.category}</h3>
              <Badge className={`${getDifficultyColor(currentTask.difficulty_level)} text-xs`}>
                {currentTask.difficulty_level}
              </Badge>
            </div>
            
            {/* Task Title - Center */}
            <CardTitle className="text-base font-semibold mb-3 px-2 leading-tight" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden' 
            }}>
              {currentTask.title}
            </CardTitle>
            
            {/* Points Badge */}
            <div className="mb-4">
              <Badge variant="outline" className="gap-1 bg-yellow-50 border-yellow-300">
                <Trophy className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-700 font-semibold">{currentTask.points_value} pts</span>
              </Badge>
            </div>

            {/* Interest Level */}
            <div className="mb-4 w-full max-w-32">
              <div className="text-xs text-muted-foreground mb-1">Interest Level</div>
              <Progress 
                value={Math.min(100, (interestScores[currentTask.category] || 0) * 10)} 
                className="h-2" 
              />
              <div className="text-xs text-center mt-1">{interestScores[currentTask.category] || 0} pts</div>
            </div>

            {/* Swipe Instructions - Bottom */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8">
              <div className="text-red-500 text-xs">
                <ChevronLeft className="h-4 w-4 mx-auto" />
                <div>Skip</div>
              </div>
              <div className="text-muted-foreground text-xs">
                <Clock className="h-4 w-4 mx-auto" />
                <div>2-5m</div>
              </div>
              <div className="text-green-500 text-xs">
                <ChevronRight className="h-4 w-4 mx-auto" />
                <div>Select</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Swipe overlay indicators */}
        {swipeDirection && (
          <div className={`absolute top-1/2 left-1/2 w-72 h-72 rounded-full flex items-center justify-center pointer-events-none z-20 ${
            swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
          style={{ transform: 'translate(-50%, -50%)' }}>
            <div className={`text-6xl font-bold ${
              swipeDirection === 'right' ? 'text-green-600' : 'text-red-600'
            }`}>
              {swipeDirection === 'right' ? '✓' : '✗'}
            </div>
          </div>
        )}
        </div>
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