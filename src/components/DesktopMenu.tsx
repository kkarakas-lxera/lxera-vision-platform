
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
import { Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2 } from "lucide-react";

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
    <>
      <div className="hidden lg:flex items-center space-x-8 font-inter">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasDropdown ? (
                  <>
                    <NavigationMenuTrigger
                      className={`text-business-black hover:text-future-green transition-all duration-300 font-normal relative group transform hover:scale-105 font-inter bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent ${
                        activeSection === item.id ? 'text-future-green' : ''
                      }`}
                    >
                      {item.name}
                      <span className={`absolute -bottom-1 left-0 h-0.5 bg-future-green transition-all duration-300 ${
                        activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-2xl p-6 min-w-[420px]">
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
                                <div className={`w-10 h-10 rounded-2xl ${solution.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                  <IconComponent className={`w-5 h-5 ${solution.iconColor}`} />
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
                        </div>
                        <div className="pt-3 mt-4 border-t border-gray-200/50">
                          <p className="text-xs text-business-black/50 font-inter text-center">
                            Designed with ❤️ for human-centered innovation
                          </p>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={`text-business-black hover:text-future-green transition-all duration-300 font-normal relative group transform hover:scale-105 font-inter ${
                      activeSection === item.id ? 'text-future-green' : ''
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-future-green transition-all duration-300 ${
                      activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
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
