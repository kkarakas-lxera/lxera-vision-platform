
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

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
                      <div className="ml-4 mt-2 space-y-2">
                        {item.dropdownItems?.map((category, categoryIndex) => (
                          <div key={categoryIndex}>
                            <div className="px-4 py-2 text-sm font-medium text-business-black/70 font-inter">
                              {category.category}
                            </div>
                            {category.items.map((subItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => scrollToSection(subItem.href)}
                                className="block w-full text-left px-6 py-2 text-sm text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-all duration-300 font-inter font-normal"
                              >
                                {subItem.name}
                              </button>
                            ))}
                          </div>
                        ))}
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
