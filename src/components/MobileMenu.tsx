
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2 } from "lucide-react";

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

  // Define the solutions with warmer, more human-friendly colors and design
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
      name: "Citizen Developer Enablement",
      href: "/solutions/citizen-developer-enablement", 
      icon: Lightbulb,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      description: "Equip business users to build and automate without coding"
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
      name: "Scalable Learning Support & Mentorship",
      href: "/solutions/scalable-learning-support-mentorship",
      icon: MessageCircle,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      description: "24/7 guidance to keep learners engaged and on track"
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

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button and Request Demo */}
      <div className="flex items-center space-x-2">
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
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
            {menuItems.map((item, index) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-all duration-300 transform hover:translate-x-2 animate-fade-in ${
                        activeSection === item.id ? 'text-future-green bg-future-green/10' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span>{item.name}</span>
                      {expandedDropdown === item.name ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedDropdown === item.name && (
                      <div className="ml-2 mt-3 space-y-2 bg-gradient-to-r from-smart-beige/30 to-future-green/10 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-future-green to-emerald rounded-full"></div>
                          <div className="text-xs font-medium text-business-black/70 font-inter">
                            Solutions for every team
                          </div>
                        </div>
                        {solutionsItems.map((solution, subIndex) => {
                          const IconComponent = solution.icon;
                          return (
                            <button
                              key={subIndex}
                              onClick={() => scrollToSection(solution.href)}
                              className="flex items-center w-full text-left px-3 py-3 hover:bg-white/50 rounded-xl transition-all duration-300 group border border-transparent hover:border-future-green/20"
                            >
                              <div className={`w-8 h-8 rounded-xl ${solution.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                <IconComponent className={`w-4 h-4 ${solution.iconColor}`} />
                              </div>
                              <div className="flex-1">
                                <div className="text-business-black font-medium font-inter text-sm group-hover:text-future-green transition-colors duration-300">
                                  {solution.name}
                                </div>
                                <div className="text-business-black/60 font-inter text-xs mt-1 group-hover:text-business-black/70 transition-colors duration-300">
                                  {solution.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        <div className="pt-2 mt-3 border-t border-gray-200/30">
                          <p className="text-xs text-business-black/50 font-inter text-center">
                            Designed with ❤️ for human-centered innovation
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={`block w-full text-left px-4 py-3 text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-all duration-300 transform hover:translate-x-2 animate-fade-in ${
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
            <div className="pt-4 border-t border-gray-200/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button 
                variant="outline" 
                className="w-full border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 rounded-xl"
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
