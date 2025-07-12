import React, { Suspense, lazy } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressiveDemoCapture from '../../forms/ProgressiveDemoCapture';

const PricingEarlyAccess = lazy(() => import('../../forms/PricingEarlyAccess'));

interface MobileContactProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const MobileContact: React.FC<MobileContactProps> = ({ openDemoModal, openEarlyAccessModal }) => {

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

      {/* Hero Section */}
      <section className="px-6 py-8">
        <h1 className="text-3xl font-medium text-business-black mb-3">
          Get Started with LXERA
        </h1>
        <p className="text-lg text-business-black/70">
          Transform your organization's learning experience
        </p>
      </section>

      {/* Main Actions */}
      <section className="px-6 space-y-6">
        {/* Book Demo Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-business-black mb-3">
              See LXERA in Action
            </h2>
            <p className="text-base text-business-black/70 mb-6">
              Book a personalized demo to discover how LXERA can revolutionize your workforce development
            </p>
            <ProgressiveDemoCapture
              source="mobile_contact_demo"
              buttonText="Book Demo"
              variant="mobile"
              openDemoModal={openDemoModal}
            />
          </div>
        </div>

        {/* Early Access Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-business-black mb-3">
              Request Early Access
            </h2>
            <p className="text-base text-business-black/70 mb-6">
              Be among the first to experience the future of organizational learning
            </p>
            <Suspense fallback={
              <div className="w-full py-4 bg-future-green/20 rounded-full animate-pulse" />
            }>
              <PricingEarlyAccess 
                className="w-full"
                openEarlyAccessModal={openEarlyAccessModal}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="px-6 py-12">
        <div className="bg-white/50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-medium text-business-black mb-4">
            Have Questions?
          </h3>
          <p className="text-base text-business-black/70 mb-2">
            We're here to help. Contact us via:
          </p>
          <div className="space-y-2">
            <a
              href="tel:+14155551234"
              className="block text-base text-business-black hover:text-future-green transition-colors"
            >
              +1 (415) 555-1234
            </a>
            <a
              href="mailto:sales@lxera.ai"
              className="block text-base text-business-black hover:text-future-green transition-colors"
            >
              sales@lxera.ai
            </a>
            <a
              href="https://maps.google.com/?q=2151+Park+Blvd,+Palo+Alto,+CA+94306"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-base text-business-black hover:text-future-green transition-colors"
            >
              2151 Park Blvd, Palo Alto
            </a>
          </div>
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