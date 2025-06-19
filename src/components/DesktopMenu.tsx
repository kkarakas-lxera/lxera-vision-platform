
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

  // Define the solutions with icons and colors matching Writer.com style
  const solutionsItems = [
    {
      name: "AI-Personalized Learning",
      href: "/solutions/ai-personalized-learning",
      icon: Brain,
      color: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      name: "Workforce Reskilling & Upskilling", 
      href: "/solutions/workforce-reskilling-upskilling",
      icon: Users,
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      name: "Citizen-Led Innovation",
      href: "/solutions/citizen-led-innovation", 
      icon: Lightbulb,
      color: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      name: "Learning Analytics & Engagement Insights",
      href: "/solutions/learning-analytics-engagement",
      icon: BarChart3,
      color: "bg-orange-100", 
      iconColor: "text-orange-600"
    },
    {
      name: "AI Mentorship & 24/7 Support",
      href: "/solutions/ai-mentorship-support",
      icon: MessageCircle,
      color: "bg-cyan-100",
      iconColor: "text-cyan-600" 
    },
    {
      name: "Enterprise Innovation Enablement",
      href: "/solutions/enterprise-innovation-enablement",
      icon: Building2,
      color: "bg-amber-100",
      iconColor: "text-amber-600"
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
                    <NavigationMenuContent className="bg-white border border-gray-200 shadow-xl rounded-lg p-8 min-w-[420px]">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-business-black/60 mb-6 font-inter uppercase tracking-wider">
                          BY USE CASE
                        </h4>
                        <div className="space-y-3">
                          {solutionsItems.map((solution, index) => {
                            const IconComponent = solution.icon;
                            return (
                              <button
                                key={index}
                                onClick={() => scrollToSection(solution.href)}
                                className="flex items-center w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                              >
                                <div className={`w-12 h-12 rounded-full ${solution.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200`}>
                                  <IconComponent className={`w-6 h-6 ${solution.iconColor}`} />
                                </div>
                                <span className="text-business-black font-medium font-inter group-hover:text-future-green transition-colors duration-200">
                                  {solution.name}
                                </span>
                              </button>
                            );
                          })}
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
