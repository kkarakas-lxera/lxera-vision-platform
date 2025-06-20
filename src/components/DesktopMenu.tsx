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
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Cog, Shield, Plug, Zap, Target, Sparkles, BookOpen, Trophy } from "lucide-react";

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

  // Define the solutions with warmer, more human-friendly colors and design
  const solutionsItems = [
    {
      name: "AI-Personalized Learning",
      href: "/solutions/ai-personalized-learning",
      icon: Brain,
      color: "bg-gradient-to-br from-pink-100 to-rose-100",
      iconColor: "text-pink-600",
      description: "Personalized content and pathways — powered by AI",
      priority: "high"
    },
    {
      name: "Workforce Reskilling & Upskilling", 
      href: "/solutions/workforce-reskilling-upskilling",
      icon: Users,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      description: "Close skill gaps and future-proof your teams",
      priority: "high"
    },
    {
      name: "Citizen Developer Enablement",
      href: "/solutions/citizen-developer-enablement", 
      icon: Lightbulb,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      description: "Equip business users to build and automate without coding",
      priority: "medium"
    },
    {
      name: "Learning Analytics & Insights",
      href: "/solutions/learning-analytics-insights",
      icon: BarChart3,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100", 
      iconColor: "text-emerald-600",
      description: "Turn engagement data into actionable insights",
      priority: "medium"
    },
    {
      name: "Scalable Learning Support & Mentorship",
      href: "/solutions/scalable-learning-support-mentorship",
      icon: MessageCircle,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      description: "24/7 guidance to keep learners engaged and on track",
      priority: "medium"
    },
    {
      name: "Enterprise Innovation Enablement",
      href: "/solutions/enterprise-innovation-enablement",
      icon: Building2,
      color: "bg-gradient-to-br from-slate-100 to-gray-100",
      iconColor: "text-slate-600",
      description: "Empower every level of the organization to drive transformation",
      priority: "high"
    }
  ];

  // Define platform items grouped by category
  const platformCoreFeatures = [
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
    }
  ];

  const platformSecurityIntegration = [
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

  // Define resources items with icons and colors
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
      name: "Success Stories",
      href: "/resources/success-stories",
      icon: Trophy,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      description: "Real transformations from our customers"
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
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-8 min-w-[580px]">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-future-green to-emerald rounded-full shadow-sm"></div>
              <h4 className="text-lg font-semibold text-business-black font-inter">
                Platform Features
              </h4>
            </div>
            
            {/* Core Features Section */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-business-black/60 font-inter uppercase tracking-wide">
                Core Features
              </h5>
              <div className="grid grid-cols-2 gap-4">
                {platformCoreFeatures.map((platform, index) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToSection(platform.href)}
                      className="flex items-start w-full text-left p-4 hover:bg-gradient-to-r hover:from-future-green/8 hover:to-emerald/8 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/20 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${platform.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg`}>
                        <IconComponent className={`w-6 h-6 ${platform.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300 mb-1">
                          {platform.name}
                        </div>
                        <div className="text-business-black/60 font-inter text-xs leading-relaxed group-hover:text-business-black/75 transition-colors duration-300">
                          {platform.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security & Integration Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200/40">
              <h5 className="text-sm font-medium text-business-black/60 font-inter uppercase tracking-wide">
                Security & Integration
              </h5>
              <div className="grid grid-cols-1 gap-3">
                {platformSecurityIntegration.map((platform, index) => {
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToSection(platform.href)}
                      className="flex items-start w-full text-left p-4 hover:bg-gradient-to-r hover:from-future-green/8 hover:to-emerald/8 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/20 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${platform.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg`}>
                        <IconComponent className={`w-6 h-6 ${platform.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300 mb-1">
                          {platform.name}
                        </div>
                        <div className="text-business-black/60 font-inter text-xs leading-relaxed group-hover:text-business-black/75 transition-colors duration-300">
                          {platform.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center italic">
                Designed with ❤️ for human-centered innovation
              </p>
            </div>
          </div>
        </NavigationMenuContent>
      );
    } else if (item.name === 'Solutions') {
      return (
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-8 min-w-[520px]">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-future-green to-emerald rounded-full shadow-sm"></div>
              <h4 className="text-lg font-semibold text-business-black font-inter">
                Solutions for every team
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {solutionsItems.map((solution, index) => {
                const IconComponent = solution.icon;
                const isHighPriority = solution.priority === 'high';
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(solution.href)}
                    className={`flex flex-col items-start w-full text-left p-4 hover:bg-gradient-to-r hover:from-future-green/8 hover:to-emerald/8 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/20 hover:shadow-lg hover:scale-[1.02] ${isHighPriority ? 'ring-1 ring-future-green/20' : ''}`}
                  >
                    <div className="flex items-start w-full mb-3">
                      <div className={`w-12 h-12 rounded-2xl ${solution.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${solution.iconColor}`} />
                      </div>
                      {isHighPriority && (
                        <div className="bg-future-green/20 text-future-green text-xs px-2 py-1 rounded-full font-medium">
                          Popular
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300 mb-2 leading-tight">
                        {solution.name}
                      </div>
                      <div className="text-business-black/60 font-inter text-xs leading-relaxed group-hover:text-business-black/75 transition-colors duration-300">
                        {solution.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-4 mt-6 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center italic">
                Designed with ❤️ for human-centered innovation
              </p>
            </div>
          </div>
        </NavigationMenuContent>
      );
    } else if (item.name === 'Resources') {
      return (
        <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-6 min-w-[420px]">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-future-green to-emerald rounded-full shadow-sm"></div>
              <h4 className="text-lg font-semibold text-business-black font-inter">
                Learn & Explore
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {resourcesItems.map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <button
                    key={index}
                    onClick={() => scrollToSection(resource.href)}
                    className="flex items-start w-full text-left p-4 hover:bg-gradient-to-r hover:from-future-green/8 hover:to-emerald/8 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/20 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${resource.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg`}>
                      <IconComponent className={`w-6 h-6 ${resource.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300 mb-1">
                        {resource.name}
                      </div>
                      <div className="text-business-black/60 font-inter text-xs leading-relaxed group-hover:text-business-black/75 transition-colors duration-300">
                        {resource.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-4 mt-6 border-t border-gray-200/50">
              <p className="text-xs text-business-black/50 font-inter text-center italic">
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

        {/* Request Demo Button - Header version with distinct color */}
        <Button
          onClick={handleRequestDemo}
          className="bg-business-black text-white hover:bg-business-black/90 font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
          aria-label="Request a demo"
        >
          Request a demo
        </Button>

        {/* Enhanced Sign In Button */}
        <Button 
          variant="outline" 
          className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 rounded-xl px-6 py-3 font-inter font-normal"
        >
          Sign In
        </Button>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </>
  );
};

export default DesktopMenu;
