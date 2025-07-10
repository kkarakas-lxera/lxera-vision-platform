import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Users2,
  Users,
  BookOpen,
  MoreHorizontal,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  Upload,
  Target,
  BrainCircuit,
  GraduationCap,
} from 'lucide-react';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
  action?: string;
}

interface MobileAdminNavigationProps {
  navigationItems: NavigationItem[];
  userRole?: string;
}

const MobileAdminNavigation: React.FC<MobileAdminNavigationProps> = ({ 
  navigationItems,
  userRole 
}) => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Determine primary navigation items based on role
  const getPrimaryItems = (): NavigationItem[] => {
    if (!userRole) return [];

    switch (userRole) {
      case 'super_admin':
        return [
          { href: '/admin', icon: Home, label: 'Dashboard' },
          { href: '/admin/leads', icon: Users2, label: 'Leads' },
          { href: '/admin/users', icon: Users, label: 'Users' },
          { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
        ];
      case 'company_admin':
        return [
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/dashboard/positions', icon: Target, label: 'Positions' },
          { href: '/dashboard/employees', icon: Users, label: 'Employees' },
          { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
        ];
      case 'learner':
        return [
          { href: '/learner', icon: Home, label: 'Dashboard' },
          { href: '/learner/courses', icon: BookOpen, label: 'Courses' },
          { href: '/learner/certificates', icon: GraduationCap, label: 'Certificates' },
        ];
      default:
        return [];
    }
  };

  const primaryItems = getPrimaryItems();
  const secondaryItems = navigationItems.filter(
    item => !primaryItems.find(primary => primary.href === item.href)
  );

  const isActive = (href: string) => {
    if (href === '#feedback') return false;
    return location.pathname === href || 
      (href !== '/dashboard' && href !== '/admin' && href !== '/learner' && 
       location.pathname.startsWith(href));
  };

  const handleNavItemClick = () => {
    setSheetOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[48px] transition-all duration-200",
                "active:scale-95",
                active
                  ? "text-blue-500 bg-slate-800"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {secondaryItems.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-h-[48px] transition-all duration-200 p-0 rounded-none",
                  "active:scale-95",
                  "text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700"
                )}
              >
                <MoreHorizontal className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-slate-900 border-slate-800">
              <SheetHeader>
                <SheetTitle className="text-white">More Options</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  if (item.action === 'feedback') {
                    return (
                      <FeedbackButton
                        key={item.href}
                        variant="ghost"
                        className={cn(
                          "flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                          "text-slate-300 hover:bg-slate-800 hover:text-white active:scale-98"
                        )}
                        onClick={() => setSheetOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                      </FeedbackButton>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavItemClick}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                        "active:scale-98",
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default MobileAdminNavigation;