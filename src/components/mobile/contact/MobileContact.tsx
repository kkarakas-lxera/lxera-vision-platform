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
        <p className="text-sm text-business-black/60 mt-2">
          Quick question? Email{' '}
          <a href="mailto:sales@lxera.ai" 
             className="text-future-green font-medium underline">
            sales@lxera.ai
          </a>
        </p>
      </section>

      {/* Main Actions */}
      <section className="px-6 space-y-6">
        {/* Book Demo Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
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
        <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
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
        <div className="bg-future-green/10 border-2 border-future-green rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-lg font-medium text-business-black mb-4">
            Have Questions?
          </h3>
          <p className="text-base text-business-black/70 mb-2">
            We're here to help
          </p>
          <a
            href="mailto:sales@lxera.ai"
            className="inline-block py-3 px-4 -mx-4 rounded-lg 
                       text-lg font-medium text-business-black 
                       hover:bg-future-green/10 active:scale-95 
                       transition-all duration-200"
          >
            sales@lxera.ai
            <span className="block text-sm text-business-black/60 mt-1">
              Tap to email • 2hr response
            </span>
          </a>
        </div>
      </section>

      {/* Memorable Closing */}
      <section className="px-6 pb-8">
        <div className="text-center">
          <p className="text-3xl mb-3">🚀</p>
          <p className="text-lg font-medium text-business-black">
            Can't wait to show you what LXERA can do
          </p>
          <p className="text-sm text-business-black/60 mt-2">
            Join 200+ teams transforming their L&D
          </p>
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