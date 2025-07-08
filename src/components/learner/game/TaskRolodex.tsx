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
import { SkillGapMissionService, type SkillGapMission } from '@/services/game/SkillGapMissionService';

interface Task {
  id: string;
  title: string;
  description: string;
  target_skill_name: string;
  current_skill_level: number;
  required_skill_level: number;
  skill_gap_size: number;
  gap_severity: 'critical' | 'moderate' | 'minor';
  position_title: string;
  department: string;
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

const DEPARTMENT_THEMES = {
  engineering: { icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  marketing: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  operations: { icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  hr: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  sales: { icon: Target, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  general: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50' }
};

const SEVERITY_THEMES = {
  critical: { emoji: '🔥', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
  moderate: { emoji: '⚡', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300' },
  minor: { emoji: '💡', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' }
};

export default function TaskRolodex({ onTaskSelect, onBackToCourse, courseContentId, currentSection, moduleId }: TaskRolodexProps) {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
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

      // Get employee ID and company
      const { data: employee } = await supabase
        .from('employees')
        .select('id, company_id')
        .eq('user_id', userProfile?.id)
        .single();

      if (!employee) throw new Error('Employee not found');
      setEmployeeId(employee.id);
      setCompanyId(employee.company_id);

      // Load skill gap based tasks
      await loadSkillGapTasks(employee.id, employee.company_id, courseContentId, currentSection, moduleId);
    } catch (error) {
      console.error('Error initializing rolodex:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadSkillGapTasks = async (employeeId: string, companyId: string, contentId?: string, section?: string, moduleId?: string) => {
    try {
      // Generate skill gap based missions
      const skillGapMissions = await SkillGapMissionService.generateSkillGapMissions(
        employeeId,
        companyId,
        contentId || moduleId,
        section
      );

      // Convert missions to Task format
      const tasks: Task[] = skillGapMissions.map(mission => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        target_skill_name: mission.target_skill_name,
        current_skill_level: mission.current_skill_level,
        required_skill_level: mission.required_skill_level,
        skill_gap_size: mission.skill_gap_size,
        gap_severity: mission.gap_severity,
        position_title: mission.position_title,
        department: mission.department,
        difficulty_level: mission.difficulty_level,
        points_value: mission.points_value,
        content_section_id: mission.content_section_id || '',
        module_content_id: mission.module_content_id,
        section_name: section
      }));

      setTasks(tasks.slice(0, 10)); // Show top 10 skill gaps
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
    
    // Show task selection - no need to update interest scores
    onTaskSelect(currentTask);
  };

  const handleSwipeLeft = async () => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !employeeId) return;
    
    // Move to next task - no need to track rejection
    nextTask();
  };

  // Category-based functions removed - now using skill gap data directly

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
  const departmentTheme = DEPARTMENT_THEMES[currentTask.department?.toLowerCase() as keyof typeof DEPARTMENT_THEMES] || DEPARTMENT_THEMES.general;
  const severityTheme = SEVERITY_THEMES[currentTask.gap_severity];
  const DepartmentIcon = departmentTheme.icon;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 px-4">
      {/* Header - More compact for mobile */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">🎡 Wheel of Learning</h2>
        <p className="text-sm text-muted-foreground">Swipe right to select, left to skip</p>
        <div className="flex justify-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-base">{severityTheme.emoji}</span>
            <span className={`${severityTheme.color} text-xs`}>{currentTask.gap_severity} gap</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-500" />
            <span className="text-xs">{currentIndex + 1}/{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Wheel Container - Smaller for mobile */}
      <div className="relative h-80 sm:h-96">
        {/* Wheel Background - Scaled down */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-gray-300 opacity-30"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-gray-200 opacity-50"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-gray-100 opacity-30"></div>
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
            <CardContent className="p-4 sm:p-6">
              <div className="h-full flex items-center justify-center">
                <div className="text-center opacity-50">
                  <h3 className="font-semibold text-sm sm:text-base">{task.title}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Current task card - Mobile optimized */}
        <Card 
          ref={cardRef}
          className={`absolute top-1/2 left-1/2 w-56 h-56 sm:w-72 sm:h-72 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 overflow-hidden ${
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
          {/* Circular Card Content - Mobile optimized */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            {/* Department Icon - Smaller for mobile */}
            <div className={`${departmentTheme.bg} rounded-full p-2 sm:p-3 mb-2 sm:mb-3 shadow-md`}>
              <DepartmentIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${departmentTheme.color}`} />
            </div>
            
            {/* Skill & Difficulty */}
            <div className="mb-2 sm:mb-3">
              <h3 className="font-bold text-sm sm:text-base text-gray-800 leading-tight">{currentTask.target_skill_name}</h3>
              <div className="flex gap-1 sm:gap-2 justify-center mt-1">
                <Badge className={`${getDifficultyColor(currentTask.difficulty_level)} text-xs px-2 py-1`}>
                  {currentTask.difficulty_level}
                </Badge>
                <Badge className={`${severityTheme.bg} ${severityTheme.color} text-xs px-2 py-1`}>
                  {currentTask.gap_severity}
                </Badge>
              </div>
            </div>
            
            {/* Task Title - Smaller for mobile */}
            <CardTitle className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 px-2 leading-tight" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden' 
            }}>
              {currentTask.title}
            </CardTitle>
            
            {/* Points Badge - Smaller */}
            <div className="mb-2 sm:mb-3">
              <Badge variant="outline" className="gap-1 bg-yellow-50 border-yellow-300 text-xs">
                <Trophy className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-700 font-semibold">{currentTask.points_value} pts</span>
              </Badge>
            </div>

            {/* Skill Level Progress - Smaller */}
            <div className="mb-2 sm:mb-3 w-full max-w-24 sm:max-w-32">
              <div className="text-xs text-muted-foreground mb-1">Skill Level</div>
              <Progress 
                value={(currentTask.current_skill_level / currentTask.required_skill_level) * 100} 
                className="h-1.5 sm:h-2" 
              />
              <div className="text-xs text-center mt-1">
                {currentTask.current_skill_level}/{currentTask.required_skill_level}
              </div>
            </div>

            {/* Swipe Instructions - Mobile optimized */}
            <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-between items-center px-4 sm:px-8">
              <div className="text-red-500 text-xs flex flex-col items-center">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />
                <div className="text-xs">Skip</div>
              </div>
              <div className="text-muted-foreground text-xs flex flex-col items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />
                <div className="text-xs">2-5m</div>
              </div>
              <div className="text-green-500 text-xs flex flex-col items-center">
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-auto" />
                <div className="text-xs">Select</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Swipe overlay indicators - Mobile sized */}
        {swipeDirection && (
          <div className={`absolute top-1/2 left-1/2 w-56 h-56 sm:w-72 sm:h-72 rounded-full flex items-center justify-center pointer-events-none z-20 ${
            swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
          style={{ transform: 'translate(-50%, -50%)' }}>
            <div className={`text-4xl sm:text-6xl font-bold ${
              swipeDirection === 'right' ? 'text-green-600' : 'text-red-600'
            }`}>
              {swipeDirection === 'right' ? '✓' : '✗'}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Manual controls - Mobile optimized */}
      <div className="flex justify-center gap-2 sm:gap-4">
        <Button variant="outline" size="icon" onClick={previousTask} className="h-8 w-8 sm:h-10 sm:w-10">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleSwipeLeft} className="text-red-600 text-xs sm:text-sm px-2 sm:px-3">
          ✗ Skip
        </Button>
        <Button onClick={handleSwipeRight} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-3">
          ✓ Select
        </Button>
        <Button variant="outline" size="icon" onClick={nextTask} className="h-8 w-8 sm:h-10 sm:w-10">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Back button */}
      <div className="text-center pt-2">
        <Button variant="ghost" onClick={onBackToCourse} className="text-sm">
          ← Back to Course
        </Button>
      </div>
    </div>
  );
}