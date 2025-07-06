
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollOffset } from "./useScrollOffset";

export const useNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const { scrollToSection: scrollToSectionWithOffset } = useScrollOffset();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
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
            
            // Track recently viewed sections
            setRecentlyViewed(prev => {
              const updated = [section, ...prev.filter(s => s !== section)];
              return updated.slice(0, 5); // Keep only last 5
            });
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

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          handleSectionChange();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Set initial states
    handleScroll();
    handleSectionChange();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
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
      // Navigate to page using React Router
      navigate(href);
    } else {
      // Scroll to section with enhanced animation
      scrollToSectionWithOffset(href);
    }
    setIsMobileMenuOpen(false);
  };

  return {
    isScrolled,
    isMobileMenuOpen,
    activeSection,
    recentlyViewed,
    menuItems,
    handleMobileMenuToggle,
    scrollToSection
  };
};
