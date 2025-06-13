
import { useNavigation } from "@/hooks/useNavigation";
import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

const Navigation = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    activeSection,
    menuItems,
    handleMobileMenuToggle,
    scrollToSection
  } = useNavigation();

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-smart-beige'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center py-4 lg:py-6">
          <Logo />
          
          <DesktopMenu 
            menuItems={menuItems}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
          />

          <MobileMenu
            menuItems={menuItems}
            activeSection={activeSection}
            isMobileMenuOpen={isMobileMenuOpen}
            handleMobileMenuToggle={handleMobileMenuToggle}
            scrollToSection={scrollToSection}
          />
        </div>

        {/* Mobile Menu Container */}
        <div 
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200">
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
      </div>
    </nav>
  );
};

export default Navigation;
