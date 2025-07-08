import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Users, 
  Search, 
  PenTool, 
  FileText, 
  Image, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Terminal,
  Activity,
  Zap,
  ChevronRight,
  Circle,
  ArrowRight,
  Target,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock skills gap data that would come from your system
const mockSkillsGapData = {
  position: "Senior Frontend Developer",
  totalEmployees: 47,
  analyzedEmployees: 43,
  topMissingSkills: [
    { skill: "React Server Components", gap: 78, employees: 34 },
    { skill: "Performance Optimization", gap: 65, employees: 28 },
    { skill: "Advanced TypeScript", gap: 52, employees: 22 },
    { skill: "State Management (Zustand/Jotai)", gap: 45, employees: 19 },
    { skill: "Testing (Vitest/RTL)", gap: 38, employees: 16 }
  ],
  averageGapScore: 68,
  criticalGaps: 3
};

interface AgentActivity {
  timestamp: string;
  agent: string;
  action: string;
  status: 'info' | 'success' | 'warning';
}

export default function CourseGenerationCompact() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const phases = [
    {
      id: 'analysis',
      name: 'Gap Analysis',
      icon: Users,
      duration: '1m',
      agents: ['gap-analyzer', 'priority-mapper', 'requirement-checker'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'research',
      name: 'Research',
      icon: Search,
      duration: '3m',
      agents: ['content-researcher', 'best-practice-finder', 'resource-collector'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'planning',
      name: 'Planning',
      icon: PenTool,
      duration: '2m',
      agents: ['curriculum-designer', 'learning-path-creator', 'module-organizer'],
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      id: 'content',
      name: 'Content Gen',
      icon: FileText,
      duration: '5m',
      agents: ['content-writer', 'example-creator', 'exercise-generator', 'code-validator'],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'multimedia',
      name: 'Multimedia',
      icon: Image,
      duration: '3m',
      agents: ['diagram-creator', 'visual-designer', 'interactive-builder'],
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'review',
      name: 'QA & Deploy',
      icon: CheckCircle2,
      duration: '2m',
      agents: ['quality-checker', 'gap-validator', 'deployment-agent'],
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  const [phaseStates, setPhaseStates] = useState(
    phases.map(p => ({ 
      ...p, 
      status: 'pending' as 'pending' | 'active' | 'completed',
      progress: 0,
      activeAgents: 0
    }))
  );

  // Simulate the generation process
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setPhaseStates(prev => {
        const updated = [...prev];
        const activeIndex = updated.findIndex(p => p.status === 'active');
        
        if (activeIndex === -1 && currentPhaseIndex === -1) {
          // Start first phase
          updated[0].status = 'active';
          setCurrentPhaseIndex(0);
          addActivity('system', 'Initializing course generation for identified skill gaps', 'info');
          addActivity('gap-analyzer', `Loading skills gap data for ${mockSkillsGapData.position}`, 'info');
          return updated;
        }

        if (activeIndex !== -1) {
          const active = updated[activeIndex];
          
          // Update progress
          if (active.progress < 100) {
            active.progress = Math.min(active.progress + Math.random() * 15, 100);
            active.activeAgents = Math.floor((active.progress / 100) * active.agents.length);
            
            // Add random agent activities
            if (Math.random() > 0.7) {
              const agent = active.agents[Math.floor(Math.random() * active.agents.length)];
              const actions = getAgentActions(active.id, agent);
              const action = actions[Math.floor(Math.random() * actions.length)];
              addActivity(agent, action, active.progress > 90 ? 'success' : 'info');
            }
            
            // Update overall progress
            const totalPhases = phases.length;
            const completedPhases = updated.filter(p => p.status === 'completed').length;
            const currentProgress = active.progress / 100;
            setOverallProgress(((completedPhases + currentProgress) / totalPhases) * 100);
          } else {
            // Complete current phase
            active.status = 'completed';
            active.activeAgents = 0;
            addActivity('system', `${active.name} phase completed`, 'success');
            
            // Start next phase
            if (activeIndex < updated.length - 1) {
              updated[activeIndex + 1].status = 'active';
              setCurrentPhaseIndex(activeIndex + 1);
              addActivity(updated[activeIndex + 1].agents[0], 
                `Initiating ${updated[activeIndex + 1].name} phase`, 'info');
            } else {
              // All completed
              setIsGenerating(false);
              setCurrentPhaseIndex(-1);
              addActivity('system', 'Course successfully generated and ready for deployment', 'success');
              setOverallProgress(100);
            }
          }
        }
        
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isGenerating, currentPhaseIndex]);

  const addActivity = (agent: string, action: string, status: 'info' | 'success' | 'warning') => {
    setActivities(prev => [{
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      agent,
      action,
      status
    }, ...prev].slice(0, 20));
  };

  const getAgentActions = (phaseId: string, agent: string): string[] => {
    const actions: Record<string, Record<string, string[]>> = {
      analysis: {
        'gap-analyzer': [
          `Analyzing ${mockSkillsGapData.analyzedEmployees} employee skill profiles`,
          `Identified ${mockSkillsGapData.topMissingSkills[0].gap}% gap in React Server Components`,
          `Found ${mockSkillsGapData.criticalGaps} critical skill gaps`,
          `Average gap score: ${mockSkillsGapData.averageGapScore}%`
        ],
        'priority-mapper': [
          'Prioritizing skills by business impact',
          `Marking "${mockSkillsGapData.topMissingSkills[0].skill}" as critical`,
          'Calculating learning urgency scores',
          'Mapping skills to career progression'
        ],
        'requirement-checker': [
          `Validating against ${mockSkillsGapData.position} requirements`,
          'Cross-referencing with industry standards',
          'Checking prerequisite dependencies',
          'Finalizing skill priority matrix'
        ]
      },
      research: {
        'content-researcher': [
          `Searching content for "${mockSkillsGapData.topMissingSkills[0].skill}"`,
          'Found 23 high-quality resources',
          'Analyzing React 18 documentation',
          'Collecting best practice guides'
        ],
        'best-practice-finder': [
          'Scanning industry leaders\' approaches',
          'Found Meta\'s React patterns guide',
          'Analyzing Vercel\'s Next.js practices',
          'Compiling optimization techniques'
        ],
        'resource-collector': [
          'Gathering interactive examples',
          'Found 15 CodeSandbox demos',
          'Collecting video tutorials',
          'Building resource library'
        ]
      },
      planning: {
        'curriculum-designer': [
          'Structuring course based on skill gaps',
          'Creating 6 progressive modules',
          'Balancing theory and practice',
          'Optimizing learning sequence'
        ],
        'learning-path-creator': [
          `Designing path for ${mockSkillsGapData.totalEmployees} employees`,
          'Creating personalized tracks',
          'Setting milestone checkpoints',
          'Calculating estimated duration: 4 weeks'
        ],
        'module-organizer': [
          'Module 1: React Server Components basics',
          'Module 2: Performance optimization techniques',
          'Module 3: Advanced TypeScript patterns',
          'Organizing hands-on exercises'
        ]
      },
      content: {
        'content-writer': [
          'Writing Module 1: Server Components introduction',
          'Creating real-world examples',
          'Explaining streaming SSR concepts',
          'Documenting best practices'
        ],
        'example-creator': [
          'Building e-commerce demo with RSC',
          'Creating performance comparison demos',
          'Implementing data fetching patterns',
          'Generating 12 practical examples'
        ],
        'exercise-generator': [
          'Creating hands-on lab: Build a dashboard',
          'Generating quiz: RSC vs Client Components',
          'Designing debugging exercises',
          'Created 8 skill assessments'
        ],
        'code-validator': [
          'Validating all code examples',
          'Testing in Next.js 14 environment',
          'Ensuring TypeScript compliance',
          'All examples validated successfully'
        ]
      },
      multimedia: {
        'diagram-creator': [
          'Creating RSC architecture diagram',
          'Designing data flow visualizations',
          'Building component tree diagrams',
          'Generated 8 technical diagrams'
        ],
        'visual-designer': [
          'Designing course cover image',
          'Creating module banners',
          'Building infographic summaries',
          'Optimizing for accessibility'
        ],
        'interactive-builder': [
          'Building interactive RSC playground',
          'Creating drag-drop exercises',
          'Implementing live code editor',
          'Added 5 interactive components'
        ]
      },
      review: {
        'quality-checker': [
          'Reviewing all course content',
          'Validating learning objectives',
          'Checking content accuracy',
          'Quality score: 94/100'
        ],
        'gap-validator': [
          `Verifying coverage of all ${mockSkillsGapData.topMissingSkills.length} skill gaps`,
          'Confirming practical application',
          'Validating assessment alignment',
          'All gaps addressed successfully'
        ],
        'deployment-agent': [
          'Packaging course materials',
          'Generating SCORM package',
          'Setting up progress tracking',
          'Course ready for deployment'
        ]
      }
    };

    return actions[phaseId]?.[agent] || ['Processing...'];
  };

  const startGeneration = () => {
    setIsGenerating(true);
    setCurrentPhaseIndex(-1);
    setOverallProgress(0);
    setActivities([]);
    setPhaseStates(phases.map(p => ({ 
      ...p, 
      status: 'pending' as const,
      progress: 0,
      activeAgents: 0
    })));
  };

  return (
    <div className="space-y-6">
      {/* Header with Skills Gap Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Course Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate targeted course based on identified skill gaps
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
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Course
            </>
          )}
        </Button>
      </div>

      {/* Skills Gap Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills Gap Analysis Summary
            </CardTitle>
            <Badge variant="destructive" className="gap-1">
              <TrendingDown className="h-3 w-3" />
              {mockSkillsGapData.averageGapScore}% Gap
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium">{mockSkillsGapData.position}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="font-medium">{mockSkillsGapData.analyzedEmployees}/{mockSkillsGapData.totalEmployees}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Gaps</p>
              <p className="font-medium text-red-600">{mockSkillsGapData.criticalGaps}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Gap</p>
              <p className="font-medium">{mockSkillsGapData.topMissingSkills[0].skill}</p>
            </div>
          </div>
          
          {/* Top Missing Skills */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Top Missing Skills</p>
            {mockSkillsGapData.topMissingSkills.slice(0, 3).map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm">{skill.skill}</span>
                <div className="flex items-center gap-2">
                  <Progress value={100 - skill.gap} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground w-12">{skill.gap}% gap</span>
                  <Badge variant="outline" className="text-xs">
                    {skill.employees} emp
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Pipeline View */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Generation Pipeline</CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Progress</span>
              <div className="flex items-center gap-2">
                <Progress value={overallProgress} className="w-24 h-2" />
                <span className="font-mono text-xs w-10">{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Phase Pipeline */}
          <div className="bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {phaseStates.map((phase, idx) => {
                const Icon = phase.icon;
                const isActive = phase.status === 'active';
                const isCompleted = phase.status === 'completed';
                const isPending = phase.status === 'pending';
                
                return (
                  <React.Fragment key={phase.id}>
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className={cn(
                        "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted ? "bg-primary text-primary-foreground" :
                        isActive ? phase.bgColor : "bg-muted",
                        isActive && "ring-2 ring-offset-2 ring-offset-background",
                        isActive && phase.color.replace('text-', 'ring-')
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className={cn("h-6 w-6", isActive ? phase.color : "text-muted-foreground")} />
                        )}
                        {isActive && (
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full animate-pulse",
                            phase.color.replace('text-', 'bg-')
                          )} />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium text-center",
                        isActive && phase.color,
                        isPending && "text-muted-foreground"
                      )}>
                        {phase.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{phase.duration}</span>
                      {isActive && (
                        <div className="w-full mt-1">
                          <Progress value={phase.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    {idx < phaseStates.length - 1 && (
                      <ArrowRight className={cn(
                        "h-4 w-4 transition-colors",
                        phaseStates[idx + 1].status !== 'pending' ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Active Phase Details */}
          {currentPhaseIndex >= 0 && (
            <div className="border-t p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const PhaseIcon = phaseStates[currentPhaseIndex].icon;
                    return (
                      <PhaseIcon className={cn(
                        "h-5 w-5",
                        phaseStates[currentPhaseIndex].color
                      )} />
                    );
                  })()}
                  <span className="font-medium">
                    Active: {phaseStates[currentPhaseIndex].name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {phaseStates[currentPhaseIndex].activeAgents}/{phaseStates[currentPhaseIndex].agents.length} agents
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Processing</span>
                </div>
              </div>
              
              {/* Agent Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {phaseStates[currentPhaseIndex].agents.map((agent, idx) => {
                  const isAgentActive = idx < phaseStates[currentPhaseIndex].activeAgents;
                  return (
                    <div key={agent} className={cn(
                      "px-3 py-2 rounded-md text-xs font-mono flex items-center gap-2",
                      isAgentActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Circle className={cn(
                        "h-2 w-2",
                        isAgentActive && "fill-current animate-pulse"
                      )} />
                      {agent}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Terminal */}
          <div className="border-t">
            <div className="bg-slate-900 text-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="h-4 w-4" />
                <span className="text-xs font-mono">AGENT_ACTIVITY_LOG</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <ScrollArea className="h-40">
                <div className="space-y-1 font-mono text-xs">
                  {activities.length === 0 ? (
                    <div className="text-slate-500">Waiting for pipeline initialization...</div>
                  ) : (
                    activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-500">[{activity.timestamp}]</span>
                        <span className={cn(
                          "font-bold",
                          activity.status === 'success' ? "text-green-400" :
                          activity.status === 'warning' ? "text-yellow-400" :
                          "text-blue-400"
                        )}>
                          {activity.agent}:
                        </span>
                        <span className="text-slate-300">{activity.action}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Output Preview */}
      {overallProgress === 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Course Ready for Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Course Title</p>
                  <p className="font-medium">Closing the {mockSkillsGapData.topMissingSkills[0].skill} Gap</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Audience</p>
                  <p className="font-medium">{mockSkillsGapData.analyzedEmployees} employees</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">4 weeks</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modules</p>
                  <p className="font-medium">6 modules</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Skills Addressed</p>
                <div className="flex flex-wrap gap-2">
                  {mockSkillsGapData.topMissingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill.skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button className="w-full" size="sm">
                Deploy Course to {mockSkillsGapData.analyzedEmployees} Employees
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}