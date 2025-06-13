
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";

interface MobileMenuProps {
  menuItems: Array<{
    name: string;
    href: string;
    id: string;
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
  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-business-black hover:text-future-green hover:bg-future-green/10"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileMenuToggle}
          className="text-business-black hover:text-future-green hover:bg-future-green/10"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`block w-full text-left px-4 py-3 text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-colors duration-200 ${
                  activeSection === item.id ? 'text-future-green bg-future-green/10' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full border-business-black text-business-black hover:bg-business-black hover:text-white transition-all duration-300"
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
