import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  X,
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
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Globe,
  ExternalLink
} from 'lucide-react';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHamburgerMenuProps {
  isEarlyAccess?: boolean;
  mockAuth?: any;
}

interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  action?: string;
  locked?: boolean;
  external?: boolean;
  subItems?: NavigationItem[];
  description?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const MobileHamburgerMenu: React.FC<MobileHamburgerMenuProps> = ({ 
  isEarlyAccess = false, 
  mockAuth 
}) => {
  const authContext = useAuth();
  const { userProfile, signOut } = isEarlyAccess && mockAuth ? mockAuth : authContext;
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getNavigationSections = (): NavigationSection[] => {
    if (!userProfile) return [];

    // Special navigation for early access users
    if (isEarlyAccess) {
      return [
        {
          title: 'Main',
          items: [
            { href: '/waiting-room', icon: Home, label: 'Overview', description: 'Dashboard overview' },
            { href: '#', icon: Target, label: 'Positions', locked: true, description: 'Manage job positions' },
            { href: '#', icon: Upload, label: 'Add Team Members', locked: true, description: 'Invite team members' },
            { href: '#', icon: Users, label: 'Employees', locked: true, description: 'Employee management' },
            { href: '#', icon: BrainCircuit, label: 'Skills', locked: true, description: 'Skills tracking' },
            { href: '#', icon: BookOpen, label: 'Courses', locked: true, description: 'Learning content' },
            { href: '#', icon: Sparkles, label: 'AI Course Generator', locked: true, description: 'AI-powered course creation' },
            { href: '#', icon: BarChart3, label: 'Analytics', locked: true, description: 'Performance insights' },
          ]
        }
      ];
    }

    switch (userProfile.role) {
      case 'super_admin':
        return [
          {
            title: 'Administration',
            items: [
              { href: '/admin', icon: Home, label: 'Dashboard', description: 'Admin overview' },
              { href: '/admin/tickets', icon: Ticket, label: 'Tickets', description: 'Support tickets' },
              { href: '/admin/leads', icon: Users2, label: 'Leads', description: 'Lead management' },
              { href: '/admin/feedback', icon: MessageSquare, label: 'Feedback', description: 'User feedback' },
            ]
          },
          {
            title: 'Management',
            items: [
              { href: '/admin/companies', icon: Building2, label: 'Companies', description: 'Company management' },
              { href: '/admin/users', icon: Users, label: 'Users', description: 'User management' },
              { href: '/admin/courses', icon: BookOpen, label: 'Courses', description: 'Course management' },
              { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', description: 'Platform analytics' },
            ]
          },
          {
            title: 'System',
            items: [
              { href: '/admin/settings', icon: Settings, label: 'Settings', description: 'System configuration' },
            ]
          }
        ];

      case 'company_admin':
        return [
          {
            title: 'Overview',
            items: [
              { href: '/dashboard', icon: Home, label: 'Dashboard', description: 'Company overview' },
              { href: '/dashboard/positions', icon: Target, label: 'Positions', description: 'Job positions' },
              { href: '/dashboard/onboarding', icon: Upload, label: 'Add Team Members', description: 'Employee onboarding' },
            ]
          },
          {
            title: 'Team Management',
            items: [
              { href: '/dashboard/employees', icon: Users, label: 'Employees', description: 'Team members' },
              { 
                href: '/dashboard/skills', 
                icon: BrainCircuit, 
                label: 'Skills', 
                description: 'Skills management',
                subItems: [
                  { href: '/dashboard/skills', icon: BrainCircuit, label: 'Skills Overview', description: 'Skills dashboard' },
                  { href: '/dashboard/skills/employees', icon: Users, label: 'Analyzed Employees', description: 'Employee skills analysis' },
                  { href: '/dashboard/skills/positions', icon: Target, label: 'Position Requirements', description: 'Position skill requirements' },
                ]
              },
            ]
          },
          {
            title: 'Learning & Development',
            items: [
              { href: '/dashboard/courses', icon: BookOpen, label: 'Courses', description: 'Learning content' },
              { href: '/dashboard/course-generation', icon: Sparkles, label: 'AI Course Generator', description: 'Create courses with AI' },
              { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', description: 'Learning analytics' },
            ]
          },
          {
            title: 'Support',
            items: [
              { href: '#feedback', icon: MessageSquare, label: 'Platform Feedback', action: 'feedback', description: 'Send feedback' },
            ]
          }
        ];

      case 'learner':
        return [
          {
            title: 'Learning',
            items: [
              { href: '/learner', icon: Home, label: 'Dashboard', description: 'Learning dashboard' },
              { href: '/learner/courses', icon: BookOpen, label: 'My Courses', description: 'Available courses' },
              { href: '/learner/certificates', icon: GraduationCap, label: 'Certificates', description: 'My achievements' },
            ]
          }
        ];

      default:
        return [];
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavigation = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '#feedback') return false;
    return location.pathname === href || 
      (href !== '/dashboard' && href !== '/admin' && href !== '/learner' && 
       location.pathname.startsWith(href));
  };

  const navigationSections = getNavigationSections();

  if (!isMobile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:w-80 p-0 bg-slate-900 border-slate-800"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                <div className="flex flex-col">
                  <SheetTitle className="text-white text-sm font-medium">
                    LXERA
                  </SheetTitle>
                  <SheetDescription className="text-slate-400 text-xs">
                    {userProfile?.role === 'super_admin' && 'Super Admin'}
                    {userProfile?.role === 'company_admin' && 'Company Admin'}
                    {userProfile?.role === 'learner' && 'Learner Portal'}
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* User Profile Section */}
          {userProfile && (
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-slate-700 text-white">
                    {getInitials(userProfile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {userProfile.email}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const sectionId = `${section.title}-${item.label}`;
                    const isExpanded = expandedSections.includes(sectionId);
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    if (item.action === 'feedback') {
                      return (
                        <FeedbackButton
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-auto py-3 px-3 rounded-lg transition-all duration-200 group",
                            "text-slate-300 hover:bg-slate-800 hover:text-white"
                          )}
                          showIcon={false}
                        >
                          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-slate-500 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </FeedbackButton>
                      );
                    }

                    if (item.locked) {
                      return (
                        <div
                          key={item.href}
                          className={cn(
                            "flex items-center py-3 px-3 rounded-lg transition-all duration-200 cursor-not-allowed",
                            "text-slate-500 bg-slate-800/30"
                          )}
                        >
                          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-slate-600 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <Lock className="h-4 w-4 ml-2 flex-shrink-0" />
                        </div>
                      );
                    }

                    if (hasSubItems) {
                      return (
                        <div key={item.href} className="space-y-1">
                          <button
                            onClick={() => toggleSection(sectionId)}
                            className={cn(
                              "w-full flex items-center py-3 px-3 rounded-lg transition-all duration-200 group",
                              active
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="ml-8 space-y-1">
                              {item.subItems.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const subActive = isActive(subItem.href);
                                
                                return (
                                  <Link
                                    key={subItem.href}
                                    to={subItem.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                      "flex items-center py-2 px-3 rounded-lg transition-all duration-200 group",
                                      subActive
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    )}
                                  >
                                    <SubIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                                    <div className="flex-1 text-left">
                                      <div className="font-medium text-sm">{subItem.label}</div>
                                      {subItem.description && (
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          {subItem.description}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => handleNavigation(item.href, item.external)}
                        className={cn(
                          "flex items-center py-3 px-3 rounded-lg transition-all duration-200 group",
                          active
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.badge && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.external && (
                          <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>© 2024 LXERA</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => handleNavigation('/legal/privacy', false)}
                >
                  <Shield className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => handleNavigation('/company/contact', false)}
                >
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileHamburgerMenu;