import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  ChevronRight,
  ChevronDown,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Play,
  FileText,
  Book,
  Lightbulb,
  Users,
  ClipboardCheck,
  ExternalLink,
  Download,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface Module {
  module: number;
  title: string;
  topics: string[];
  status?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'article';
  url: string;
  description?: string;
}

interface MobileCourseProgressProps {
  courseTitle: string;
  currentModule: string;
  currentSection: string;
  sections: Section[];
  modules?: Module[];
  sectionProgress: Record<string, boolean>;
  overallProgress: number;
  onSectionSelect: (sectionId: string) => void;
  onModuleSelect?: (moduleId: string) => void;
  resources?: Resource[];
  bookmarks?: string[];
  onBookmark?: (resourceId: string) => void;
  onRemoveBookmark?: (resourceId: string) => void;
  className?: string;
}

export default function MobileCourseProgress({
  courseTitle,
  currentModule,
  currentSection,
  sections,
  modules = [],
  sectionProgress,
  overallProgress,
  onSectionSelect,
  onModuleSelect,
  resources = [],
  bookmarks = [],
  onBookmark,
  onRemoveBookmark,
  className
}: MobileCourseProgressProps) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);

  const completedSections = Object.values(sectionProgress).filter(Boolean).length;
  const totalSections = sections.length;

  const getModuleProgress = (moduleIndex: number) => {
    // For now, return 100% for completed modules, current module uses section progress
    if (moduleIndex < (modules.findIndex(m => m.title === currentModule) || 0)) {
      return 100;
    }
    if (moduleIndex === (modules.findIndex(m => m.title === currentModule) || 0)) {
      return Math.round((completedSections / totalSections) * 100);
    }
    return 0;
  };

  const isModuleLocked = (moduleIndex: number) => {
    const currentModuleIndex = modules.findIndex(m => m.title === currentModule) || 0;
    return moduleIndex > currentModuleIndex;
  };

  const isModuleCompleted = (moduleIndex: number) => {
    const currentModuleIndex = modules.findIndex(m => m.title === currentModule) || 0;
    return moduleIndex < currentModuleIndex;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'video': return Play;
      case 'link': return ExternalLink;
      case 'article': return Book;
      default: return FileText;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Course Navigation
          </h3>
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {overallProgress}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={overallProgress} 
            className="h-3" 
            indicatorClassName="bg-gradient-to-r from-blue-500 to-green-500"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{courseTitle}</span>
            <span>{completedSections}/{totalSections} sections</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="progress" className="text-xs">
            <BookOpen className="h-4 w-4 mr-1" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="text-xs">
            <Star className="h-4 w-4 mr-1" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-0">

      <ScrollArea className="max-h-96">
        <div className="p-4 space-y-4">
          {/* Module-based Progress */}
          {modules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Modules
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllModules(!showAllModules)}
                  className="text-xs"
                >
                  {showAllModules ? 'Show Less' : 'Show All'}
                </Button>
              </div>
              
              {modules.slice(0, showAllModules ? modules.length : 3).map((module, index) => {
                const isLocked = isModuleLocked(index);
                const isCompleted = isModuleCompleted(index);
                const isCurrent = module.title === currentModule;
                const progress = getModuleProgress(index);
                const isExpanded = expandedModule === index;

                return (
                  <div key={index} className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                        isCurrent 
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                          : isCompleted
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : isLocked
                          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                        !isLocked && "cursor-pointer hover:shadow-sm"
                      )}
                      onClick={() => {
                        if (!isLocked) {
                          setExpandedModule(isExpanded ? null : index);
                          if (onModuleSelect) {
                            onModuleSelect(module.title);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          {isLocked ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <BookOpen className={cn("h-5 w-5", isCurrent ? "text-blue-500" : "text-gray-400")} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Module {module.module}
                            </span>
                            {isCurrent && (
                              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {module.title}
                          </div>
                          
                          {!isLocked && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isLocked && (
                        <ChevronRight className={cn(
                          "h-4 w-4 text-gray-400 transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      )}
                    </div>
                    
                    {/* Module Sections */}
                    {isExpanded && isCurrent && (
                      <div className="ml-6 space-y-2">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = currentSection === section.id;
                          const isCompleted = sectionProgress[section.id];
                          
                          return (
                            <button
                              key={section.id}
                              onClick={() => onSectionSelect(section.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all duration-200",
                                isActive
                                  ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                  : isCompleted
                                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              )}
                            >
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Icon className="h-4 w-4" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {section.name}
                                </div>
                              </div>
                              
                              {isActive && (
                                <Play className="h-3 w-3 fill-current" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Section-only Progress (fallback) */}
          {modules.length === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Sections
              </h4>
              
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                const isCompleted = sectionProgress[section.id];
                
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionSelect(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all duration-200",
                      isActive
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : isCompleted
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {section.name}
                      </div>
                    </div>
                    
                    {isActive && (
                      <Play className="h-3 w-3 fill-current" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Completed
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {completedSections}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Remaining
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalSections - completedSections}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      </TabsContent>

      <TabsContent value="resources" className="mt-0">
        <ScrollArea className="max-h-96">
          <div className="p-4 space-y-3">
            {resources.length > 0 ? (
              resources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                const isBookmarked = bookmarks.includes(resource.id);
                
                return (
                  <div key={resource.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                          {resource.title}
                        </h4>
                        {resource.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Open Resource
                          </a>
                          {onBookmark && (
                            <button
                              onClick={() => {
                                if (isBookmarked && onRemoveBookmark) {
                                  onRemoveBookmark(resource.id);
                                } else {
                                  onBookmark(resource.id);
                                }
                              }}
                              className={cn(
                                "text-xs px-2 py-1 rounded transition-colors",
                                isBookmarked
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                              )}
                            >
                              {isBookmarked ? 'Saved' : 'Save'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No resources available for this course yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="bookmarks" className="mt-0">
        <ScrollArea className="max-h-96">
          <div className="p-4 space-y-3">
            {bookmarks.length > 0 ? (
              resources
                .filter(resource => bookmarks.includes(resource.id))
                .map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  
                  return (
                    <div key={resource.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                            {resource.title}
                          </h4>
                          {resource.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {resource.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Open Resource
                            </a>
                            {onRemoveBookmark && (
                              <button
                                onClick={() => onRemoveBookmark(resource.id)}
                                className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  No saved resources yet.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Save resources from the Resources tab to access them quickly here.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      </Tabs>
    </Card>
  );
}