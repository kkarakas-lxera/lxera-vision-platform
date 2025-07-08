import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Users, 
  FileSearch, 
  PenTool, 
  Image, 
  Video, 
  CheckCircle2, 
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Loader2,
  ChevronRight,
  AlertCircle,
  FileText,
  Search,
  Zap,
  Package,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockCourseData = {
  title: "Advanced React Development",
  description: "Master modern React patterns and best practices",
  targetAudience: "Frontend Developers",
  duration: "6 weeks",
  modules: 12,
  estimatedTime: "25 minutes"
};

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  message?: string;
  progress?: number;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'completed';
  agents: Agent[];
  progress: number;
  estimatedTime: string;
  startTime?: Date;
  endTime?: Date;
}

export default function CourseGeneration() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'analysis',
      name: 'Skills Gap Analysis',
      description: 'Analyzing employee skills and identifying learning needs',
      icon: Users,
      status: 'pending',
      progress: 0,
      estimatedTime: '2 min',
      agents: [
        { id: 'data-retriever', name: 'Data Retriever', role: 'Fetching employee profiles', status: 'idle' },
        { id: 'skill-analyzer', name: 'Skills Analyzer', role: 'Analyzing skill gaps', status: 'idle' },
        { id: 'position-mapper', name: 'Position Mapper', role: 'Mapping job requirements', status: 'idle' }
      ]
    },
    {
      id: 'research',
      name: 'Content Research',
      description: 'Researching latest industry standards and best practices',
      icon: Search,
      status: 'pending',
      progress: 0,
      estimatedTime: '3 min',
      agents: [
        { id: 'web-researcher', name: 'Web Researcher', role: 'Searching online resources', status: 'idle' },
        { id: 'doc-analyzer', name: 'Document Analyzer', role: 'Analyzing documentation', status: 'idle' },
        { id: 'trend-scout', name: 'Trend Scout', role: 'Identifying industry trends', status: 'idle' }
      ]
    },
    {
      id: 'planning',
      name: 'Course Planning',
      description: 'Structuring course modules and learning objectives',
      icon: PenTool,
      status: 'pending',
      progress: 0,
      estimatedTime: '4 min',
      agents: [
        { id: 'curriculum-designer', name: 'Curriculum Designer', role: 'Creating course structure', status: 'idle' },
        { id: 'objective-setter', name: 'Objective Setter', role: 'Defining learning goals', status: 'idle' },
        { id: 'pace-optimizer', name: 'Pace Optimizer', role: 'Optimizing learning flow', status: 'idle' }
      ]
    },
    {
      id: 'content',
      name: 'Content Generation',
      description: 'Creating comprehensive course materials and exercises',
      icon: FileText,
      status: 'pending',
      progress: 0,
      estimatedTime: '8 min',
      agents: [
        { id: 'content-writer', name: 'Content Writer', role: 'Writing course materials', status: 'idle' },
        { id: 'example-creator', name: 'Example Creator', role: 'Creating practical examples', status: 'idle' },
        { id: 'quiz-generator', name: 'Quiz Generator', role: 'Generating assessments', status: 'idle' },
        { id: 'code-reviewer', name: 'Code Reviewer', role: 'Reviewing code samples', status: 'idle' }
      ]
    },
    {
      id: 'multimedia',
      name: 'Multimedia Creation',
      description: 'Generating visual aids and interactive elements',
      icon: Image,
      status: 'pending',
      progress: 0,
      estimatedTime: '5 min',
      agents: [
        { id: 'diagram-creator', name: 'Diagram Creator', role: 'Creating flowcharts', status: 'idle' },
        { id: 'slide-designer', name: 'Slide Designer', role: 'Designing presentations', status: 'idle' },
        { id: 'animation-builder', name: 'Animation Builder', role: 'Building animations', status: 'idle' }
      ]
    },
    {
      id: 'review',
      name: 'Quality Review',
      description: 'Ensuring content quality and accessibility',
      icon: CheckCircle2,
      status: 'pending',
      progress: 0,
      estimatedTime: '3 min',
      agents: [
        { id: 'quality-checker', name: 'Quality Checker', role: 'Reviewing content quality', status: 'idle' },
        { id: 'accessibility-auditor', name: 'Accessibility Auditor', role: 'Checking accessibility', status: 'idle' },
        { id: 'final-packager', name: 'Final Packager', role: 'Packaging course', status: 'idle' }
      ]
    }
  ]);

  // Simulate course generation process
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setPhases(prevPhases => {
        const updatedPhases = [...prevPhases];
        const activePhaseIndex = updatedPhases.findIndex(p => p.status === 'active');
        
        if (activePhaseIndex === -1) {
          // Start first phase
          updatedPhases[0].status = 'active';
          updatedPhases[0].startTime = new Date();
          return updatedPhases;
        }

        const activePhase = updatedPhases[activePhaseIndex];
        
        // Update progress
        if (activePhase.progress < 100) {
          activePhase.progress = Math.min(activePhase.progress + Math.random() * 15, 100);
          
          // Update agent statuses
          activePhase.agents.forEach(agent => {
            if (agent.status === 'idle' && Math.random() > 0.7) {
              agent.status = 'working';
              agent.progress = 0;
              agent.message = getAgentMessage(agent.id, 'start');
            } else if (agent.status === 'working') {
              agent.progress = Math.min((agent.progress || 0) + Math.random() * 20, 100);
              if (agent.progress >= 100) {
                agent.status = 'completed';
                agent.message = getAgentMessage(agent.id, 'complete');
              } else if (Math.random() > 0.8) {
                agent.message = getAgentMessage(agent.id, 'progress');
              }
            }
          });
          
          // Calculate overall progress
          const totalPhases = updatedPhases.length;
          const completedPhases = updatedPhases.filter(p => p.status === 'completed').length;
          const currentPhaseProgress = activePhase.progress / 100;
          setOverallProgress(((completedPhases + currentPhaseProgress) / totalPhases) * 100);
        } else {
          // Complete current phase and move to next
          activePhase.status = 'completed';
          activePhase.endTime = new Date();
          activePhase.agents.forEach(agent => {
            agent.status = 'completed';
            agent.progress = 100;
          });
          
          if (activePhaseIndex < updatedPhases.length - 1) {
            updatedPhases[activePhaseIndex + 1].status = 'active';
            updatedPhases[activePhaseIndex + 1].startTime = new Date();
            setCurrentPhase(activePhaseIndex + 1);
          } else {
            // All phases completed
            setIsGenerating(false);
            setOverallProgress(100);
          }
        }
        
        return updatedPhases;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const getAgentMessage = (agentId: string, type: 'start' | 'progress' | 'complete'): string => {
    const messages: Record<string, Record<string, string>> = {
      'data-retriever': {
        start: 'Connecting to employee database...',
        progress: 'Retrieved 247 employee profiles...',
        complete: 'Successfully fetched all employee data'
      },
      'skill-analyzer': {
        start: 'Analyzing skill distributions...',
        progress: 'Identified 15 skill gaps...',
        complete: 'Skill gap analysis complete'
      },
      'content-writer': {
        start: 'Generating course content...',
        progress: 'Writing module 3: Advanced Hooks...',
        complete: 'All modules written successfully'
      },
      'diagram-creator': {
        start: 'Creating visual diagrams...',
        progress: 'Designing component lifecycle diagram...',
        complete: 'Created 8 diagrams'
      }
    };
    
    return messages[agentId]?.[type] || `${type === 'start' ? 'Starting' : type === 'progress' ? 'Processing' : 'Completed'} task...`;
  };

  const startGeneration = () => {
    setIsGenerating(true);
    setCurrentPhase(0);
    setOverallProgress(0);
    setPhases(phases.map(phase => ({
      ...phase,
      status: 'pending',
      progress: 0,
      agents: phase.agents.map(agent => ({
        ...agent,
        status: 'idle',
        progress: 0,
        message: undefined
      }))
    })));
  };

  const getCurrentPhaseData = () => phases[currentPhase];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Course Generation</h1>
          <p className="text-muted-foreground mt-1">
            Generate personalized courses based on skills gaps
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={startGeneration} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Course...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate New Course
            </>
          )}
        </Button>
      </div>

      {/* Course Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>AI-generated based on current skills gaps</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Est. {mockCourseData.estimatedTime}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{mockCourseData.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Audience</p>
              <p className="font-medium">{mockCourseData.targetAudience}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{mockCourseData.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modules</p>
              <p className="font-medium">{mockCourseData.modules} modules</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      {(isGenerating || overallProgress > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
            <CardDescription>
              {isGenerating ? 'AI agents are working on your course...' : 'Course generation completed!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            {/* Phase Timeline */}
            <div className="flex items-center justify-between mt-6">
              {phases.map((phase, idx) => (
                <div key={phase.id} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    phase.status === 'completed' ? "bg-primary text-primary-foreground" :
                    phase.status === 'active' ? "bg-primary/20 text-primary border-2 border-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <phase.icon className="h-5 w-5" />
                    )}
                  </div>
                  {idx < phases.length - 1 && (
                    <div className={cn(
                      "w-8 md:w-16 h-0.5 mx-2",
                      phases[idx + 1].status !== 'pending' ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Phase Details */}
      {isGenerating && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <getCurrentPhaseData().icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{getCurrentPhaseData().name}</CardTitle>
                  <CardDescription>{getCurrentPhaseData().description}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                {Math.round(getCurrentPhaseData().progress)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={getCurrentPhaseData().progress} className="mb-6" />
            
            {/* Active Agents */}
            <div className="space-y-3">
              {getCurrentPhaseData().agents.map(agent => (
                <div 
                  key={agent.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    agent.status === 'working' ? "border-primary/50 bg-primary/5" :
                    agent.status === 'completed' ? "border-green-500/50 bg-green-50/50" :
                    "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        agent.status === 'working' ? "bg-primary animate-pulse" :
                        agent.status === 'completed' ? "bg-green-500" :
                        "bg-muted"
                      )} />
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    {agent.status === 'working' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {agent.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {agent.message && (
                    <p className="text-xs text-muted-foreground mt-2 ml-5">
                      {agent.message}
                    </p>
                  )}
                  {agent.status === 'working' && agent.progress !== undefined && (
                    <Progress value={agent.progress} className="h-1 mt-2 ml-5" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Summary */}
      {!isGenerating && overallProgress === 100 && (
        <Alert className="border-green-500/50 bg-green-50/50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>Course generation completed successfully!</span>
              <Button size="sm" variant="outline" className="ml-4">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy Course
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Phase Summary Cards */}
      {(isGenerating || overallProgress > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map(phase => (
            <Card 
              key={phase.id}
              className={cn(
                "transition-all",
                phase.status === 'active' && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <phase.icon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{phase.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={
                      phase.status === 'completed' ? 'default' :
                      phase.status === 'active' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {phase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={phase.progress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{phase.agents.length} agents</span>
                    <span>{phase.estimatedTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}