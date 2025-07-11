

import { ArrowDown } from "lucide-react";
import HeroVideoPreview from "./HeroVideoPreview";
import { Button } from "@/components/ui/button";
import SmartEmailCapture from "./forms/SmartEmailCapture";
import ProgressiveDemoCapture from "./forms/ProgressiveDemoCapture";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const HeroSection = ({ openDemoModal, openEarlyAccessModal }: HeroSectionProps) => {
  const [showEmailCapture, setShowEmailCapture] = useState(true);
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Add scroll animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-desktop {
        0% {
          left: 0;
        }
        100% {
          left: -50%;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Integration platforms with real logos
  const integrationPlatforms = [
    { name: 'Workday', logo: '/logos/workday-logo.png' },
    { name: 'SAP', logo: '/logos/sap-logo.svg' },
    { name: 'BambooHR', logo: '/logos/bamboohr-logo.png' },
    { name: 'ADP', logo: '/logos/adp-logo.svg' },
    { name: 'Teams', logo: '/logos/microsoft-teams.png' },
    { name: 'Slack', logo: '/logos/slack.svg' },
    { name: 'Oracle', logo: '/logos/oracle-logo.png' },
    { name: 'Asana', logo: '/logos/asana-logo.png' },
  ];

  const handleEmailSuccess = (email: string) => {
    setEmailCaptured(true);
    setShowEmailCapture(false);
  };

  const handleExploreClick = () => {
    // Scroll to how it works section
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="hero hero-section w-full pt-28 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 px-3 sm:px-6 lg:px-12 bg-gradient-to-br from-smart-beige/60 via-future-green/8 to-smart-beige/80 lg:bg-gradient-to-br max-lg:bg-smart-beige relative overflow-hidden font-inter transition-all duration-1000 ease-in-out mobile-optimize">
        {/* Simple background gradient without animated elements - hidden on mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 via-transparent to-smart-beige/30 lg:block hidden"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main content - side by side layout with much bigger video */}
          <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-6 mb-6 sm:mb-8 md:mb-12">
            {/* Left side - Headline and CTA content - keeping lg:w-2/5 */}
            <div className="w-full lg:w-2/5 space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-2 lg:px-0">
              {/* Headline - increased text sizes by one level across all breakpoints */}
              <div className="animate-fade-in-up">
                <h1 className="headline text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-medium text-business-black leading-tight tracking-tight font-inter">
                  <span className="block">
                    LXERA: The First
                  </span>
                  <span className="block" style={{ color: '#B1B973' }}>
                    Learning &amp; Innovation
                  </span>
                  <span className="block">
                    <span style={{ color: '#B1B973' }}>Experience </span>
                    <span className="text-business-black">Platform</span>
                  </span>
                </h1>
              </div>

              {/* Subheadline - increased text sizes */}
              <div className="animate-fade-in-up animate-delay-200">
                <p className="subheadline text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-business-black/85 font-normal leading-relaxed font-inter">
                  Empower your teams to{" "}
                  <b className="text-business-black font-medium">learn faster,</b>{" "}
                  <b className="text-business-black font-medium">innovate deeper,</b>{" "}
                  and <b className="text-business-black font-medium">lead transformation</b>—
                  within one intelligent ecosystem.
                </p>
              </div>

              {/* Divider - smaller on mobile */}
              <div className="animate-fade-in-scale animate-delay-400">
                <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-0.5 sm:h-1 animate-pulse-slow shadow-lg bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
              </div>

              {/* Quote snippet - responsive text size */}
              <div className="text-left">
                <span className="block text-business-black/70 text-xs sm:text-sm md:text-base font-normal italic leading-tight font-inter">
                  "Designed for the new world of work, where speed, innovation, and learning are inseparable."
                </span>
              </div>
              
              <div className="text-left animate-fade-in-up animate-delay-600 space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm md:text-base text-business-black/75 font-normal font-inter">
                  🚀 <strong className="text-business-black font-medium">Early access open</strong> for innovative teams
                </p>
                
                {showEmailCapture && !emailCaptured ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <SmartEmailCapture 
                        source="hero_section"
                        buttonText="Get Early Access"
                        openEarlyAccessModal={openEarlyAccessModal}
                      />
                      <span className="text-sm text-gray-500">or</span>
                      <ProgressiveDemoCapture 
                        source="hero_section"
                        buttonText="Book Demo"
                        variant="minimal"
                        openDemoModal={openDemoModal}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      No credit card required • Join 200+ teams
                    </p>
                  </div>
                ) : emailCaptured ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">✓ Check your email to continue!</p>
                    <p className="text-green-600 text-sm mt-1">We sent you a magic link</p>
                  </div>
                ) : (
                  <div className="flex flex-row gap-2 sm:gap-3 hero-cta-buttons">
                    <ProgressiveDemoCapture 
                      source="hero_section_cta"
                      buttonText="Book Demo"
                      variant="default"
                      openDemoModal={openDemoModal}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Video (responsive sizing) */}
            <div className="w-full lg:w-3/5 lg:pl-8 mt-4 sm:mt-6 lg:mt-6 px-1 sm:px-2 lg:px-0">
              <div className="transform lg:scale-110 lg:translate-x-4 lg:translate-y-2">
                <HeroVideoPreview openDemoModal={openDemoModal} />
              </div>
            </div>
          </div>
          
          {/* Integration Section - Desktop Only */}
          <div className="hidden lg:block mt-12 mb-8 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
            <p className="text-sm text-business-black/80 mb-4 text-center font-medium">
              250+ HRIS and project management tools with one-click integration
            </p>
            <div className="relative overflow-hidden max-w-5xl mx-auto logo-carousel-container">
              <div className="flex gap-6 relative" style={{ animation: 'scroll-desktop 25s linear infinite', display: 'flex', width: 'max-content' }}>
                {/* Double the platforms for seamless loop */}
                {[...integrationPlatforms, ...integrationPlatforms].map((platform, index) => (
                  <div 
                    key={`${platform.name}-${index}`}
                    className="flex-shrink-0 bg-white rounded-lg px-6 py-3 shadow-md flex items-center h-12 hover:shadow-lg transition-shadow"
                  >
                    <img 
                      src={platform.logo} 
                      alt={platform.name}
                      className="h-8 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Discover more indicator - centered and non-clickable */}
          <div className="mt-3 sm:mt-4 md:mt-6 animate-fade-in-up animate-delay-1200 text-center">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 pointer-events-none">
              <p className="text-xs sm:text-sm text-business-black/60 font-normal font-inter">
                Discover more
              </p>
              <div className="relative">
                <ArrowDown className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 animate-bounce drop-shadow-lg text-future-green" />
                <div className="absolute inset-0 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full blur-sm animate-ping bg-future-green/25"></div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Enhanced Section Separator - consistent height */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/80 via-smart-beige/60 to-future-green/8 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-transparent"></div>
      </div>
    </>
  );
};

export default HeroSection;

