
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
  Ticket,
  Layout,
  ChartBar,
  School,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { MobileAdminNavigation, MobileCompanyNavigation, MobileLearnerNavigation } from '@/components/mobile/navigation';
import MobileHamburgerMenu from '@/components/mobile/navigation/MobileHamburgerMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

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
  const profileCompletion = useProfileCompletion();
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    // Start with sidebar closed for learners, open for others
    return userProfile?.role !== 'learner';
  });
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

    const isFreeTrial = userProfile.companies?.plan_type === 'free_skills_gap';
    
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
          { href: isFreeTrial ? '#' : '/dashboard/analytics', icon: BarChart3, label: 'Game Engine', locked: isFreeTrial },
          { section: 'Learning Platform', icon: School },
          { href: isFreeTrial ? '#' : '/dashboard/courses', icon: BookOpen, label: 'Courses', locked: isFreeTrial },
          { href: isFreeTrial ? '#' : '/dashboard/course-generation', icon: Sparkles, label: 'AI Course Generator', locked: isFreeTrial },
          { section: 'System', icon: MoreHorizontal },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        ];
      case 'learner':
        // Learners only see My Profile - whether complete or incomplete
        return [
          { href: '/learner/profile', icon: Users, label: 'My Profile' },
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
    <TooltipProvider>
    <div className="min-h-screen bg-white dashboard-theme font-inter">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 bg-slate-900 shadow-xl transition-all duration-300 ease-in-out font-inter",
          sidebarExpanded ? "w-64" : "w-16"
        )}>
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          {sidebarExpanded && (
            <div className="flex items-center">
              <img
                src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
                alt="LXERA logo"
                className="h-8 object-contain filter invert"
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
            className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="mt-6 px-2">
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
                    index !== 0 && "mt-4 border-t border-slate-700"
                  )}>
                    {sidebarExpanded ? (
                      <button
                        onClick={() => toggleSection(item.section)}
                        className="flex items-center justify-between px-3 gap-2 w-full hover:bg-slate-700 rounded-md py-1 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {SectionIcon && <SectionIcon className="h-3 w-3 text-slate-400" />}
                          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            {item.section}
                          </h3>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <div className="flex justify-center">
                        {SectionIcon && <SectionIcon className="h-4 w-4 text-slate-400" />}
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
                    key={`${item.href}-${index}`}
                    variant="ghost"
                    className={cn(
                      "flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group w-full justify-start",
                      "text-slate-300 hover:bg-slate-700 hover:text-white",
                      !sidebarExpanded && "justify-center",
                      currentSection && sidebarExpanded && "ml-4"
                    )}
                    title={!sidebarExpanded ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4", sidebarExpanded && "mr-2")} />
                    {sidebarExpanded && <span>{item.label}</span>}
                  </FeedbackButton>
                );
              }
              
              // Handle locked items for early access
              if (item.locked) {
                const tooltipContent = isEarlyAccess 
                  ? "Available in full version" 
                  : "Upgrade to unlock this feature";
                
                return (
                  <Tooltip key={`${item.href}-${index}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group cursor-not-allowed",
                          "text-slate-500 bg-slate-800/50",
                          !sidebarExpanded && "justify-center",
                          currentSection && sidebarExpanded && "ml-4"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", sidebarExpanded && "mr-2")} />
                        {sidebarExpanded && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded">
                              PREMIUM
                            </span>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-amber-50 border-amber-200 text-amber-800">
                      <p>{tooltipContent}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
              return (
                <Link
                  key={`${item.href}-${index}`}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white",
                    !sidebarExpanded && "justify-center",
                    // Add left margin for items within a section when sidebar is expanded
                    currentSection && sidebarExpanded && "ml-4"
                  )}
                  title={!sidebarExpanded ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4", sidebarExpanded && "mr-2")} />
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
        <div className="flex h-16 items-center justify-between bg-white px-4 md:px-6 shadow-sm font-inter">
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
              <h2 className="text-lg font-semibold text-gray-900 font-inter">
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
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-3">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{userProfile?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{userProfile?.email}</p>
                    </div>
                    
                    {/* Show position and department for learners */}
                    {userProfile?.role === 'learner' && userProfile?.employee && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="space-y-2">
                          {(userProfile.employee.st_company_positions?.position_title || userProfile.employee.position) && (
                            <div>
                              <p className="text-xs text-gray-500">Position</p>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">
                                {userProfile.employee.st_company_positions?.position_title || userProfile.employee.position}
                              </p>
                            </div>
                          )}
                          {(userProfile.employee.st_company_positions?.department || userProfile.employee.department) && (
                            <div>
                              <p className="text-xs text-gray-500">Department</p>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">
                                {userProfile.employee.st_company_positions?.department || userProfile.employee.department}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Company</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {userProfile?.companies?.name || 'Company'}
                          </p>
                        </div>
                        {userProfile?.role !== 'learner' && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Plan</p>
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5",
                              userProfile?.companies?.plan_type === 'free_skills_gap' 
                                ? "bg-amber-100 text-amber-800"
                                : "bg-indigo-100 text-indigo-800"
                            )}>
                              {userProfile?.companies?.plan_type === 'free_skills_gap' ? 'Free Trial' : 'Premium'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className={cn("p-6 font-inter", isMobile && "p-4")}>
          {children}
        </main>
      </div>

      {/* Mobile navigation is now handled by MobileHamburgerMenu in the header */}
    </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
