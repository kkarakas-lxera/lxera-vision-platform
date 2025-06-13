
import { useNavigation } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";
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
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
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
      </div>
    </nav>
  );
};

export default Navigation;
