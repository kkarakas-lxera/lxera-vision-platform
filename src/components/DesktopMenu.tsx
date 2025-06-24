import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import DemoModal from "./DemoModal";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Cog, Shield, Plug, Zap, Target, Sparkles, BookOpen, Trophy, Gamepad2, Play, Book } from "lucide-react";

interface DesktopMenuProps {
  menuItems: Array<{
    name: string;
    href: string;
    id: string;
    hasDropdown?: boolean;
    dropdownItems?: Array<{
      category: string;
      items: Array<{
        name: string;
        href: string;
      }>;
    }>;
  }>;
  activeSection: string;
  scrollToSection: (href: string) => void;
}

const DesktopMenu = ({ menuItems, activeSection, scrollToSection }: DesktopMenuProps) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleRequestDemo = () => {
    setIsDemoModalOpen(true);
  };

  // Define the solutions with warmer, more human-friendly colors and design - reordered
  const solutionsItems = [
    {
      name: "AI-Personalized Learning",
      href: "/solutions/ai-personalized-learning",
      icon: Brain,
      color: "bg-gradient-to-br from-pink-100 to-rose-100",
      iconColor: "text-pink-600",
      description: "Personalized content and pathways — powered by AI"
    },
    {
      name: "Workforce Reskilling & Upskilling", 
      href: "/solutions/workforce-reskilling-upskilling",
      icon: Users,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      description: "Close skill gaps and future-proof your teams"
    },
    {
      name: "AI Gamification & Motivation",
      href: "/solutions/ai-gamification-motivation",
      icon: Gamepad2,
      color: "bg-gradient-to-br from-orange-100 to-red-100",
      iconColor: "text-orange-600",
      description: "Boost engagement with dynamic rewards and intelligent challenges"
    },
    {
      name: "AI Mentorship & Support",
      href: "/solutions/scalable-learning-support-mentorship",
      icon: MessageCircle,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      description: "Real-time guidance to keep learners engaged and on track"
    },
    {
      name: "Learning Analytics & Insights",
      href: "/solutions/learning-analytics-insights",
      icon: BarChart3,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100", 
      iconColor: "text-emerald-600",
      description: "Turn engagement data into actionable insights"
    },
    {
      name: "Citizen Developer Enablement",
      href: "/solutions/citizen-developer-enablement", 
      icon: Lightbulb,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      description: "Equip business users to build and automate without coding"
    },
    {
      name: "Enterprise Innovation Enablement",
      href: "/solutions/enterprise-innovation-enablement",
      icon: Building2,
      color: "bg-gradient-to-br from-slate-100 to-gray-100",
      iconColor: "text-slate-600",
      description: "Empower every level of the organization to drive transformation"
    }
  ];

  // Define platform items with icons and colors
  const platformItems = [
    {
      name: "How LXERA Works",
      href: "/platform/how-it-works",
      icon: Target,
      color: "bg-gradient-to-br from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
      description: "Discover the core methodology behind LXERA"
    },
    {
      name: "AI Engine",
      href: "/platform/ai-engine",
      icon: Sparkles,
      color: "bg-gradient-to-br from-purple-100 to-indigo-100",
      iconColor: "text-purple-600",
      description: "Advanced AI that powers personalized learning"
    },
    {
      name: "Engagement & Insights",
      href: "/platform/engagement-insights",
      icon: BarChart3,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      description: "Real-time analytics and engagement tracking"
    },
    {
      name: "Innovation Hub",
      href: "/platform/innovation-hub",
      icon: Lightbulb,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      description: "Collaborative space for innovation and ideation"
    },
    {
      name: "Mentorship & Support Tools",
      href: "/platform/mentorship-support",
      icon: MessageCircle,
      color: "bg-gradient-to-br from-rose-100 to-pink-100",
      iconColor: "text-rose-600",
      description: "AI-powered mentorship and support systems"
    },
    {
      name: "Security & Data Privacy",
      href: "/platform/security-privacy",
      icon: Shield,
      color: "bg-gradient-to-br from-gray-100 to-slate-100",
      iconColor: "text-gray-600",
      description: "Enterprise-grade security and privacy protection"
    },
    {
      name: "Integrations",
      href: "/platform/integrations",
      icon: Plug,
      color: "bg-gradient-to-br from-green-100 to-emerald-100",
      iconColor: "text-green-600",
      description: "Seamless integration with your existing tools"
    }
  ];

  // Updated resources items with new subcategories
  const resourcesItems = [
    {
      name: "Blog",
      href: "/resources/blog",
      icon: BookOpen,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      description: "Latest insights, trends, and best practices"
    },
    {
      name: "Product Tour",
      href: "/resources/product-tour",
      icon: Play,
      color: "bg-gradient-to-br from-green-100 to-emerald-100",
      iconColor: "text-green-600",
      description: "Interactive walkthrough of LXERA features"
    },
    {
      name: "Glossary",
      href: "/resources/glossary",
      icon: Book,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      description: "Key terms and definitions in learning technology"
    }
  ];

  // Updated highlighting effect - same expanding underline for all items with black color
  const getHighlightingEffect = (itemName: string, isActive: boolean) => {
    const baseClasses = "text-base text-business-black transition-all duration-300 font-normal relative group transform font-inter bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent";
    
    // Use the same expanding underline effect for all items with black color
    const underlineEffect = "hover:scale-105 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-business-black before:to-transparent before:scale-x-0 before:transition-transform before:duration-300 before:origin-center hover:before:scale-x-100";
    
    return `${baseClasses} ${isActive ? 'text-business-black' : ''} hover:text-business-black ${underlineEffect}`;
  };

  const renderDropdownContent = (item: any) => {
    if (item.name === 'Platform') {
      return (
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-6 min-w-[420px]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-future-green to-emerald rounded-full"></div>
              <h4 className="text-sm font-medium text-business-black/70 font-inter">
                Platform Features
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {platformItems.map((platform, index) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(platform.href)}
                    className="flex items-start w-full text-left p-3 hover:bg-gradient-to-r hover:from-future-green/5 hover:to-emerald/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-future-green/20"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${platform.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-business-black font-medium font-inter text-sm transition-colors duration-300">
                        {platform.name}
                      </div>
                      <div className="text-business-black/60 font-inter text-xs mt-1 transition-colors duration-300">
                        {platform.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 mt-4 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center">
                Designed with ❤️ for human-centered innovation
              </p>
            </div>
          </div>
        </NavigationMenuContent>
      );
    } else if (item.name === 'Solutions') {
      return (
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-6 min-w-[450px]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-future-green to-emerald rounded-full"></div>
              <h4 className="text-sm font-medium text-business-black/70 font-inter">
                Solutions for every team
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {solutionsItems.map((solution, index) => {
                const IconComponent = solution.icon;
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(solution.href)}
                    className="flex items-start w-full text-left p-3 hover:bg-gradient-to-r hover:from-future-green/5 hover:to-emerald/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-future-green/20"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${solution.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0`}>
                      <IconComponent className={`w-5 h-5 ${solution.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-business-black font-medium font-inter text-sm transition-colors duration-300 mb-1">
                        {solution.name}
                      </div>
                      <div className="text-business-black/60 font-inter text-xs transition-colors duration-300 line-clamp-1">
                        {solution.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 mt-4 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center">
                Designed with ❤️ for human-centered innovation
              </p>
            </div>
          </div>
        </NavigationMenuContent>
      );
    } else if (item.name === 'Resources') {
      return (
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-6 min-w-[420px]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-future-green to-emerald rounded-full"></div>
              <h4 className="text-sm font-medium text-business-black/70 font-inter">
                Learn & Explore
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {resourcesItems.map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(resource.href)}
                    className="flex items-start w-full text-left p-3 hover:bg-gradient-to-r hover:from-future-green/5 hover:to-emerald/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-future-green/20"
                  >
                    <div className={`w-10 h-10 rounded-2xl ${resource.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <IconComponent className={`w-5 h-5 ${resource.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-business-black font-medium font-inter text-sm transition-colors duration-300">
                        {resource.name}
                      </div>
                      <div className="text-business-black/60 font-inter text-xs mt-1 transition-colors duration-300">
                        {resource.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 mt-4 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center">
                Designed with ❤️ for human-centered innovation
              </p>
            </div>
          </div>
        </NavigationMenuContent>
      );
    }
    return null;
  };

  return (
    <>
      <div className="hidden lg:flex items-center space-x-3 font-inter">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-3">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <NavigationMenuTrigger
                      className={getHighlightingEffect(item.name, activeSection === item.id)}
                    >
                      {item.name}
                    </NavigationMenuTrigger>
                    {renderDropdownContent(item)}
                  </>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={getHighlightingEffect(item.name, activeSection === item.id)}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.name}
                  </button>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button
          onClick={handleRequestDemo}
          className="bg-business-black text-white hover:bg-business-black/90 font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
          aria-label="Request a demo"
        >
          Request a Demo
        </Button>

        <Link to="/login">
          <Button 
            variant="outline" 
            className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 rounded-xl px-6 py-3 font-inter font-normal"
          >
            Sign In
          </Button>
        </Link>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </>
  );
};

export default DesktopMenu;
