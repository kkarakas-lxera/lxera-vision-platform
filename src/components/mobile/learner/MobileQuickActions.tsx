import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  Search, 
  BookOpen, 
  Settings, 
  Download, 
  MessageCircle,
  ChevronRight,
  Zap,
  User,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [pressedAction, setPressedAction] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'primary' | 'secondary' | null>('primary');
  const handleActionPress = (actionId: string) => {
    setPressedAction(actionId);
    setTimeout(() => setPressedAction(null), 150);
  };

  const primaryActions: QuickAction[] = [
    {
      id: 'continue',
      title: 'Continue Learning',
      description: currentCourseId ? 'Pick up where you left off' : 'No active course',
      icon: <PlayCircle className="h-5 w-5" />,
      onClick: onContinueCourse || (() => {}),
      disabled: !currentCourseId,
      badge: currentCourseId ? 'Active' : undefined
    },
    {
      id: 'browse',
      title: 'Browse Catalog',
      description: 'Explore all available courses',
      icon: <BookOpen className="h-5 w-5" />,
      onClick: onBrowseCatalog || (() => {})
    },
    {
      id: 'search',
      title: 'Search Courses',
      description: 'Find specific topics quickly',
      icon: <Search className="h-5 w-5" />,
      onClick: onSearch || (() => {})
    }
  ];
  
  const secondaryActions: QuickAction[] = [
    {
      id: 'downloads',
      title: 'Offline Content',
      description: 'Downloaded materials',
      icon: <Download className="h-5 w-5" />,
      onClick: onDownloads || (() => {}),
      badge: '3' // Mock download count
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get assistance when needed',
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: onHelp || (() => {})
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Manage your preferences',
      icon: <User className="h-5 w-5" />,
      onClick: onSettings || (() => {})
    }
  ];

  const renderActionCard = (action: QuickAction, size: 'large' | 'small' = 'small') => (
    <Card 
      key={action.id}
      className={cn(
        "transition-all duration-300 cursor-pointer touch-target",
        "hover:shadow-md active:shadow-sm",
        pressedAction === action.id ? "scale-98 shadow-sm" : "scale-100",
        action.disabled && "opacity-50 cursor-not-allowed",
        size === 'large' && "col-span-2"
      )}
      onClick={action.disabled ? undefined : () => {
        handleActionPress(action.id);
        action.onClick();
      }}
      onTouchStart={() => !action.disabled && handleActionPress(action.id)}
    >
      <CardContent className={cn(
        "p-4",
        size === 'large' && "p-5"
      )}>
        <div className={cn(
          "flex items-center text-left space-x-3",
          size === 'small' && "flex-col items-center text-center space-x-0 space-y-2"
        )}>
          {/* Enhanced icon */}
          <div className={cn(
            "rounded-full flex items-center justify-center transition-all duration-300",
            size === 'large' ? "w-14 h-14" : "w-12 h-12",
            action.disabled ? "bg-muted text-muted-foreground" : 
            action.id === 'continue' && currentCourseId ? "bg-primary text-white" :
            "bg-primary/10 text-primary",
            pressedAction === action.id && "scale-110"
          )}>
            {action.icon}
          </div>
          
          {/* Content */}
          <div className={cn(
            "flex-1 min-w-0",
            size === 'small' && "text-center"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-medium leading-tight",
                size === 'large' ? "text-base" : "text-sm"
              )}>
                {action.title}
              </h3>
              {action.badge && (
                <Badge 
                  variant={action.id === 'continue' ? 'default' : 'secondary'} 
                  className="text-xs h-4 px-1.5"
                >
                  {action.badge}
                </Badge>
              )}
            </div>
            <p className={cn(
              "text-muted-foreground line-clamp-2",
              size === 'large' ? "text-sm" : "text-xs"
            )}>
              {action.description}
            </p>
          </div>
          
          {/* Arrow for large cards */}
          {size === 'large' && (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Fast access</span>
        </div>
      </div>
      
      {/* Primary actions section */}
      <div className="space-y-4">
        {/* Featured action (Continue Learning) */}
        {currentCourseId && (
          <div className="mb-4">
            {renderActionCard(primaryActions[0], 'large')}
          </div>
        )}
        
        {/* Primary actions grid */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            {primaryActions.slice(currentCourseId ? 1 : 0).map((action) => 
              renderActionCard(action)
            )}
          </div>
        </div>
        
        {/* Secondary actions - collapsible */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedSection(
              expandedSection === 'secondary' ? null : 'secondary'
            )}
            className="w-full h-8 text-xs text-muted-foreground mb-3 touch-target"
          >
            <div className="flex items-center gap-2">
              <span>More Options</span>
              <ChevronRight className={cn(
                "h-3 w-3 transition-transform duration-200",
                expandedSection === 'secondary' && "rotate-90"
              )} />
            </div>
          </Button>
          
          {expandedSection === 'secondary' && (
            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
              {secondaryActions.map((action) => renderActionCard(action))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick tip */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Tip: Long press any action for more options</span>
        </div>
      </div>
    </div>
  );
};

export default MobileQuickActions;

// Enhanced touch styles for quick actions
const quickActionStyles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  /* Smooth animations for quick actions */
  @keyframes quickActionPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
  
  .animate-quick-pulse {
    animation: quickActionPulse 0.3s ease-in-out;
  }
  
  /* Touch feedback */
  @media (hover: none) and (pointer: coarse) {
    .hover\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .active\:scale-98:active {
      transform: scale(0.98);
    }
  }
  
  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .transition-all {
      transition: none;
    }
    
    .animate-in {
      animation: none;
    }
  }
`;

// Inject quick action styles
if (typeof document !== 'undefined') {
  const existingQuickActionStyles = document.getElementById('mobile-quick-actions-styles');
  if (!existingQuickActionStyles) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-quick-actions-styles';
    styleSheet.textContent = quickActionStyles;
    document.head.appendChild(styleSheet);
  }
}