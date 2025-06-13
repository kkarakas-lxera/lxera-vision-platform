
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Search, ChevronDown } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleSectionChange = () => {
      const sections = ['platform', 'how-it-works', 'features', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleSectionChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleSectionChange);
    };
  }, []);

  const menuItems = [
    {
      name: 'Platform',
      href: '#platform',
      id: 'platform',
      hasDropdown: true,
      submenu: [
        { name: 'Features', href: '#features' },
        { name: 'Integrations', href: '#integrations' },
        { name: 'API', href: '#api' }
      ]
    },
    {
      name: 'How It Works',
      href: '#how-it-works',
      id: 'how-it-works',
      hasDropdown: false
    },
    {
      name: 'Features',
      href: '#features',
      id: 'features',
      hasDropdown: false
    },
    {
      name: 'Contact',
      href: '#contact',
      id: 'contact',
      hasDropdown: false
    }
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

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
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl lg:text-3xl font-bold text-business-black hover:text-future-green transition-colors duration-300 cursor-pointer">
              LXERA
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.hasDropdown ? (
                      <>
                        <NavigationMenuTrigger 
                          className={`bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-business-black hover:text-future-green transition-colors duration-300 font-medium ${
                            activeSection === item.id ? 'text-future-green' : ''
                          }`}
                        >
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-48 p-2">
                            {item.submenu?.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={() => scrollToSection(subItem.href)}
                                className="block w-full text-left px-4 py-2 text-sm text-business-black hover:text-future-green hover:bg-smart-beige rounded-md transition-colors duration-200"
                              >
                                {subItem.name}
                              </button>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <button
                        onClick={() => scrollToSection(item.href)}
                        className={`text-business-black hover:text-future-green transition-colors duration-300 font-medium relative group ${
                          activeSection === item.id ? 'text-future-green' : ''
                        }`}
                      >
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                      </button>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
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
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-between w-full px-4 py-3 text-left text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-colors duration-200">
                        {item.name}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.submenu?.map((subItem) => (
                        <DropdownMenuItem 
                          key={subItem.name}
                          onClick={() => scrollToSection(subItem.href)}
                          className="cursor-pointer"
                        >
                          {subItem.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className={`block w-full text-left px-4 py-3 text-business-black hover:text-future-green hover:bg-future-green/10 rounded-lg transition-colors duration-200 ${
                      activeSection === item.id ? 'text-future-green bg-future-green/10' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </div>
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
