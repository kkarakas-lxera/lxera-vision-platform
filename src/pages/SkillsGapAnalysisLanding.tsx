import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import HeroSection from '@/components/landing/HeroSection';
import MysteryPreview from '@/components/landing/MysteryPreview';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FinalCTA from '@/components/landing/FinalCTA';


const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [selectedIndustry, setSelectedIndustry] = useState('Technology');


  // Simulate spots decreasing
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsRemaining((prev) => {
        if (prev > 35) {
          return prev - 1;
        }
        return prev;
      });
    }, 45000); // Decrease every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Navigate to skills gap signup (dedicated funnel, not early access)
    navigate(`/skills-gap-signup?email=${encodeURIComponent(email)}&source=skills-gap-landing`);
    
    setIsLoading(false);
  };


  const spotsProgress = ((100 - spotsRemaining) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-future-green/5 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-future-green/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-business-black/70 hover:text-business-black"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/early-access-signup')}
                className="hidden sm:inline-flex"
              >
                Start Free Analysis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection 
        email={email}
        setEmail={setEmail}
        onSubmit={handleEmailSubmit}
        isLoading={isLoading}
        spotsRemaining={spotsRemaining}
        spotsProgress={spotsProgress}
      />

      {/* Mystery Preview Section */}
      <MysteryPreview 
        spotsRemaining={spotsRemaining}
        selectedIndustry={selectedIndustry}
        onIndustrySelect={setSelectedIndustry}
      />

      {/* Testimonials Section */}
      <TestimonialsSection 
        onCTAClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Final CTA Section */}
      <FinalCTA 
        email={email}
        setEmail={setEmail}
        onSubmit={handleEmailSubmit}
        isLoading={isLoading}
        spotsRemaining={spotsRemaining}
        spotsProgress={spotsProgress}
      />

      {/* Footer */}
      <footer className="bg-business-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Logo className="text-white" />
              <p className="text-slate-400 text-sm mt-2">
                © 2025 LXERA. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/privacy')}
                className="text-slate-400 hover:text-white"
              >
                Privacy Policy
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/terms')}
                className="text-slate-400 hover:text-white"
              >
                Terms of Service
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/contact')}
                className="text-slate-400 hover:text-white"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SkillsGapAnalysisLanding;