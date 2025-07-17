import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Mail, 
  Target, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Timer,
  LinkedinIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import HeroSection from '@/components/landing/HeroSection';
import IndustrySelector from '@/components/landing/IndustrySelector';
import MysteryPreview from '@/components/landing/MysteryPreview';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FinalCTA from '@/components/landing/FinalCTA';

interface LiveActivityItem {
  id: string;
  company: string;
  location: string;
  action: string;
  timestamp: Date;
}

interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  savings?: string;
  photo?: string;
}

const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [selectedIndustry, setSelectedIndustry] = useState('Technology');

  // Mock data for testimonials
  const testimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'VP Engineering',
      company: 'TechCorp',
      content: 'We had no idea 73% of our developers were missing React Server Components skills. LXERA\'s AI found gaps that saved us $180K in productivity losses.',
      savings: '$180K'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      title: 'Chief People Officer',
      company: 'ScaleUp Inc',
      content: 'The AI revealed skill gaps in 5 minutes that would have taken our HR team 3 months to identify manually.',
      savings: '$347K'
    },
    {
      id: '3',
      name: 'Lisa Wang',
      title: 'Director of Learning & Development',
      company: 'GrowthCo',
      content: 'Found 12 critical gaps across 200 employees in minutes. This would have been impossible manually.',
      savings: '$89K'
    }
  ];

  // Mock live activity data
  const mockActivities: LiveActivityItem[] = [
    {
      id: '1',
      company: 'Tech company in Austin',
      location: 'Austin, TX',
      action: 'found 15 critical skill gaps',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '2',
      company: 'Manufacturing firm',
      location: 'Detroit, MI',
      action: 'saved $89K in training costs',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: '3',
      company: 'SaaS startup',
      location: 'San Francisco, CA',
      action: 'identified critical React gaps',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '4',
      company: 'Healthcare organization',
      location: 'Boston, MA',
      action: 'found 23 skill mismatches',
      timestamp: new Date(Date.now() - 22 * 60 * 1000)
    },
    {
      id: '5',
      company: 'Financial services',
      location: 'New York, NY',
      action: 'cut training time by 60%',
      timestamp: new Date(Date.now() - 35 * 60 * 1000)
    }
  ];

  // Simulate live activity updates
  useEffect(() => {
    setLiveActivities(mockActivities);
    
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % mockActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    
    // Navigate to early access signup with email prefilled
    navigate(`/early-access-signup?email=${encodeURIComponent(email)}&source=skills-gap-landing`);
    
    setIsLoading(false);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const spotsProgress = ((100 - spotsRemaining) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-future-green/20 sticky top-0 z-50">
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
                Request Demo
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
      />

      {/* Industry Selector */}
      <IndustrySelector 
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