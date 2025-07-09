import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DemoModalWrapper from '@/components/DemoModalWrapper';
import VideoModal from '@/components/VideoModal';
import WaitlistModal from '@/components/WaitlistModal';

const MobileHeroSection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleRequestDemo = () => {
    setIsDemoModalOpen(true);
  };

  const handleGetEarlyAccess = () => {
    setIsWaitlistModalOpen(true);
  };

  const handleExploreClick = () => {
    const element = document.getElementById('why-lxera');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Integration platforms with proper logos
  const integrationPlatforms = [
    { name: 'Workday', logo: '🏢' },
    { name: 'SAP', logo: '💼' },
    { name: 'BambooHR', logo: '🎋' },
    { name: 'ADP', logo: '📊' },
    { name: 'Microsoft Teams', logo: '👥' },
    { name: 'Slack', logo: '💬' },
    { name: 'Oracle HCM', logo: '🔴' },
    { name: 'Cornerstone', logo: '📐' },
  ];

  return (
    <section className="hero w-full pt-20 pb-12 px-4 bg-gradient-to-br from-smart-beige/60 via-future-green/8 to-smart-beige/80 relative overflow-hidden font-inter md:hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 via-transparent to-smart-beige/30"></div>
      
      <div className="relative z-10">
        {/* Headline */}
        <div className="animate-fade-in-up mb-4">
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
        <div className="animate-fade-in-up animate-delay-200 mb-6">
          <p className="text-base text-business-black/85 font-normal leading-relaxed">
            Empower your teams to{" "}
            <b className="text-business-black font-medium">learn faster,</b>{" "}
            <b className="text-business-black font-medium">innovate deeper,</b>{" "}
            and <b className="text-business-black font-medium">lead transformation</b>.
          </p>
        </div>

        {/* Video Preview */}
        <div 
          className="relative bg-gradient-to-br from-smart-beige to-gray-100 rounded-xl overflow-hidden mb-6 aspect-video cursor-pointer shadow-xl animate-fade-in-up animate-delay-400"
          onClick={handleVideoClick}
        >
          {/* Platform preview background */}
          <div className="absolute inset-0">
            <div className="p-4 h-full flex flex-col">
              <div className="flex gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="bg-white/40 rounded"></div>
                <div className="bg-white/40 rounded col-span-2"></div>
                <div className="bg-white/40 rounded col-span-2"></div>
                <div className="bg-white/40 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3 mx-auto shadow-2xl transform transition-all hover:scale-105">
                <Play className="w-10 h-10 text-business-black ml-1" fill="currentColor" />
              </div>
              <p className="text-white text-sm font-medium">See LXERA in Action</p>
            </div>
          </div>
        </div>

        {/* Early Access Badge */}
        <div className="text-center mb-6 animate-fade-in-up animate-delay-600">
          <p className="text-sm text-business-black/75 font-normal">
            🚀 <strong className="text-business-black font-medium">Early access open</strong> for innovative teams
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-8 animate-fade-in-up animate-delay-800">
          <Button
            size="lg"
            className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-4 text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-102 active:scale-98 w-full"
            onClick={handleRequestDemo}
          >
            Request a Demo
          </Button>
          <Button
            size="lg"
            className="bg-business-black text-white hover:bg-business-black/90 font-medium px-8 py-4 text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-102 active:scale-98 w-full"
            onClick={handleGetEarlyAccess}
          >
            Get Early Access
          </Button>
        </div>

        {/* Urgency Banner */}
        <div className="bg-lxera-red/10 border border-lxera-red/20 text-lxera-red px-4 py-3 rounded-lg text-center mb-8 animate-fade-in-up animate-delay-1000">
          <span className="font-semibold flex items-center justify-center gap-2 text-sm">
            🔥 Limited Time: 50% off for early adopters
          </span>
        </div>

        {/* Key Benefits */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8 animate-fade-in-up animate-delay-1200">
          <h3 className="font-medium text-business-black mb-4">Why Choose LXERA?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-future-green text-xl mt-0.5">✓</span>
              <span className="text-base leading-tight">
                <strong>AI Agents + Human Experts</strong><br/>
                <span className="text-sm text-gray-600">Perfect blend of automation and expertise</span>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-future-green text-xl mt-0.5">✓</span>
              <span className="text-base leading-tight">
                <strong>Proven ROI Tracking</strong><br/>
                <span className="text-sm text-gray-600">Measure impact with real-time analytics</span>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-future-green text-xl mt-0.5">✓</span>
              <span className="text-base leading-tight">
                <strong>Gamified Learning</strong><br/>
                <span className="text-sm text-gray-600">85% higher engagement rates</span>
              </span>
            </div>
          </div>
        </div>

        {/* Integration Section */}
        <div className="mb-8 animate-fade-in-up animate-delay-1400">
          <p className="text-sm text-gray-600 mb-3 text-center">One-click integration with your tools:</p>
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-mobile">
              {/* Double the platforms for seamless loop */}
              {[...integrationPlatforms, ...integrationPlatforms].map((platform, index) => (
                <div 
                  key={`${platform.name}-${index}`}
                  className="flex-shrink-0 bg-white rounded-lg px-4 py-2 shadow-md flex items-center gap-2"
                >
                  <span className="text-xl">{platform.logo}</span>
                  <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore More */}
        <div className="text-center animate-fade-in-up animate-delay-1600">
          <button
            onClick={handleExploreClick}
            className="text-business-black/60 text-sm flex items-center justify-center gap-2 mx-auto hover:text-business-black transition-colors"
          >
            Discover more
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>

      {/* CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll-mobile {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-mobile {
          animation: scroll-mobile 20s linear infinite;
          display: flex;
          width: max-content;
        }

        .animate-delay-200 {
          animation-delay: 200ms;
        }
        .animate-delay-400 {
          animation-delay: 400ms;
        }
        .animate-delay-600 {
          animation-delay: 600ms;
        }
        .animate-delay-800 {
          animation-delay: 800ms;
        }
        .animate-delay-1000 {
          animation-delay: 1000ms;
        }
        .animate-delay-1200 {
          animation-delay: 1200ms;
        }
        .animate-delay-1400 {
          animation-delay: 1400ms;
        }
        .animate-delay-1600 {
          animation-delay: 1600ms;
        }
      `}</style>

      {/* Modals */}
      <DemoModalWrapper 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        source="Mobile Hero"
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera%20Demo%20v2.1-m5UjU6fNWgyk0NuT47B2TPgn5UMRz7.mp4"
        title="LXERA Platform Demo"
      />

      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        source="Mobile Hero"
      />
    </section>
  );
};

export default MobileHeroSection;