import React, { Suspense, lazy, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Headphones, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressiveDemoCapture from '../../forms/ProgressiveDemoCapture';
import { Button } from '@/components/ui/button';

const PricingEarlyAccess = lazy(() => import('../../forms/PricingEarlyAccess'));

interface MobileContactProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
  openContactSalesModal?: (source: string) => void;
}

const MobileContact: React.FC<MobileContactProps> = ({ openDemoModal, openEarlyAccessModal, openContactSalesModal }) => {
  const [showSecondaryOptions, setShowSecondaryOptions] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // Progressive disclosure on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowSecondaryOptions(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-smart-beige/95 backdrop-blur-sm border-b border-business-black/10">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-business-black" />
            <span className="text-lg font-medium text-business-black">LXERA</span>
          </Link>
          <Link
            to="/book-demo"
            className="px-4 py-2 bg-future-green text-business-black rounded-full text-sm font-medium"
          >
            Book Demo
          </Link>
        </div>
      </header>

      {/* Hero Section with Progress */}
      <section className="px-6 py-8">
        {/* Progress Indicator - Goal Gradient Effect */}
        <div className="flex items-center gap-2 text-xs text-business-black/60 mb-4">
          <span className="font-medium">Step 1 of 3:</span>
          <span>Choose how to connect</span>
        </div>
        
        <h1 className="text-3xl font-medium text-business-black mb-3">
          Get Started with LXERA
        </h1>
        <p className="text-lg text-business-black/70">
          Transform your organization's learning experience
        </p>
      </section>

      {/* Main Actions - Mobile Optimized */}
      <section className="px-6 pb-24">
        {/* Primary Action - Always Visible with Larger Touch Target */}
        <div 
          className="bg-white rounded-3xl shadow-xl p-6 mb-6 transition-all duration-300 active:scale-[0.98]"
          onClick={() => openDemoModal && openDemoModal('mobile_contact_primary')}
        >
          <div className="text-center">
            <div className="bg-future-green/20 text-future-green px-3 py-1 rounded-full text-xs font-medium inline-block mb-4">
              Recommended
            </div>
            <Calendar className="w-10 h-10 mx-auto mb-3 text-future-green" />
            <h2 className="text-2xl font-medium text-business-black mb-3">
              See LXERA in Action
            </h2>
            <p className="text-base text-business-black/70 mb-4">
              Book a personalized demo to discover how LXERA can revolutionize your workforce development
            </p>
            
            {/* Visual journey indicator */}
            <div className="flex items-center justify-center gap-1 text-xs text-business-black/50 mb-6">
              <span>15-min call</span>
              <ChevronRight className="w-3 h-3" />
              <span>Custom demo</span>
              <ChevronRight className="w-3 h-3" />
              <span>Tailored plan</span>
            </div>
            
            {/* Larger touch target - 56px minimum */}
            <ProgressiveDemoCapture
              source="mobile_contact_demo"
              buttonText="Book Demo"
              variant="mobile"
              openDemoModal={openDemoModal}
              className="min-h-[56px] text-lg font-medium"
            />
          </div>
        </div>

        {/* Secondary Options - Progressive Disclosure */}
        <div className={`space-y-4 transition-all duration-500 ${showSecondaryOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Early Access Card */}
          <div 
            className="bg-white/90 rounded-2xl shadow-lg p-5 transition-all duration-300 active:scale-[0.98]"
            onClick={() => openEarlyAccessModal && openEarlyAccessModal('mobile_contact_early_access')}
          >
            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-emerald flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-business-black mb-1">
                  Request Early Access
                </h3>
                <p className="text-sm text-business-black/70 mb-3">
                  Be among the first to experience the future
                </p>
                <Suspense fallback={
                  <div className="w-full py-3 bg-future-green/20 rounded-full animate-pulse" />
                }>
                  <PricingEarlyAccess 
                    className="w-full min-h-[48px]"
                    openEarlyAccessModal={openEarlyAccessModal}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Contact Sales Card */}
          <div 
            className="bg-white/90 rounded-2xl shadow-lg p-5 transition-all duration-300 active:scale-[0.98]"
            onClick={() => openContactSalesModal && openContactSalesModal('mobile_contact_sales')}
          >
            <div className="flex items-start gap-4">
              <Headphones className="w-8 h-8 text-business-black flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-business-black mb-1">
                  Contact Sales
                </h3>
                <p className="text-sm text-business-black/70 mb-3">
                  Get custom pricing for enterprise teams
                </p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openContactSalesModal && openContactSalesModal('mobile_contact_sales');
                  }}
                  className="w-full bg-business-black text-white hover:bg-business-black/90 rounded-full min-h-[48px]"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA for Mobile - Fitts's Law */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-40">
        <Button 
          onClick={() => openContactSalesModal && openContactSalesModal('mobile_sticky_sales')}
          className="w-full bg-business-black text-white hover:bg-business-black/90 rounded-full min-h-[56px] text-base font-medium"
        >
          <Headphones className="w-5 h-5 mr-2" />
          Need Help? Contact Sales
        </Button>
      </div>

      {/* Contact Info */}
      <section className="px-6 py-12">
        <div className="bg-white/50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-medium text-business-black mb-4">
            Have Questions?
          </h3>
          <p className="text-base text-business-black/70 mb-2">
            We're here to help
          </p>
          <a
            href="mailto:sales@lxera.ai"
            className="text-base text-business-black hover:text-future-green transition-colors"
          >
            sales@lxera.ai
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-business-black/10">
        <div className="text-center text-sm text-business-black/60">
          © 2025 LXERA. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MobileContact;