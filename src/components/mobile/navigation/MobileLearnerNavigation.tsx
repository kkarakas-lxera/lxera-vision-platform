import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Award, 
  MoreHorizontal,
  Settings,
  HelpCircle,
  MessageSquare,
  User,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface MoreMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/learner'
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    path: '/learner/courses'
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    path: '/learner/progress'
  },
  {
    id: 'certificates',
    label: 'Certificates',
    icon: Award,
    path: '/learner/certificates'
  }
];

const moreMenuItems: MoreMenuItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/learner/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/learner/settings'
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    path: '/learner/help'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    path: '/learner/feedback'
  }
];

export function MobileLearnerNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { currentCourseProgress, isEnrolled } = useCourseProgress();

  // Only render for learner role
  if (role !== 'learner') {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Course Progress Indicator */}
      {isEnrolled && currentCourseProgress && (
        <div
          className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 lg:hidden transition-all duration-300 ease-out"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Current Course</p>
              <p className="text-xs text-gray-500">{currentCourseProgress.courseName}</p>
            </div>
            <div className="w-20">
              <Progress value={currentCourseProgress.progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{currentCourseProgress.progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden",
        isEnrolled && currentCourseProgress && "shadow-lg"
      )}>
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-h-[48px] min-w-[48px] flex-1",
                  "transition-all duration-200 relative group"
                )}
              >
                <div
                  className="relative active:scale-95 transition-transform duration-100"
                >
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                    )}
                  />
                  {item.badge && (
                    <span
                      className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-scale-in"
                    />
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-1 transition-colors",
                    active ? "text-primary font-medium" : "text-gray-500 group-hover:text-gray-700"
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300"
                  />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-3 min-h-[48px] min-w-[48px] flex-1 transition-all duration-200 relative group"
          >
            <div className="active:scale-95 transition-transform duration-100">
              <MoreHorizontal 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isMoreMenuOpen ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                )}
              />
            </div>
            <span 
              className={cn(
                "text-xs mt-1 transition-colors",
                isMoreMenuOpen ? "text-primary font-medium" : "text-gray-500 group-hover:text-gray-700"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 py-4">
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Button
                  key={item.id}
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}