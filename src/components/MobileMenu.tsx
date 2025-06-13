
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";

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
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = () => {
    const searchTerm = prompt("Search for...");
    if (searchTerm) {
      const matchingItem = menuItems.find(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingItem) {
        scrollToSection(matchingItem.href);
      }
    }
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearch}
          className="text-business-black hover:text-brand-accent hover:bg-brand-accent/10 transition-all duration-300"
          aria-label="Search site content"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileMenuToggle}
          className="text-business-black hover:text-brand-accent hover:bg-brand-accent/10 transition-all duration-300"
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
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`block w-full text-left px-4 py-3 text-business-black hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all duration-300 transform hover:translate-x-2 animate-fade-in ${
                  activeSection === item.id ? 'text-brand-accent bg-brand-accent/10' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.name}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-200/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button 
                variant="outline" 
                className="w-full border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300"
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
