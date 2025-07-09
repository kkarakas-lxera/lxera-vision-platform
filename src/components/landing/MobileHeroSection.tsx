import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DemoModalWrapper from '@/components/DemoModalWrapper';
import VideoModal from '@/components/VideoModal';

const MobileHeroSection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleReserveSpot = () => {
    setIsDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white md:hidden">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold text-xl">LXERA</div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm font-medium"
            onClick={() => setIsDemoModalOpen(true)}
          >
            Book Demo
          </Button>
        </div>
      </header>

      {/* Hero Content */}
      <div className="pt-14 px-4 pb-6">
        {/* Headline */}
        <h1 className="text-2xl font-bold leading-tight mt-6 mb-4">
          Transform Your Team's<br />Learning with AI
        </h1>

        {/* Video Preview */}
        <div 
          className="relative bg-gradient-to-br from-smart-beige to-gray-100 rounded-lg overflow-hidden mb-4 aspect-video cursor-pointer shadow-lg"
          onClick={handleVideoClick}
        >
          {/* Platform preview background */}
          <div className="absolute inset-0">
            {/* Simulated dashboard preview */}
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
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 mx-auto shadow-xl transform transition-transform hover:scale-105">
                <Play className="w-8 h-8 text-business-black ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
          
          {/* Duration badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Watch: 15 sec
          </div>
        </div>

        {/* Video Caption */}
        <p className="text-gray-600 text-base mb-5">
          From skills gaps to AI courses in minutes
        </p>

        {/* Primary CTA */}
        <Button 
          className="w-full h-14 text-lg font-semibold bg-business-black hover:bg-gray-800"
          onClick={handleReserveSpot}
        >
          Reserve Your Spot
        </Button>
      </div>

      {/* Urgency Banner */}
      <div className="bg-lxera-red text-white px-4 py-3 text-center">
        <span className="font-semibold flex items-center justify-center gap-2">
          🔥 50% off for 48h
        </span>
      </div>

      {/* Benefits Section */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-future-green text-xl mt-0.5">✓</span>
            <span className="text-lg leading-tight">
              AI Agents + Human<br />Experts
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-future-green text-xl mt-0.5">✓</span>
            <span className="text-lg leading-tight">Proven ROI Tracking</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-future-green text-xl mt-0.5">✓</span>
            <span className="text-lg leading-tight">Gamified Learning</span>
          </div>
        </div>

        {/* Secondary CTA */}
        <Button 
          variant="outline" 
          className="w-full h-11 font-medium"
          onClick={() => navigate('/pricing')}
        >
          See Pricing →
        </Button>
      </div>

      {/* Integration Logos */}
      <div className="px-4 py-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">One-click integration:</p>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 flex-nowrap">
            {['SAP', 'ADP', 'Workday', 'Slack', 'Teams'].map((logo) => (
              <div 
                key={logo}
                className="flex-shrink-0 h-8 px-3 bg-gray-100 rounded flex items-center justify-center text-sm font-medium text-gray-600"
              >
                {logo}
              </div>
            ))}
            <div className="flex-shrink-0 text-gray-400 flex items-center">
              →
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar for integration logos */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Demo Modal */}
      <DemoModalWrapper 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        source="Mobile Hero"
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera%20Demo%20v2.1-m5UjU6fNWgyk0NuT47B2TPgn5UMRz7.mp4"
        title="LXERA Platform Demo"
      />
    </div>
  );
};

export default MobileHeroSection;