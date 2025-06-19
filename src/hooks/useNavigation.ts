
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
      const sections = ['platform', 'solutions', 'contact'];
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
      id: 'platform',
      hasDropdown: true,
      dropdownItems: [
        {
          category: 'Platform Features',
          items: [
            { name: 'How LXERA Works', href: '/platform/how-it-works' },
            { name: 'AI Engine', href: '/platform/ai-engine' },
            { name: 'Engagement & Insights', href: '/platform/engagement-insights' },
            { name: 'Innovation Hub', href: '/platform/innovation-hub' },
            { name: 'Mentorship & Support Tools', href: '/platform/mentorship-support' },
            { name: 'Security & Data Privacy', href: '/platform/security-privacy' },
            { name: 'Integrations', href: '/platform/integrations' }
          ]
        }
      ]
    },
    {
      name: 'Solutions',
      href: '/solutions',
      id: 'solutions',
      hasDropdown: true,
      dropdownItems: [
        {
          category: 'By Use Case',
          items: [
            { name: 'AI-Personalized Learning', href: '/solutions/ai-personalized-learning' },
            { name: 'Workforce Reskilling & Upskilling', href: '/solutions/workforce-reskilling-upskilling' },
            { name: 'Citizen-Led Innovation', href: '/solutions/citizen-led-innovation' },
            { name: 'Learning Analytics & Engagement Insights', href: '/solutions/learning-analytics-engagement' },
            { name: 'AI Mentorship & 24/7 Support', href: '/solutions/ai-mentorship-support' },
            { name: 'Enterprise Innovation Enablement', href: '/solutions/enterprise-innovation-enablement' }
          ]
        }
      ]
    },
    {
      name: 'Pricing',
      href: '/pricing',
      id: 'pricing'
    },
    {
      name: 'Resources',
      href: '/resources',
      id: 'resources',
      hasDropdown: true,
      dropdownItems: [
        {
          category: 'Learn & Explore',
          items: [
            { name: 'Blog', href: '/resources/blog' },
            { name: 'Success Stories', href: '/resources/success-stories' }
          ]
        }
      ]
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
