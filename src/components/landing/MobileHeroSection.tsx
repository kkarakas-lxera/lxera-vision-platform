import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoModal from '@/components/VideoModal';
import SmartEmailCapture from '@/components/forms/SmartEmailCapture';
import ProgressiveDemoCapture from '@/components/forms/ProgressiveDemoCapture';

interface MobileHeroSectionProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const MobileHeroSection = ({ openDemoModal, openEarlyAccessModal }: MobileHeroSectionProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const navigate = useNavigate();

  // Add scroll animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-mobile {
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

  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleEmailSuccess = (email: string) => {
    setEmailCaptured(true);
  };

  const handleExploreClick = () => {
    const element = document.getElementById('why-lxera');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestDemo = () => {
    navigate('/company/contact');
  };

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

  return (
    <section className="hero w-full pt-20 pb-8 px-4 bg-gradient-to-br from-smart-beige/60 via-future-green/8 to-smart-beige/80 relative overflow-hidden font-inter md:hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 via-transparent to-smart-beige/30"></div>
      
      <div className="relative z-10">
        {/* Headline */}
        <div className="animate-fade-in-up mb-4" style={{ animationDelay: '0ms' }}>
          <h1 className="text-2xl font-medium text-business-black leading-tight tracking-tight">
            <span className="block">LXERA: The First</span>
            <span className="block text-[#B1B973]">Learning & Innovation</span>
            <span className="block">
              <span className="text-[#B1B973]">Experience </span>
              <span className="text-business-black">Platform</span>
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div className="animate-fade-in-up mb-4" style={{ animationDelay: '200ms' }}>
          <p className="text-base text-business-black/85 font-normal leading-relaxed">
            Empower your teams to{" "}
            <b className="text-business-black font-medium">learn faster,</b>{" "}
            <b className="text-business-black font-medium">innovate deeper,</b>{" "}
            and <b className="text-business-black font-medium">lead transformation</b>.
          </p>
        </div>

        {/* Video Preview with Actual Thumbnail */}
        <div 
          className="relative rounded-xl overflow-hidden mb-4 aspect-video cursor-pointer shadow-xl animate-fade-in-up group"
          style={{ animationDelay: '400ms' }}
          onClick={handleVideoClick}
        >
          {/* Actual Video Thumbnail */}
          <video
            className="w-full h-full object-cover"
            poster=""
            src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera-Demo.mp4"
            muted
            playsInline
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300">
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-2 mx-auto shadow-xl transform transition-all group-hover:scale-110">
                <Play className="w-7 h-7 text-business-black ml-0.5" fill="currentColor" />
              </div>
              <p className="text-white text-sm font-medium drop-shadow-lg">See LXERA in Action</p>
            </div>
          </div>
        </div>



        {/* CTA - Email capture or success state */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          {!emailCaptured ? (
            <div className="space-y-3">
              <SmartEmailCapture 
                source="mobile_hero"
                buttonText="Get Early Access"
                variant="mobile"
                openEarlyAccessModal={openEarlyAccessModal}
              />
              <div className="flex items-center justify-center">
                <ProgressiveDemoCapture 
                  source="mobile_hero"
                  buttonText="Book Demo"
                  variant="minimal"
                  openDemoModal={openDemoModal}
                />
              </div>
              <p className="text-xs text-center text-business-black/60">
                No credit card required
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium">✓ Check your email!</p>
              <p className="text-green-600 text-sm mt-1">We sent you a magic link</p>
            </div>
          )}
        </div>

        {/* Early Access Banner with Social Proof */}
        <div className="bg-future-green/20 border border-future-green/30 text-business-black px-4 py-2.5 rounded-lg text-center mb-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <span className="font-semibold flex items-center justify-center gap-2 text-sm">
            🚀 Join 200+ innovative teams in early access
          </span>
        </div>

        {/* Key Benefits */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
          <h3 className="font-medium text-business-black mb-3 text-sm">Why Choose LXERA?</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-future-green text-lg mt-0.5">✓</span>
              <span className="text-sm leading-tight">
                <strong>AI Agents + Human Experts</strong><br/>
                <span className="text-xs text-gray-600">Perfect blend of automation and expertise</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-future-green text-lg mt-0.5">✓</span>
              <span className="text-sm leading-tight">
                <strong>Customized Skills Taxonomy</strong><br/>
                <span className="text-xs text-gray-600">Tailored to your organization's needs</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-future-green text-lg mt-0.5">✓</span>
              <span className="text-sm leading-tight">
                <strong>Proven ROI Tracking</strong><br/>
                <span className="text-xs text-gray-600">Measure impact with real-time analytics</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-future-green text-lg mt-0.5">✓</span>
              <span className="text-sm leading-tight">
                <strong>Gamified Learning</strong><br/>
                <span className="text-xs text-gray-600">85% higher engagement rates</span>
              </span>
            </div>
          </div>
        </div>

        {/* Demo Option - Moved after benefits */}
        <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
          <p className="text-sm text-business-black/70 mb-3">Need a personalized walkthrough?</p>
          <Button
            variant="outline"
            onClick={handleRequestDemo}
            className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white transition-all duration-300 px-6 py-2 text-sm font-medium"
          >
            Book a Demo
          </Button>
        </div>

        {/* Integration Section */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
          <p className="text-xs text-business-black/80 mb-2.5 text-center font-medium">
            250+ HRIS and project management tools with one-click integration
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-4 relative" style={{ animation: 'scroll-mobile 20s linear infinite', display: 'flex', width: 'max-content' }}>
              {/* Double the platforms for seamless loop */}
              {[...integrationPlatforms, ...integrationPlatforms].map((platform, index) => (
                <div 
                  key={`${platform.name}-${index}`}
                  className="flex-shrink-0 bg-white rounded-lg px-4 py-2 shadow-md flex items-center h-10"
                >
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    className="h-6 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore More */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
          <button
            onClick={handleExploreClick}
            className="text-business-black/60 text-sm flex items-center justify-center gap-2 mx-auto hover:text-business-black transition-colors"
          >
            Discover more
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>


      {/* Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        setIsOpen={setIsVideoModalOpen}
        videoUrl="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera-Demo.mp4"
        videoCaption="LXERA Platform Demo"
      />
    </section>
  );
};

export default MobileHeroSection;