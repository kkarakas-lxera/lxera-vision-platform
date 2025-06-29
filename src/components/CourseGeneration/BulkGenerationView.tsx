import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Search, CheckCircle2, Minimize2, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentActivity {
  id: string;
  type: 'planning' | 'research';
  agentNumber: number;
  employeeName: string;
  employeeId: string;
  currentAction: string;
  detailMessage: string;
  progress: number;
  timestamp: Date;
}

interface EmployeeStatus {
  id: string;
  name: string;
  status: 'queued' | 'planning' | 'research' | 'completed' | 'failed';
  progress: number;
}

interface BulkGenerationViewProps {
  jobId: string;
  totalEmployees: number;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized?: boolean;
}

export const BulkGenerationView: React.FC<BulkGenerationViewProps> = ({
  jobId,
  totalEmployees,
  onClose,
  onMinimize,
  isMinimized: externalIsMinimized = false
}) => {
  const [isMinimized, setIsMinimized] = useState(externalIsMinimized);
  const [completedCount, setCompletedCount] = useState(0);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [activeAgents, setActiveAgents] = useState<AgentActivity[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [recentCompletion, setRecentCompletion] = useState<string>('');

  // Initialize employee statuses
  useEffect(() => {
    const statuses: EmployeeStatus[] = Array.from({ length: totalEmployees }, (_, i) => ({
      id: `emp-${i}`,
      name: `Employee ${i + 1}`,
      status: 'queued',
      progress: 0
    }));
    setEmployeeStatuses(statuses);
  }, [totalEmployees]);

  // Simulate real-time updates (replace with WebSocket in production)
  useEffect(() => {
    if (isMinimized) return;

    const interval = setInterval(() => {
      setEmployeeStatuses(prev => {
        const updated = [...prev];
        let completed = 0;
        let activeCount = 0;

        // Progress active employees
        updated.forEach((emp, idx) => {
          if (emp.status === 'completed') {
            completed++;
          } else if (emp.status === 'planning' || emp.status === 'research') {
            activeCount++;
            emp.progress += Math.random() * 10;
            
            if (emp.progress >= 100) {
              emp.status = 'completed';
              emp.progress = 100;
              setRecentCompletion(emp.name);
              completed++;
            }
          } else if (emp.status === 'queued' && activeCount < 3 && idx < 10) {
            // Start new employees if under concurrent limit
            emp.status = 'planning';
            emp.progress = 5;
          }
        });

        setCompletedCount(completed);
        setOverallProgress(Math.round((completed / totalEmployees) * 100));
        
        // Update estimated time
        const avgTimePerCourse = 2.75; // minutes
        const remaining = totalEmployees - completed;
        const concurrentProcessing = 3;
        const estimatedMinutes = Math.ceil((remaining / concurrentProcessing) * avgTimePerCourse);
        setEstimatedTime(`~${estimatedMinutes} min remaining`);

        return updated;
      });

      // Update active agents
      updateActiveAgents();
    }, 2000);

    return () => clearInterval(interval);
  }, [totalEmployees, isMinimized]);

  const updateActiveAgents = () => {
    const activities: AgentActivity[] = [
      {
        id: 'agent-1',
        type: 'planning',
        agentNumber: 1,
        employeeName: 'John Doe',
        employeeId: 'emp-0',
        currentAction: 'Analyzing skill gaps',
        detailMessage: 'Found 5 critical Python gaps, 3 SQL moderate gaps...',
        progress: 45,
        timestamp: new Date()
      },
      {
        id: 'agent-2',
        type: 'research',
        agentNumber: 1,
        employeeName: 'Jane Smith',
        employeeId: 'emp-1',
        currentAction: 'Generating Module 7/12',
        detailMessage: 'Creating SQL exercises for advanced analytics...',
        progress: 78,
        timestamp: new Date()
      },
      {
        id: 'agent-3',
        type: 'planning',
        agentNumber: 2,
        employeeName: 'Mike Johnson',
        employeeId: 'emp-2',
        currentAction: 'Structuring course',
        detailMessage: '12 modules planned, 48 hours total learning time...',
        progress: 23,
        timestamp: new Date()
      }
    ];
    setActiveAgents(activities);
  };

  const getStatusColor = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'planning': 
      case 'research': return 'bg-blue-500 animate-pulse';
      case 'queued': return 'bg-gray-300';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'completed': return '●';
      case 'planning': 
      case 'research': return '◐';
      case 'queued': return '○';
      case 'failed': return '✕';
      default: return '○';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 shadow-lg z-50">
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-medium text-sm">Generating {totalEmployees} Courses</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(false)} className="h-6 px-2">
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={overallProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalEmployees} complete • {estimatedTime}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Generating {totalEmployees} Personalized Courses
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 flex gap-6 overflow-hidden">
          {/* Left Panel - Overall Progress */}
          <Card className="flex-1 max-w-md">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="font-semibold mb-4 text-muted-foreground">Overall Progress</h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">
                  {completedCount} of {totalEmployees}
                </div>
                <div className="text-sm text-muted-foreground">courses generated</div>
              </div>

              {/* Progress Dots Grid */}
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-8 gap-2">
                  {employeeStatuses.map((emp) => (
                    <div
                      key={emp.id}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-500",
                        getStatusColor(emp.status)
                      )}
                      title={`${emp.name}: ${emp.status}`}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{overallProgress}%</span>
                  <span className="text-muted-foreground">{estimatedTime}</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Live Agent Activity */}
          <Card className="flex-1">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="font-semibold mb-4 text-muted-foreground">Live Agent Activity</h3>
              
              <div className="flex-1 space-y-4 overflow-y-auto">
                {activeAgents.map((agent) => (
                  <div key={agent.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        agent.type === 'planning' ? "bg-blue-100" : "bg-purple-100"
                      )}>
                        {agent.type === 'planning' ? 
                          <Brain className="h-4 w-4 text-blue-600" /> : 
                          <Search className="h-4 w-4 text-purple-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {agent.type === 'planning' ? 'Planning' : 'Research'} Agent #{agent.agentNumber}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {agent.progress}%
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          └─ {agent.currentAction} for {agent.employeeName}
                        </div>
                        <div className="text-sm italic text-muted-foreground bg-background/50 p-2 rounded">
                          "{agent.detailMessage}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {recentCompletion && (
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Just completed: {recentCompletion}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkGenerationView;