
import { useNavigation } from "@/hooks/useNavigation";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import BackToTop from "./BackToTop";
import SEO from "./SEO";
import ScrollProgress from "./ScrollProgress";
import HeaderSearch from "./HeaderSearch";
import QuickActions from "./QuickActions";

const Navigation = () => {
  const {
    isScrolled,
    isMobileMenuOpen,
    activeSection,
    menuItems,
    handleMobileMenuToggle,
    scrollToSection
  } = useNavigation();

  // Enhanced keyboard navigation
  useKeyboardNavigation({
    onEscape: () => {
      if (isMobileMenuOpen) {
        handleMobileMenuToggle();
      }
    },
    isEnabled: true
  });

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Here you would implement actual search functionality
    // For now, we'll just scroll to the contact section as an example
    scrollToSection('#contact');
  };

  return (
    <>
      <SEO />
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50' 
            : 'bg-smart-beige/95 backdrop-blur-sm'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <Logo />
            
            {/* Desktop Navigation with Enhanced Features */}
            <div className="hidden lg:flex items-center space-x-6">
              <DesktopMenu 
                menuItems={menuItems}
                activeSection={activeSection}
                scrollToSection={scrollToSection}
              />
              
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Search */}
              <HeaderSearch onSearch={handleSearch} />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-3">
              <HeaderSearch onSearch={handleSearch} />
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
