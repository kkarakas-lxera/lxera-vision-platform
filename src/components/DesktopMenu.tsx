
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

interface DesktopMenuProps {
  menuItems: Array<{
    name: string;
    href: string;
    id: string;
  }>;
  activeSection: string;
  scrollToSection: (href: string) => void;
}

const DesktopMenu = ({ menuItems, activeSection, scrollToSection }: DesktopMenuProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = () => {
    setSearchOpen(!searchOpen);
    // Basic search functionality - could be enhanced
    if (!searchOpen) {
      const searchTerm = prompt("Search for...");
      if (searchTerm) {
        // Simple search - scroll to first matching section
        const matchingItem = menuItems.find(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingItem) {
          scrollToSection(matchingItem.href);
        }
      }
    }
  };

  return (
    <div className="hidden lg:flex items-center space-x-8">
      <div className="flex items-center space-x-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => scrollToSection(item.href)}
            className={`text-business-black hover:text-future-green transition-all duration-300 font-medium relative group transform hover:scale-105 ${
              activeSection === item.id ? 'text-future-green' : ''
            }`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.name}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-future-green transition-all duration-300 ${
              activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </button>
        ))}
      </div>

      {/* Enhanced Search Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSearch}
        className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300 hover:scale-105 hover:shadow-md"
        aria-label="Search site content"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Enhanced Sign In Button */}
      <Button 
        variant="outline" 
        className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105"
      >
        Sign In
      </Button>
    </div>
  );
};

export default DesktopMenu;
