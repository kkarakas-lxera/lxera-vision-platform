import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  Search, 
  BookOpen, 
  Settings, 
  Download, 
  MessageCircle 
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

interface MobileQuickActionsProps {
  currentCourseId?: string;
  onContinueCourse?: () => void;
  onBrowseCatalog?: () => void;
  onSettings?: () => void;
  onDownloads?: () => void;
  onHelp?: () => void;
  onSearch?: () => void;
}

const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  currentCourseId,
  onContinueCourse,
  onBrowseCatalog,
  onSettings,
  onDownloads,
  onHelp,
  onSearch
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'continue',
      title: 'Continue Learning',
      description: 'Pick up where you left off',
      icon: <PlayCircle className="h-5 w-5" />,
      onClick: onContinueCourse || (() => {}),
      disabled: !currentCourseId
    },
    {
      id: 'browse',
      title: 'Browse Catalog',
      description: 'Explore all courses',
      icon: <BookOpen className="h-5 w-5" />,
      onClick: onBrowseCatalog || (() => {})
    },
    {
      id: 'search',
      title: 'Search Courses',
      description: 'Find specific topics',
      icon: <Search className="h-5 w-5" />,
      onClick: onSearch || (() => {})
    },
    {
      id: 'downloads',
      title: 'Downloads',
      description: 'Offline materials',
      icon: <Download className="h-5 w-5" />,
      onClick: onDownloads || (() => {})
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get assistance',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: onHelp || (() => {})
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage preferences',
      icon: <Settings className="h-5 w-5" />,
      onClick: onSettings || (() => {})
    }
  ];

  return (
    <div className="px-4 mb-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Card 
            key={action.id}
            className={`hover:shadow-md transition-all duration-300 active:scale-95 ${
              action.disabled ? 'opacity-50' : 'cursor-pointer'
            }`}
            onClick={action.disabled ? undefined : action.onClick}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {action.icon}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium text-sm leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
                
                {action.badge && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;