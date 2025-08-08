import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];

interface ModuleNavigatorProps {
  modules: ModuleContent[];
  activeModuleId: string;
  onModuleSelect: (moduleId: string) => void;
  isDirty: boolean;
}

const ModuleNavigator: React.FC<ModuleNavigatorProps> = ({
  modules,
  activeModuleId,
  onModuleSelect,
  isDirty
}) => {
  const handleModuleSelect = (moduleId: string) => {
    if (isDirty) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to save them before switching modules?'
      );
      if (!confirmSwitch) return;
    }
    onModuleSelect(moduleId);
  };
  
  const getModuleInfo = (module: ModuleContent) => {
    const spec = module.module_spec as any;
    return {
      id: spec?.module_id || 0,
      week: spec?.week || 1,
      duration: spec?.duration_hours || 0,
      priority: spec?.priority || 'medium'
    };
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusIcon = (module: ModuleContent) => {
    if (module.is_draft) {
      return <Edit3 className="h-3 w-3 text-orange-500" />;
    }
    if (module.status === 'published') {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    return <Clock className="h-3 w-3 text-gray-400" />;
  };
  
  return (
    <Card className="p-3 bg-card rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Modules</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Add module">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add module</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-1.5">
          {modules.map((module, index) => {
            const info = getModuleInfo(module);
            const isActive = module.content_id === activeModuleId;
            
            return (
              <div
                key={module.content_id}
                className={cn(
                  "group relative rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "bg-muted ring-2 ring-primary/20" 
                    : "hover:bg-muted/60"
                )}
                onClick={() => handleModuleSelect(module.content_id)}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Module {info.id}
                        </span>
                        {getStatusIcon(module)}
                      </div>
                      <h3 className={cn(
                        "text-sm font-medium line-clamp-2",
                        isActive ? "text-foreground" : "text-foreground"
                      )}>
                        {module.module_name}
                      </h3>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show module options menu
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge 
                      variant="outline" 
                      className={cn("h-5 px-1 border-0", getPriorityColor(info.priority))}
                    >
                      {info.priority}
                    </Badge>
                    <span>
                      Week {info.week} • {info.duration}h
                    </span>
                  </div>
                  
                  {module.is_draft && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-orange-600">
                      <AlertCircle className="h-3 w-3" />
                      Draft changes
                    </div>
                  )}
                </div>
                
                {/* Module reorder buttons */}
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement module reordering
                      }}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      disabled={index === modules.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement module reordering
                      }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-sm text-gray-500">
          {modules.length} modules • {modules.filter(m => m.is_draft).length} drafts
        </div>
      </div>
    </Card>
  );
};

export default ModuleNavigator;