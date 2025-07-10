
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  BarChart3,
  GraduationCap,
  Home,
  Menu,
  ChevronLeft,
  Upload,
  Target,
  BrainCircuit,
  MessageSquare,
  Users2,
  HelpCircle,
  FileText,
  Sparkles,
  Lock,
  Ticket
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { MobileAdminNavigation, MobileCompanyNavigation, MobileLearnerNavigation } from '@/components/mobile/navigation';
import MobileHamburgerMenu from '@/components/mobile/navigation/MobileHamburgerMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isEarlyAccess?: boolean;
  mockAuth?: any;
  hideNavigation?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, isEarlyAccess = false, mockAuth, hideNavigation = false }) => {
  const authContext = useAuth();
  const { userProfile, signOut } = isEarlyAccess && mockAuth ? mockAuth : authContext;
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const isMobile = useIsMobile();

  const getNavigationItems = () => {
    if (!userProfile) return [];

    // Special navigation for early access users
    if (isEarlyAccess) {
      return [
        { href: '/waiting-room', icon: Home, label: 'Overview', active: true },
        { href: '#', icon: Target, label: 'Positions', locked: true },
        { href: '#', icon: Upload, label: 'Add Team Members', locked: true },
        { href: '#', icon: Users, label: 'Employees', locked: true },
        { href: '#', icon: BrainCircuit, label: 'Skills', locked: true },
        { href: '#', icon: BookOpen, label: 'Courses', locked: true },
        { href: '#', icon: Sparkles, label: 'AI Course Generator', locked: true },
        { href: '#', icon: BarChart3, label: 'Analytics', locked: true },
      ];
    }

    switch (userProfile.role) {
      case 'super_admin':
        return [
          { href: '/admin', icon: Home, label: 'Dashboard' },
          { href: '/admin/tickets', icon: Ticket, label: 'Tickets' },
          { href: '/admin/leads', icon: Users2, label: 'Leads' },
          { href: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
          { href: '/admin/companies', icon: Building2, label: 'Companies' },
          { href: '/admin/users', icon: Users, label: 'Users' },
          { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
          { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
          { href: '/admin/settings', icon: Settings, label: 'Settings' },
        ];
      case 'company_admin':
        return [
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/dashboard/positions', icon: Target, label: 'Positions' },
          { href: '/dashboard/onboarding', icon: Upload, label: 'Add Team Members' },
          { href: '/dashboard/employees', icon: Users, label: 'Employees' },
          { href: '/dashboard/skills', icon: BrainCircuit, label: 'Skills' },
          { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
          { href: '/dashboard/course-generation', icon: Sparkles, label: 'AI Course Generator' },
          { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
          { href: '#feedback', icon: MessageSquare, label: 'Platform Feedback', action: 'feedback' },
        ];
      case 'learner':
        return [
          { href: '/learner', icon: Home, label: 'Dashboard' },
          { href: '/learner/courses', icon: BookOpen, label: 'My Courses' },
          { href: '/learner/certificates', icon: GraduationCap, label: 'Certificates' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 bg-slate-900 shadow-xl transition-all duration-300 ease-in-out",
          sidebarExpanded ? "w-64" : "w-16"
        )}>
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          {sidebarExpanded && (
            <div className="flex items-center">
              <img
                src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
                alt="LXERA logo"
                className="h-8 object-contain brightness-0 invert"
                draggable={false}
                width={100}
                height={32}
                loading="eager"
                decoding="sync"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="mt-6 px-2">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/learner' && 
                 item.href !== '#feedback' && location.pathname.startsWith(item.href));
              
              if (item.action === 'feedback') {
                return (
                  <FeedbackButton
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group w-full justify-start",
                      "text-slate-300 hover:bg-slate-800 hover:text-white",
                      !sidebarExpanded && "justify-center"
                    )}
                    title={!sidebarExpanded ? item.label : undefined}
                  >
                    <Icon className={cn("h-5 w-5", sidebarExpanded && "mr-3")} />
                    {sidebarExpanded && <span>{item.label}</span>}
                  </FeedbackButton>
                );
              }
              
              // Handle locked items for early access
              if (item.locked) {
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group cursor-not-allowed",
                      "text-slate-500 bg-slate-800/30",
                      !sidebarExpanded && "justify-center"
                    )}
                    title={!sidebarExpanded ? `${item.label} (Locked)` : undefined}
                  >
                    <Icon className={cn("h-5 w-5", sidebarExpanded && "mr-3")} />
                    {sidebarExpanded && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <Lock className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    !sidebarExpanded && "justify-center"
                  )}
                  title={!sidebarExpanded ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5", sidebarExpanded && "mr-3")} />
                  {sidebarExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      )}

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        !isMobile && (sidebarExpanded ? "pl-64" : "pl-16"),
        isMobile && "pb-16" // Add padding bottom for mobile navigation
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between bg-white px-4 md:px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <div className="flex items-center space-x-3">
                <MobileHamburgerMenu isEarlyAccess={isEarlyAccess} mockAuth={mockAuth} />
                <img
                  src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
                  alt="LXERA logo"
                  className="h-8 object-contain"
                  draggable={false}
                  width={100}
                  height={32}
                  loading="eager"
                  decoding="sync"
                />
              </div>
            )}
            {!isMobile && (
              <h2 className="text-lg font-semibold text-gray-900">
                {userProfile?.role === 'super_admin' && 'Super Admin'}
                {userProfile?.role === 'company_admin' && 'Company Admin'}
                {userProfile?.role === 'learner' && 'Learner Portal'}
              </h2>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {userProfile ? getInitials(userProfile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userProfile?.full_name}</p>
                  <p className="text-xs text-gray-500">{userProfile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className={cn("p-6", isMobile && "p-4")}>
          {children}
        </main>
      </div>

      {/* Mobile navigation is now handled by MobileHamburgerMenu in the header */}
    </div>
  );
};

export default DashboardLayout;
