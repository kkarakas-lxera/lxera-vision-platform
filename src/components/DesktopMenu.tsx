
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
                    <NavigationMenuContent className="bg-white border border-gray-200 shadow-xl rounded-lg p-6 min-w-[400px]">
                      <div className="grid grid-cols-1 gap-6">
                        {item.dropdownItems?.map((category, categoryIndex) => (
                          <div key={categoryIndex}>
                            <h4 className="text-sm font-medium text-business-black mb-3 font-inter">
                              {category.category}
                            </h4>
                            <div className="space-y-2">
                              {category.items.map((subItem, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => scrollToSection(subItem.href)}
                                  className="block w-full text-left px-3 py-2 text-sm text-business-black hover:text-future-green hover:bg-future-green/10 rounded-md transition-all duration-200 font-inter font-normal"
                                >
                                  {subItem.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
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
