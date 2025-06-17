
import { Button } from "@/components/ui/button";

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
  const handleRequestDemo = () => {
    scrollToSection('#contact');
  };

  return (
    <div className="hidden lg:flex items-center space-x-8 font-inter">
      <div className="flex items-center space-x-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
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
        ))}
      </div>

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
  );
};

export default DesktopMenu;
