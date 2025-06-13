
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  return (
    <div className="hidden lg:flex items-center space-x-8">
      <div className="flex items-center space-x-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => scrollToSection(item.href)}
            className={`text-business-black hover:text-future-green transition-colors duration-300 font-medium relative group ${
              activeSection === item.id ? 'text-future-green' : ''
            }`}
          >
            {item.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
          </button>
        ))}
      </div>

      {/* Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-business-black hover:text-future-green hover:bg-future-green/10"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Sign In Button */}
      <Button 
        variant="outline" 
        className="border-business-black text-business-black hover:bg-business-black hover:text-white transition-all duration-300 shadow-none hover:shadow-md"
      >
        Sign In
      </Button>
    </div>
  );
};

export default DesktopMenu;
