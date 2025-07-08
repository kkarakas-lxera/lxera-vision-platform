import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Home, 
  Menu,
  ArrowLeft,
  ArrowRight,
  Settings,
  Sun,
  Moon,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCourseHeaderProps {
  courseTitle: string;
  moduleName: string;
  currentSection: string;
  progress: number;
  isGameMode?: boolean;
  theme: 'light' | 'dark';
  onBackClick: () => void;
  onMenuClick: () => void;
  onThemeToggle: () => void;
  onGameExit?: () => void;
  currentIndex?: number;
  totalSections?: number;
  onPreviousSection?: () => void;
  onNextSection?: () => void;
}

export default function MobileCourseHeader({
  courseTitle,
  moduleName,
  currentSection,
  progress,
  isGameMode = false,
  theme,
  onBackClick,
  onMenuClick,
  onThemeToggle,
  onGameExit,
  currentIndex = 0,
  totalSections = 1,
  onPreviousSection,
  onNextSection
}: MobileCourseHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      {/* Main Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {isGameMode ? (
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span className="truncate">Learning Game</span>
                </span>
              ) : (
                currentSection.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
              )}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {moduleName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isGameMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onGameExit}
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Exit Game
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && !isGameMode && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="pt-4 space-y-4">
            {/* Course Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Course Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {courseTitle}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2" 
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-green-500"
                />
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Section {currentIndex + 1} of {totalSections}</span>
                  <span>{Math.round((currentIndex + 1) / totalSections * 100)}% through</span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            {(onPreviousSection || onNextSection) && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviousSection}
                  disabled={!onPreviousSection || currentIndex === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextSection}
                  disabled={!onNextSection || currentIndex === totalSections - 1}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="flex items-center gap-2"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </span>
                </Button>
              </div>
              
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                {currentSection.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}