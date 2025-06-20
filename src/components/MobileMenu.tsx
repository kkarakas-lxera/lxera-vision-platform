import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Cog, Shield, Plug, Zap, Target, Sparkles, BookOpen, Trophy } from "lucide-react";

interface MobileMenuProps {
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
  isMobileMenuOpen: boolean;
  handleMobileMenuToggle: () => void;
  scrollToSection: (href: string) => void;
}

const MobileMenu = ({ 
  menuItems, 
  activeSection, 
  isMobileMenuOpen, 
  handleMobileMenuToggle, 
  scrollToSection 
}: MobileMenuProps) => {
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  const handleRequestDemo = () => {
    scrollToSection('#contact');
  };

  const toggleDropdown = (itemName: string) => {
    setExpandedDropdown(expandedDropdown === itemName ? null : itemName);
  };

  // Define the solutions with enhanced organization
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
      name: "Enterprise Innovation Enablement",
      href: "/solutions/enterprise-innovation-enablement",
      icon: Building2,
      color: "bg-gradient-to-br from-slate-100 to-gray-100",
      iconColor: "text-slate-600",
      description: "Empower every level of the organization to drive transformation",
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

  const renderDropdownItems = (itemName: string) => {
    if (itemName === 'Platform') {
      return (
        <div className="space-y-4">
          {/* Core Features Section */}
          <div className="space-y-3">
            <h6 className="text-xs font-medium text-business-black/50 font-inter uppercase tracking-wide px-3">
              Core Features
            </h6>
            {platformCoreFeatures.map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(platform.href)}
                  className="flex items-center w-full text-left px-3 py-4 hover:bg-white/60 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/30 hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-2xl ${platform.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300">
                      {platform.name}
                    </div>
                    <div className="text-business-black/60 font-inter text-xs mt-1 group-hover:text-business-black/70 transition-colors duration-300 leading-relaxed">
                      {platform.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Security & Integration Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200/40">
            <h6 className="text-xs font-medium text-business-black/50 font-inter uppercase tracking-wide px-3">
              Security & Integration
            </h6>
            {platformSecurityIntegration.map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(platform.href)}
                  className="flex items-center w-full text-left px-3 py-4 hover:bg-white/60 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/30 hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-2xl ${platform.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300">
                      {platform.name}
                    </div>
                    <div className="text-business-black/60 font-inter text-xs mt-1 group-hover:text-business-black/70 transition-colors duration-300 leading-relaxed">
                      {platform.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    } else if (itemName === 'Solutions') {
      return solutionsItems.map((solution, index) => {
        const IconComponent = solution.icon;
        const isHighPriority = solution.priority === 'high';
        return (
          <button
            key={index}
            onClick={() => scrollToSection(solution.href)}
            className={`flex items-center w-full text-left px-3 py-4 hover:bg-white/60 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/30 hover:shadow-md ${isHighPriority ? 'ring-1 ring-future-green/20' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl ${solution.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm flex-shrink-0`}>
              <IconComponent className={`w-5 h-5 ${solution.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300">
                  {solution.name}
                </div>
                {isHighPriority && (
                  <div className="bg-future-green/20 text-future-green text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </div>
                )}
              </div>
              <div className="text-business-black/60 font-inter text-xs group-hover:text-business-black/70 transition-colors duration-300 leading-relaxed">
                {solution.description}
              </div>
            </div>
          </button>
        );
      });
    } else if (itemName === 'Resources') {
      return resourcesItems.map((resource, index) => {
        const IconComponent = resource.icon;
        return (
          <button
            key={index}
            onClick={() => scrollToSection(resource.href)}
            className="flex items-center w-full text-left px-3 py-4 hover:bg-white/60 rounded-2xl transition-all duration-300 group border border-transparent hover:border-future-green/30 hover:shadow-md"
          >
            <div className={`w-10 h-10 rounded-2xl ${resource.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              <IconComponent className={`w-5 h-5 ${resource.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-business-black font-semibold font-inter text-sm group-hover:text-future-green transition-colors duration-300">
                {resource.name}
              </div>
              <div className="text-business-black/60 font-inter text-xs mt-1 group-hover:text-business-black/70 transition-colors duration-300 leading-relaxed">
                {resource.description}
              </div>
            </div>
          </button>
        );
      });
    }
    return [];
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button and Request Demo */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleRequestDemo}
          className="bg-business-black text-white hover:bg-business-black/90 font-semibold px-4 py-2 text-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
          aria-label="Request a demo"
        >
          Request a demo
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileMenuToggle}
          className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Enhanced Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-t border-gray-200/50 z-40 animate-slide-in-right">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {menuItems.map((item, index) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center justify-between w-full text-left px-4 py-4 text-base text-business-black hover:text-future-green hover:bg-future-green/10 rounded-xl transition-all duration-300 transform hover:translate-x-1 animate-fade-in font-semibold ${
                        activeSection === item.id ? 'text-future-green bg-future-green/10' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span>{item.name}</span>
                      {expandedDropdown === item.name ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    {expandedDropdown === item.name && (
                      <div className="ml-2 mt-4 space-y-3 bg-gradient-to-r from-smart-beige/30 to-future-green/10 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-3 h-3 bg-gradient-to-r from-future-green to-emerald rounded-full shadow-sm"></div>
                          <div className="text-sm font-semibold text-business-black/70 font-inter">
                            {item.name === 'Platform' ? 'Platform Features' : 
                             item.name === 'Solutions' ? 'Solutions for every team' : 
                             'Learn & Explore'}
                          </div>
                        </div>
                        {renderDropdownItems(item.name)}
                        <div className="pt-4 mt-6 border-t border-gray-200/30">
                          <p className="text-xs text-business-black/50 font-inter text-center italic">
                            Designed with ❤️ for human-centered innovation
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={`block w-full text-left px-4 py-4 text-base text-business-black hover:text-future-green hover:bg-future-green/10 rounded-xl transition-all duration-300 transform hover:translate-x-1 animate-fade-in font-semibold ${
                      activeSection === item.id ? 'text-future-green bg-future-green/10' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            <div className="pt-6 border-t border-gray-200/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button 
                variant="outline" 
                className="w-full border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 rounded-xl py-4 font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
