
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
  Ticket,
  Layout,
  ChartBar,
  School,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Load from localStorage or default to all expanded
    const saved = localStorage.getItem('sidebar-expanded-sections');
    return saved ? JSON.parse(saved) : {
      'Core Setup': true,
      'Skills & Analytics': true,
      'Learning Platform': true,
      'System': true
    };
  });
  const isMobile = useIsMobile();

  const getNavigationItems = () => {
    if (!userProfile) return [];

    // Special navigation for early access users
    if (isEarlyAccess) {
      return [
        { href: '/waiting-room', icon: Home, label: 'Overview', active: true },
        { section: 'Core Setup', icon: Layout },
        { href: '#', icon: Target, label: 'Positions', locked: true },
        { href: '#', icon: Upload, label: 'Add Team Members', locked: true },
        { href: '#', icon: Users, label: 'Employees', locked: true },
        { section: 'Skills & Analytics', icon: ChartBar },
        { href: '#', icon: BrainCircuit, label: 'Skills', locked: true },
        { href: '#', icon: BarChart3, label: 'Analytics', locked: true },
        { section: 'Learning Platform', icon: School },
        { href: '#', icon: BookOpen, label: 'Courses', locked: true },
        { href: '#', icon: Sparkles, label: 'AI Course Generator', locked: true },
      ];
    }

    switch (userProfile.role) {
      case 'super_admin':
        return [
          { href: '/admin', icon: Home, label: 'Dashboard' },
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
          { section: 'Core Setup', icon: Layout },
          { href: '/dashboard/positions', icon: Target, label: 'Positions' },
          { href: '/dashboard/onboarding', icon: Upload, label: 'Add Team Members' },
          { href: '/dashboard/employees', icon: Users, label: 'Employees' },
          { section: 'Skills & Analytics', icon: ChartBar },
          { href: '/dashboard/skills', icon: BrainCircuit, label: 'Skills' },
          { href: '/dashboard/analytics', icon: BarChart3, label: 'Game Engine' },
          { section: 'Learning Platform', icon: School },
          { href: '/dashboard/courses', icon: BookOpen, label: 'Courses' },
          { href: '/dashboard/course-generation', icon: Sparkles, label: 'AI Course Generator' },
          { section: 'System', icon: MoreHorizontal },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          { href: '#feedback', icon: MessageSquare, label: 'Platform Feedback', action: 'feedback' },
        ];
      case 'learner':
        return [
          { href: '/learner', icon: Home, label: 'Dashboard' },
          { href: '/learner/courses', icon: BookOpen, label: 'My Courses' },
          { href: '/learner/profile', icon: Users, label: 'My Profile' },
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

  const toggleSection = (sectionName: string) => {
    const newState = {
      ...expandedSections,
      [sectionName]: !expandedSections[sectionName]
    };
    setExpandedSections(newState);
    localStorage.setItem('sidebar-expanded-sections', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen bg-white dashboard-theme">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-smart-beige via-future-green/10 to-smart-beige shadow-2xl transition-all duration-300 ease-in-out backdrop-blur-md border-r border-future-green/20",
          sidebarExpanded ? "w-64" : "w-16"
        )}>
        {/* Background overlay for additional depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-business-black/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-future-green/8 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lxera-blue/8 rounded-full blur-2xl" />
        <div className="relative flex h-16 items-center justify-between border-b border-future-green/20 px-4 bg-white/80 backdrop-blur-sm">
          {sidebarExpanded && (
            <div className="flex items-center">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-business-black/80 hover:text-business-black hover:bg-future-green/20"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="relative mt-6 px-2">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              // Track current section for expand/collapse
              let currentSection = '';
              for (let i = index - 1; i >= 0; i--) {
                if (navigationItems[i].section) {
                  currentSection = navigationItems[i].section;
                  break;
                }
              }
              
              // Hide items if their section is collapsed
              if (currentSection && !item.section && expandedSections[currentSection] === false && sidebarExpanded) {
                return null;
              }
              // Handle section headers
              if (item.section) {
                const SectionIcon = item.icon;
                const isExpanded = expandedSections[item.section] !== false;
                return (
                  <div key={`section-${index}`} className={cn(
                    "pt-4 pb-2",
                    index !== 0 && "mt-4 border-t border-future-green/20"
                  )}>
                    {sidebarExpanded ? (
                      <button
                        onClick={() => toggleSection(item.section)}
                        className="flex items-center justify-between px-3 gap-2 w-full hover:bg-white/60 rounded-md py-1 transition-colors backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2">
                          {SectionIcon && <SectionIcon className="h-3 w-3 text-business-black/70" />}
                          <h3 className="text-xs font-semibold text-business-black/80 uppercase tracking-wider">
                            {item.section}
                          </h3>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-business-black/70" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-business-black/70" />
                        )}
                      </button>
                    ) : (
                      <div className="flex justify-center">
                        {SectionIcon && <SectionIcon className="h-4 w-4 text-business-black/70" />}
                      </div>
                    )}
                  </div>
                );
              }

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
                      "text-business-black/80 hover:bg-white/60 hover:text-business-black backdrop-blur-sm",
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
                      "text-business-black/50 bg-gray-200/40 backdrop-blur-sm",
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
                      ? "bg-gradient-to-r from-business-black to-future-green text-white shadow-lg"
                      : "text-business-black/80 hover:bg-white/60 hover:text-business-black backdrop-blur-sm",
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
