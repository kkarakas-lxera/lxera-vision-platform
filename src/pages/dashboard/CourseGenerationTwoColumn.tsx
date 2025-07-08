import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
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
  TrendingDown,
  Clock,
  Server,
  Cpu,
  BarChart3,
  AlertCircle,
  Database,
  GitBranch,
  Package,
  Layers,
  Code2,
  Shield,
  Gauge,
  Network,
  Hash,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock skills gap data
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
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  metadata?: {
    duration?: number;
    itemsProcessed?: number;
    confidence?: number;
    resources?: string[];
    memory?: number;
    cpu?: number;
  };
}

interface AgentMetrics {
  totalOperations: number;
  successRate: number;
  avgResponseTime: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export default function CourseGenerationTwoColumn() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalOperations: 0,
    successRate: 100,
    avgResponseTime: 0,
    activeConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  const [selectedActivity, setSelectedActivity] = useState<AgentActivity | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("stream");

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
          updated[0].status = 'active';
          setCurrentPhaseIndex(0);
          addActivity('system', 'Initializing course generation pipeline', 'info', {
            duration: 125,
            confidence: 100
          });
          addActivity('gap-analyzer', `Loading skills gap data for ${mockSkillsGapData.position}`, 'info', {
            itemsProcessed: mockSkillsGapData.analyzedEmployees,
            confidence: 95
          });
          return updated;
        }

        if (activeIndex !== -1) {
          const active = updated[activeIndex];
          
          if (active.progress < 100) {
            active.progress = Math.min(active.progress + Math.random() * 15, 100);
            active.activeAgents = Math.floor((active.progress / 100) * active.agents.length);
            
            if (Math.random() > 0.6) {
              const agent = active.agents[Math.floor(Math.random() * active.agents.length)];
              const actions = getAgentActions(active.id, agent);
              const action = actions[Math.floor(Math.random() * actions.length)];
              const status = Math.random() > 0.95 ? 'error' : 
                             active.progress > 90 ? 'success' : 'info';
              
              addActivity(agent, action, status, {
                duration: Math.floor(Math.random() * 500) + 100,
                itemsProcessed: Math.floor(Math.random() * 50) + 1,
                confidence: Math.floor(Math.random() * 20) + 80,
                memory: Math.random() * 100,
                cpu: Math.random() * 100
              });
            }
            
            const totalPhases = phases.length;
            const completedPhases = updated.filter(p => p.status === 'completed').length;
            const currentProgress = active.progress / 100;
            setOverallProgress(((completedPhases + currentProgress) / totalPhases) * 100);
          } else {
            active.status = 'completed';
            active.activeAgents = 0;
            addActivity('system', `${active.name} phase completed`, 'success', {
              duration: 50,
              confidence: 100
            });
            
            if (activeIndex < updated.length - 1) {
              updated[activeIndex + 1].status = 'active';
              setCurrentPhaseIndex(activeIndex + 1);
              addActivity(updated[activeIndex + 1].agents[0], 
                `Initiating ${updated[activeIndex + 1].name} phase`, 'info');
            } else {
              setIsGenerating(false);
              setCurrentPhaseIndex(-1);
              addActivity('system', 'Course generation completed successfully', 'success', {
                duration: 25,
                confidence: 100,
                itemsProcessed: mockSkillsGapData.analyzedEmployees
              });
              setOverallProgress(100);
            }
          }
        }
        
        return updated;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isGenerating, currentPhaseIndex]);

  const addActivity = (
    agent: string, 
    action: string, 
    status: AgentActivity['status'],
    metadata?: AgentActivity['metadata']
  ) => {
    const newActivity: AgentActivity = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
      }),
      agent,
      action,
      status,
      metadata: metadata || {
        duration: Math.floor(Math.random() * 1000) + 100,
        confidence: Math.floor(Math.random() * 20) + 80,
        itemsProcessed: Math.floor(Math.random() * 50) + 1
      }
    };
    
    setActivities(prev => [newActivity, ...prev].slice(0, 500));
    
    // Update metrics
    setMetrics(prev => ({
      totalOperations: prev.totalOperations + 1,
      successRate: status === 'error' ? 
        Math.max(prev.successRate - 1, 85) : 
        Math.min(prev.successRate + 0.1, 100),
      avgResponseTime: Math.round((prev.avgResponseTime * prev.totalOperations + (metadata?.duration || 250)) / (prev.totalOperations + 1)),
      activeConnections: Math.max(0, Math.min(20, prev.activeConnections + (Math.random() > 0.5 ? 1 : -1))),
      memoryUsage: Math.min(95, Math.max(20, prev.memoryUsage + (Math.random() - 0.3) * 5)),
      cpuUsage: Math.min(90, Math.max(10, prev.cpuUsage + (Math.random() - 0.3) * 10))
    }));
  };

  const getAgentActions = (phaseId: string, agent: string): string[] => {
    const actions: Record<string, Record<string, string[]>> = {
      analysis: {
        'gap-analyzer': [
          `Analyzing ${mockSkillsGapData.analyzedEmployees} employee skill profiles`,
          `Identified ${mockSkillsGapData.topMissingSkills[0].gap}% gap in React Server Components`,
          `Processing skill matrix for ${mockSkillsGapData.position}`,
          `Calculating proficiency scores across ${mockSkillsGapData.topMissingSkills.length} skills`
        ],
        'priority-mapper': [
          'Prioritizing skills by business impact',
          `Marking "${mockSkillsGapData.topMissingSkills[0].skill}" as critical`,
          'Building skill dependency graph',
          'Optimizing learning sequence'
        ],
        'requirement-checker': [
          `Validating against ${mockSkillsGapData.position} requirements`,
          'Cross-referencing with NESTA taxonomy',
          'Checking prerequisite dependencies',
          'Generating compliance matrix'
        ]
      },
      research: {
        'content-researcher': [
          `Searching content for "${mockSkillsGapData.topMissingSkills[0].skill}"`,
          'Scanning 2,847 technical articles',
          'Analyzing React 18 documentation',
          'Indexing best practice guides'
        ],
        'best-practice-finder': [
          'Querying industry knowledge base',
          'Found Meta\'s React patterns guide',
          'Processing Vercel\'s optimization docs',
          'Extracting code patterns'
        ],
        'resource-collector': [
          'Aggregating learning resources',
          'Found 15 interactive CodeSandbox demos',
          'Cataloging video tutorials',
          'Building resource dependency tree'
        ]
      },
      planning: {
        'curriculum-designer': [
          'Structuring adaptive learning paths',
          'Generating 6 progressive modules',
          'Balancing theory/practice ratio',
          'Optimizing cognitive load'
        ],
        'learning-path-creator': [
          `Designing paths for ${mockSkillsGapData.totalEmployees} employees`,
          'Creating personalized milestones',
          'Calculating time estimates',
          'Building prerequisite chains'
        ],
        'module-organizer': [
          'Sequencing learning objectives',
          'Organizing hands-on exercises',
          'Structuring assessment points',
          'Creating module dependencies'
        ]
      },
      content: {
        'content-writer': [
          'Generating Module 1 content',
          'Writing technical explanations',
          'Creating code examples',
          'Documenting best practices'
        ],
        'example-creator': [
          'Building interactive demos',
          'Generating real-world scenarios',
          'Creating sandbox environments',
          'Producing code snippets'
        ],
        'exercise-generator': [
          'Designing practical challenges',
          'Creating skill assessments',
          'Building debugging exercises',
          'Generating quiz questions'
        ],
        'code-validator': [
          'Validating code examples',
          'Running automated tests',
          'Checking TypeScript compliance',
          'Verifying best practices'
        ]
      },
      multimedia: {
        'diagram-creator': [
          'Generating architecture diagrams',
          'Creating flow visualizations',
          'Building component trees',
          'Producing UML diagrams'
        ],
        'visual-designer': [
          'Designing course visuals',
          'Creating infographics',
          'Optimizing for accessibility',
          'Generating color schemes'
        ],
        'interactive-builder': [
          'Building interactive components',
          'Creating drag-drop exercises',
          'Implementing live editors',
          'Generating animations'
        ]
      },
      review: {
        'quality-checker': [
          'Running quality metrics',
          'Validating learning objectives',
          'Checking content accuracy',
          'Scoring accessibility'
        ],
        'gap-validator': [
          `Verifying ${mockSkillsGapData.topMissingSkills.length} skill gaps addressed`,
          'Confirming learning outcomes',
          'Validating assessments',
          'Checking coverage matrix'
        ],
        'deployment-agent': [
          'Packaging course materials',
          'Generating SCORM package',
          'Setting up tracking',
          'Deploying to LMS'
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
    setMetrics({
      totalOperations: 0,
      successRate: 100,
      avgResponseTime: 0,
      activeConnections: 0,
      memoryUsage: 20,
      cpuUsage: 15
    });
    setPhaseStates(phases.map(p => ({ 
      ...p, 
      status: 'pending' as const,
      progress: 0,
      activeAgents: 0
    })));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Course Generator</h1>
          <p className="text-muted-foreground mt-1">
            Multi-agent pipeline for personalized course creation
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

      {/* Two-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-hidden">
        {/* Left Column - Pipeline Overview (2/5) */}
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-auto">
          {/* Skills Gap Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Skills Gap Analysis
                </CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {mockSkillsGapData.averageGapScore}% Gap
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Position</p>
                  <p className="font-medium">{mockSkillsGapData.position}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Employees</p>
                  <p className="font-medium">{mockSkillsGapData.analyzedEmployees}/{mockSkillsGapData.totalEmployees}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Top Missing Skills</p>
                {mockSkillsGapData.topMissingSkills.slice(0, 3).map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs truncate mr-2">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={100 - skill.gap} className="w-16 h-1.5" />
                      <span className="text-xs text-muted-foreground w-10">{skill.gap}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Progress */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generation Pipeline</CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={overallProgress} className="w-20 h-2" />
                  <span className="text-xs font-mono">{Math.round(overallProgress)}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Phase Progress */}
              <div className="space-y-2">
                {phaseStates.map((phase, idx) => {
                  const Icon = phase.icon;
                  const isActive = phase.status === 'active';
                  const isCompleted = phase.status === 'completed';
                  
                  return (
                    <div key={phase.id} className={cn(
                      "p-3 rounded-lg border transition-all",
                      isActive && "border-primary bg-primary/5",
                      isCompleted && "bg-muted/50"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isCompleted ? "bg-primary text-primary-foreground" :
                          isActive ? phase.bgColor : "bg-muted"
                        )}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className={cn("h-4 w-4", isActive ? phase.color : "text-muted-foreground")} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{phase.name}</span>
                            <span className="text-xs text-muted-foreground">{phase.duration}</span>
                          </div>
                          {isActive && (
                            <Progress value={phase.progress} className="h-1" />
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {phase.agents.length} agents
                            </span>
                            {isActive && (
                              <Badge variant="secondary" className="text-xs h-4">
                                {phase.activeAgents} active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* System Metrics */}
              {isGenerating && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">System Metrics</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">CPU: {metrics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">Memory: {metrics.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">Connections: {metrics.activeConnections}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">Ops/sec: {(metrics.totalOperations / 10).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Agent Activity Log (3/5) */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Agent Activity Monitor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activities.length} events
                  </Badge>
                  {metrics.successRate < 100 && (
                    <Badge variant="destructive" className="text-xs">
                      {metrics.successRate.toFixed(1)}% success
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="stream" className="flex-1">Live Stream</TabsTrigger>
                  <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
                  <TabsTrigger value="errors" className="flex-1">Errors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stream" className="flex-1 mt-0 overflow-hidden">
                  <div className="h-full bg-slate-950 text-slate-100 p-4 overflow-hidden">
                    <ScrollArea className="h-full" ref={scrollRef}>
                      <div className="space-y-1 font-mono text-xs">
                        {activities.length === 0 ? (
                          <div className="text-slate-500 text-center py-8">
                            Waiting for pipeline initialization...
                          </div>
                        ) : (
                          activities.map((activity) => (
                            <div 
                              key={activity.id} 
                              className={cn(
                                "group flex items-start gap-2 py-0.5 px-2 rounded hover:bg-slate-900 cursor-pointer transition-colors",
                                selectedActivity?.id === activity.id && "bg-slate-900"
                              )}
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <span className="text-slate-600 select-none">{activity.timestamp}</span>
                              <span className={cn(
                                "font-bold min-w-[140px]",
                                activity.status === 'success' ? "text-green-400" :
                                activity.status === 'error' ? "text-red-400" :
                                activity.status === 'warning' ? "text-yellow-400" :
                                "text-blue-400"
                              )}>
                                [{activity.agent}]
                              </span>
                              <span className="text-slate-300 flex-1">{activity.action}</span>
                              {activity.metadata && (
                                <div className="flex items-center gap-2 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {activity.metadata.duration && (
                                    <span>{activity.metadata.duration}ms</span>
                                  )}
                                  {activity.metadata.confidence && (
                                    <span>{activity.metadata.confidence}%</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Selected Activity Details */}
                    {selectedActivity && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Activity Details</span>
                            <button 
                              onClick={() => setSelectedActivity(null)}
                              className="text-xs text-slate-600 hover:text-slate-400"
                            >
                              Clear
                            </button>
                          </div>
                          {selectedActivity.metadata && (
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {selectedActivity.metadata.duration && (
                                <div>
                                  <span className="text-slate-600">Duration:</span>
                                  <span className="ml-1 text-slate-400">{selectedActivity.metadata.duration}ms</span>
                                </div>
                              )}
                              {selectedActivity.metadata.confidence && (
                                <div>
                                  <span className="text-slate-600">Confidence:</span>
                                  <span className="ml-1 text-slate-400">{selectedActivity.metadata.confidence}%</span>
                                </div>
                              )}
                              {selectedActivity.metadata.itemsProcessed && (
                                <div>
                                  <span className="text-slate-600">Items:</span>
                                  <span className="ml-1 text-slate-400">{selectedActivity.metadata.itemsProcessed}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="flex-1 mt-0 p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
                          <Progress value={metrics.successRate} className="mt-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                          <p className="text-xs text-muted-foreground mt-1">Per operation</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Agent Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {['gap-analyzer', 'content-writer', 'quality-checker'].map(agent => (
                            <div key={agent} className="flex items-center justify-between">
                              <span className="text-sm">{agent}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={Math.random() * 30 + 70} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(Math.random() * 30 + 70)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="errors" className="flex-1 mt-0 p-4">
                  <div className="space-y-2">
                    {activities.filter(a => a.status === 'error').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                        <p>No errors detected</p>
                      </div>
                    ) : (
                      activities.filter(a => a.status === 'error').map(activity => (
                        <Alert key={activity.id} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <div className="ml-2">
                            <p className="text-sm font-medium">{activity.agent}</p>
                            <p className="text-xs">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                          </div>
                        </Alert>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Completion Modal */}
      {overallProgress === 100 && (
        <div className="fixed bottom-4 right-4 max-w-md animate-in slide-in-from-bottom-2">
          <Card className="border-green-500/50 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Course Ready for Deployment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Successfully generated course for {mockSkillsGapData.analyzedEmployees} employees
              </p>
              <Button className="w-full" size="sm">
                Deploy Course
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}