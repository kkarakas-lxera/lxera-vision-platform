import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react';

interface Module {
  id: string;
  content_id: string | null;
  module_number: number;
  module_title: string;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  is_placeholder?: boolean;
}

interface Section {
  section_id: string;
  section_name: string;
  is_completed?: boolean;
}

interface ModuleNavigationProps {
  modules: Module[];
  currentModule: Module | null;
  onModuleSelect: (module: Module) => void;
  sections: Section[];
  currentSection: Section | null;
  onSectionSelect: (section: Section) => void;
}

export default function ModuleNavigation({
  modules,
  currentModule,
  onModuleSelect,
  sections,
  currentSection,
  onSectionSelect
}: ModuleNavigationProps) {
  const formatSectionName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSectionIcon = (section: Section) => {
    if (section.is_completed) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (section.section_id === currentSection?.section_id) return <PlayCircle className="h-4 w-4 text-blue-600" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getModuleIcon = (module: Module) => {
    if (module.is_completed) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (!module.is_unlocked) return <Lock className="h-5 w-5 text-gray-400" />;
    if (module.id === currentModule?.id) return <PlayCircle className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  // Calculate time spent (placeholder for now)
  const timeSpent = 18;
  const totalTime = 45;

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-lg">Module Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Module List */}
        <div className="space-y-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module)}
              disabled={!module.is_unlocked || module.is_placeholder}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3",
                module.id === currentModule?.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : module.is_unlocked && !module.is_placeholder
                  ? "hover:bg-gray-50"
                  : "opacity-50 cursor-not-allowed",
                "border",
                module.id === currentModule?.id ? "border-blue-200" : "border-transparent"
              )}
            >
              {getModuleIcon(module)}
              <div className="flex-1">
                <div className="text-sm font-medium">Module {module.module_number}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {module.module_title}
                </div>
                {module.is_placeholder && (
                  <span className="text-xs text-orange-600 mt-1 block">Coming soon</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Current Module Sections */}
        {currentModule && sections.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Sections:</h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.section_id}
                  onClick={() => onSectionSelect(section)}
                  className={cn(
                    "w-full text-left p-2 rounded-md transition-colors flex items-center gap-2",
                    section.section_id === currentSection?.section_id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50",
                    "text-sm"
                  )}
                >
                  {getSectionIcon(section)}
                  <span>{formatSectionName(section.section_name)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Info */}
        {currentModule && (
          <div className="border-t pt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{currentModule.progress_percentage}%</span>
              </div>
              <Progress value={currentModule.progress_percentage} className="h-2" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Time:</span>
                <span>{timeSpent}/{totalTime} min</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}