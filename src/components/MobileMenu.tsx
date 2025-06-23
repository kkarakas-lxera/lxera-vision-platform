import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Cog, Shield, Plug, Zap, Target, Sparkles, BookOpen, Trophy, Gamepad2, Play, Book } from "lucide-react";

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

  // Define the solutions with clean circular icons
  const solutionsItems = [
    {
      name: "AI-Personalized Learning",
      href: "/solutions/ai-personalized-learning",
      icon: Brain,
      color: "bg-pink-500",
      description: "Personalized content and pathways — powered by AI"
    },
    {
      name: "Workforce Reskilling & Upskilling", 
      href: "/solutions/workforce-reskilling-upskilling",
      icon: Users,
      color: "bg-blue-500",
      description: "Close skill gaps and future-proof your teams"
    },
    {
      name: "AI Gamification & Motivation",
      href: "/solutions/ai-gamification-motivation",
      icon: Gamepad2,
      color: "bg-orange-500",
      description: "Boost engagement with dynamic rewards and intelligent challenges"
    },
    {
      name: "AI Mentorship & Support",
      href: "/solutions/scalable-learning-support-mentorship",
      icon: MessageCircle,
      color: "bg-purple-500",
      description: "Real-time guidance to keep learners engaged and on track"
    },
    {
      name: "Learning Analytics & Insights",
      href: "/solutions/learning-analytics-insights",
      icon: BarChart3,
      color: "bg-emerald-500", 
      description: "Turn engagement data into actionable insights"
    },
    {
      name: "Citizen Developer Enablement",
      href: "/solutions/citizen-developer-enablement", 
      icon: Lightbulb,
      color: "bg-amber-500",
      description: "Equip business users to build and automate without coding"
    },
    {
      name: "Enterprise Innovation Enablement",
      href: "/solutions/enterprise-innovation-enablement",
      icon: Building2,
      color: "bg-slate-500",
      description: "Empower every level of the organization to drive transformation"
    }
  ];

  // Define platform items with clean circular icons
  const platformItems = [
    {
      name: "How LXERA Works",
      href: "/platform/how-it-works",
      icon: Target,
      color: "bg-blue-500",
      description: "Discover the core methodology behind LXERA"
    },
    {
      name: "AI Engine",
      href: "/platform/ai-engine",
      icon: Sparkles,
      color: "bg-purple-500",
      description: "Advanced AI that powers personalized learning"
    },
    {
      name: "Engagement & Insights",
      href: "/platform/engagement-insights",
      icon: BarChart3,
      color: "bg-emerald-500",
      description: "Real-time analytics and engagement tracking"
    },
    {
      name: "Innovation Hub",
      href: "/platform/innovation-hub",
      icon: Lightbulb,
      color: "bg-amber-500",
      description: "Collaborative space for innovation and ideation"
    },
    {
      name: "Mentorship & Support Tools",
      href: "/platform/mentorship-support",
      icon: MessageCircle,
      color: "bg-rose-500",
      description: "AI-powered mentorship and support systems"
    },
    {
      name: "Security & Data Privacy",
      href: "/platform/security-privacy",
      icon: Shield,
      color: "bg-gray-500",
      description: "Enterprise-grade security and privacy protection"
    },
    {
      name: "Integrations",
      href: "/platform/integrations",
      icon: Plug,
      color: "bg-green-500",
      description: "Seamless integration with your existing tools"
    }
  ];

  // Updated resources items
  const resourcesItems = [
    {
      name: "Blog",
      href: "/resources/blog",
      icon: BookOpen,
      color: "bg-blue-500",
      description: "Latest insights, trends, and best practices"
    },
    {
      name: "Product Tour",
      href: "/resources/product-tour",
      icon: Play,
      color: "bg-green-500",
      description: "Interactive walkthrough of LXERA features"
    },
    {
      name: "Glossary",
      href: "/resources/glossary",
      icon: Book,
      color: "bg-purple-500",
      description: "Key terms and definitions in learning technology"
    }
  ];

  const renderDropdownItems = (itemName: string) => {
    if (itemName === 'Platform') {
      return platformItems;
    } else if (itemName === 'Solutions') {
      return solutionsItems;
    } else if (itemName === 'Resources') {
      return resourcesItems;
    }
    return [];
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button and Request Demo */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleRequestDemo}
          className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-4 py-2 text-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          aria-label="Request a demo"
        >
          Request a Demo
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileMenuToggle}
          className="text-business-black hover:text-business-black/70 hover:bg-gray-100 transition-all duration-300"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown with improved scrolling */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-50 animate-slide-in-right">
          <div className="max-w-7xl mx-auto">
            <ScrollArea className="h-[calc(100vh-120px)] w-full">
              <div className="px-6 py-6 space-y-1">
                {menuItems.map((item, index) => (
                  <div key={item.name}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`flex items-center justify-between w-full text-left px-4 py-3 text-base font-medium text-business-black hover:bg-future-green/20 rounded-lg transition-all duration-200 animate-fade-in ${
                            activeSection === item.id ? 'bg-future-green/30' : ''
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <span>{item.name}</span>
                          {expandedDropdown === item.name ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        {expandedDropdown === item.name && (
                          <div className="ml-4 mt-2 bg-gray-50 rounded-xl p-4">
                            <div className="mb-3">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {item.name === 'Platform' ? 'Platform features' : 
                                 item.name === 'Solutions' ? 'Capabilities' : 
                                 'Resources'}
                              </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              <div className="space-y-1 pr-2">
                                {renderDropdownItems(item.name).map((dropdownItem, subIndex) => {
                                  const IconComponent = dropdownItem.icon;
                                  return (
                                    <button
                                      key={subIndex}
                                      onClick={() => scrollToSection(dropdownItem.href)}
                                      className="flex items-center w-full text-left px-3 py-3 hover:bg-future-green/20 text-business-black rounded-lg transition-all duration-200 group"
                                    >
                                      <div className={`w-8 h-8 rounded-full ${dropdownItem.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                                        <IconComponent className="w-4 h-4 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-business-black font-medium text-sm mb-0.5">
                                          {dropdownItem.name}
                                        </div>
                                        <div className="text-gray-600 text-xs line-clamp-2">
                                          {dropdownItem.description}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => scrollToSection(item.href)}
                        className={`block w-full text-left px-4 py-3 text-base font-medium text-business-black hover:bg-future-green/20 rounded-lg transition-all duration-200 animate-fade-in ${
                          activeSection === item.id ? 'bg-future-green/30' : ''
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        aria-current={activeSection === item.id ? 'page' : undefined}
                      >
                        {item.name}
                      </button>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-300 text-business-black hover:bg-future-green/20 hover:border-future-green/50 transition-all duration-200 rounded-xl font-medium"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
