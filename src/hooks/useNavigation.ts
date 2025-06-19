
import { useState, useEffect } from "react";
import { useScrollOffset } from "./useScrollOffset";

export const useNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { scrollToSection: scrollToSectionWithOffset } = useScrollOffset();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleSectionChange = () => {
      const sections = ['platform', 'solutions', 'features', 'contact'];
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

    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleSectionChange);
    window.addEventListener('resize', handleResize);
    
    // Set initial scroll state
    handleScroll();
    handleSectionChange();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleSectionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      name: 'Platform',
      href: '#platform',
      id: 'platform'
    },
    {
      name: 'Solutions',
      href: '#solutions',
      id: 'solutions',
      hasDropdown: true,
      dropdownItems: [
        {
          category: 'By Use Case',
          items: [
            { name: 'Personalized Learning', href: '/solutions/personalized-learning' },
            { name: 'Upskilling Frontline Workers', href: '/solutions/upskilling-frontline' },
            { name: 'Citizen Innovation Enablement', href: '/solutions/citizen-innovation' }
          ]
        },
        {
          category: 'By Industry',
          items: [
            { name: 'Banking & Finance', href: '/solutions/banking-finance' },
            { name: 'Technology', href: '/solutions/technology' },
            { name: 'Education', href: '/solutions/education' }
          ]
        }
      ]
    },
    {
      name: 'Features',
      href: '#features',
      id: 'features'
    },
    {
      name: 'Pricing',
      href: '/pricing',
      id: 'pricing'
    }
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('/')) {
      // Navigate to page
      window.location.href = href;
    } else {
      // Scroll to section
      scrollToSectionWithOffset(href);
    }
    setIsMobileMenuOpen(false);
  };

  return {
    isScrolled,
    isMobileMenuOpen,
    activeSection,
    menuItems,
    handleMobileMenuToggle,
    scrollToSection
  };
};
