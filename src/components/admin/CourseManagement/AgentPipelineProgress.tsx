import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';

interface AgentPipelineProgressProps {
  currentAgent?: string;
  completedAgents: string[];
  handoffs?: Array<{
    from_agent: string;
    to_agent: string;
    timestamp: string;
  }>;
}

export const AgentPipelineProgress: React.FC<AgentPipelineProgressProps> = ({
  currentAgent,
  completedAgents,
  handoffs
}) => {
  const agents = [
    { id: 'Planning', name: 'Planning', description: 'Analyzing skills gaps' },
    { id: 'Research', name: 'Research', description: 'Gathering learning materials' },
    { id: 'Content', name: 'Content', description: 'Creating module content' },
    { id: 'Quality', name: 'Quality', description: 'Ensuring content quality' },
    { id: 'Enhancement', name: 'Enhancement', description: 'Enriching content' },
    { id: 'Multimedia', name: 'Multimedia', description: 'Adding visual elements' },
    { id: 'Finalizer', name: 'Finalizer', description: 'Completing course' }
  ];
  
  const currentIndex = agents.findIndex(a => a.id === currentAgent);
  const completedCount = completedAgents.length;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Agent Pipeline</span>
        <span className="text-muted-foreground">
          Stage {completedCount + (currentAgent ? 1 : 0)} of {agents.length}
        </span>
      </div>
      
      {/* Pipeline Progress Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        
        {/* Progress Fill */}
        <div className="absolute inset-0 flex items-center">
          <div 
            className="h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${((completedCount + (currentAgent ? 0.5 : 0)) / agents.length) * 100}%` 
            }}
          />
        </div>
        
        {/* Agent Nodes */}
        <div className="relative flex items-center justify-between">
          {agents.map((agent, index) => {
            const isCompleted = completedAgents.includes(agent.id);
            const isCurrent = currentAgent === agent.id;
            const isPending = !isCompleted && !isCurrent;
            
            return (
              <div
                key={agent.id}
                className="flex flex-col items-center"
              >
                {/* Node */}
                <div
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-blue-500 text-white animate-pulse",
                    isPending && "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Label */}
                <div className="absolute top-10 flex flex-col items-center">
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {agent.name}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current Agent Details */}
      {currentAgent && (
        <div className="mt-8 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          <span>
            <span className="font-medium">{currentAgent} Agent:</span>
            {' '}
            {agents.find(a => a.id === currentAgent)?.description}
          </span>
        </div>
      )}
      
      {/* Recent Handoffs */}
      {handoffs && handoffs.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Recent Handoffs</p>
          {handoffs.slice(-3).map((handoff, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{handoff.from_agent}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{handoff.to_agent}</span>
              <span className="ml-auto">
                {new Date(handoff.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};