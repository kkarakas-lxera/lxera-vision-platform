
import { useNavigation } from "@/hooks/useNavigation";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import BackToTop from "./BackToTop";
import SEO from "./SEO";
import ScrollProgress from "./ScrollProgress";

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
    <>
      <SEO />
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 lg:backdrop-blur-md shadow-md lg:shadow-lg border-b border-gray-100/50 max-lg:bg-white' 
            : 'bg-smart-beige/95 lg:backdrop-blur-sm max-lg:bg-smart-beige'
        } mobile-optimize`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <DesktopMenu 
                menuItems={menuItems}
                activeSection={activeSection}
                scrollToSection={scrollToSection}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <MobileMenu
                menuItems={menuItems}
                activeSection={activeSection}
                isMobileMenuOpen={isMobileMenuOpen}
                handleMobileMenuToggle={handleMobileMenuToggle}
                scrollToSection={scrollToSection}
              />
            </div>
          </div>
        </div>
        
        {/* Scroll Progress Indicator */}
        <ScrollProgress />
      </nav>
      <BackToTop />
    </>
  );
};

export default Navigation;
