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

  // Integration platforms with real company colors
  const integrationPlatforms = [
    { name: 'Workday', bgColor: 'bg-blue-600', textColor: 'text-white' },
    { name: 'SAP', bgColor: 'bg-blue-800', textColor: 'text-white' },
    { name: 'BambooHR', bgColor: 'bg-green-600', textColor: 'text-white' },
    { name: 'ADP', bgColor: 'bg-red-600', textColor: 'text-white' },
    { name: 'Teams', bgColor: 'bg-purple-600', textColor: 'text-white' },
    { name: 'Slack', bgColor: 'bg-purple-800', textColor: 'text-white' },
    { name: 'Oracle', bgColor: 'bg-red-700', textColor: 'text-white' },
    { name: 'Asana', bgColor: 'bg-orange-600', textColor: 'text-white' },
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

        {/* Video Preview with Thumbnail */}
        <div 
          className="relative rounded-xl overflow-hidden mb-4 aspect-video cursor-pointer shadow-xl animate-fade-in-up animate-delay-400 group"
          onClick={handleVideoClick}
        >
          {/* Video Thumbnail */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-smart-beige via-future-green/10 to-business-black/5">
              {/* Platform Dashboard Preview */}
              <div className="p-3 h-full flex flex-col bg-white/90">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" alt="LXERA" className="h-5" />
                    <span className="text-xs text-gray-600">Skills Dashboard</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div className="bg-gradient-to-br from-future-green/20 to-future-green/10 rounded p-2">
                    <div className="text-xs font-medium mb-1">AI Analysis</div>
                    <div className="h-12 bg-white/50 rounded"></div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded col-span-2 p-2">
                    <div className="text-xs font-medium mb-1">Skills Gap Overview</div>
                    <div className="h-12 bg-white/50 rounded"></div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded col-span-2 p-2">
                    <div className="text-xs font-medium mb-1">Learning Paths</div>
                    <div className="h-8 bg-white/50 rounded"></div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded p-2">
                    <div className="text-xs font-medium mb-1">Progress</div>
                    <div className="h-8 bg-white/50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-2 mx-auto shadow-xl transform transition-all group-hover:scale-110">
                <Play className="w-7 h-7 text-business-black ml-0.5" fill="currentColor" />
              </div>
              <p className="text-white text-sm font-medium">See LXERA in Action</p>
            </div>
          </div>
        </div>

        {/* Already interested section - moved below video */}
        <div className="text-center mb-6 animate-fade-in-up animate-delay-500">
          <p className="text-sm text-business-black/70">
            Already interested? 
            <Button
              variant="link"
              onClick={handleRequestDemo}
              className="text-business-black font-semibold underline hover:text-future-green px-1 text-sm"
            >
              Schedule a Demo
            </Button>
          </p>
        </div>


        {/* CTA - Single primary action */}
        <div className="mb-8 animate-fade-in-up animate-delay-700">
          <Button
            size="lg"
            className="bg-business-black text-white hover:bg-business-black/90 font-medium px-8 py-4 text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-102 active:scale-98 w-full"
            onClick={handleGetEarlyAccess}
          >
            Get Early Access
          </Button>
        </div>

        {/* Early Access Banner */}
        <div className="bg-future-green/20 border border-future-green/30 text-business-black px-4 py-3 rounded-lg text-center mb-8 animate-fade-in-up animate-delay-800">
          <span className="font-semibold flex items-center justify-center gap-2 text-sm">
            🚀 <strong className="text-business-black font-medium">Early access open</strong> for innovative teams
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
        <div className="mb-8 animate-fade-in-up animate-delay-1200">
          <p className="text-sm text-business-black/80 mb-3 text-center font-medium">
            250+ HRIS and project management tools with one-click integration
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-3 animate-scroll-mobile">
              {/* Double the platforms for seamless loop */}
              {[...integrationPlatforms, ...integrationPlatforms].map((platform, index) => (
                <div 
                  key={`${platform.name}-${index}`}
                  className={`flex-shrink-0 ${platform.bgColor} rounded-lg px-4 py-2 shadow-md`}
                >
                  <span className={`text-xs font-bold ${platform.textColor}`}>{platform.name}</span>
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
        setIsOpen={setIsVideoModalOpen}
        videoUrl="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera%20Demo%20v2.1-m5UjU6fNWgyk0NuT47B2TPgn5UMRz7.mp4"
        videoCaption="LXERA Platform Demo"
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