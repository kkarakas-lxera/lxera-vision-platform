import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import SmartEmailCapture from '@/components/forms/SmartEmailCapture';
import { Button } from '@/components/ui/button';

const EarlyAccessSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');

  const handleSuccess = () => {
    // After successful email capture, redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Back to login button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </div>

        {/* Logo and title */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Early Access
          </h1>
          <p className="text-lg text-gray-600">
            Join 500+ companies transforming their L&D with AI
          </p>
        </div>

        {/* Benefits list */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            What you'll get:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">AI-powered skills gap analysis</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Personalized learning paths for your team</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Real-time analytics and insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Priority access to new features</span>
            </li>
          </ul>
        </div>

        {/* Email capture form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Start your journey
          </h3>
          {emailFromUrl && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-700">
                We're setting up your early access for <strong>{emailFromUrl}</strong>
              </p>
            </div>
          )}
          <SmartEmailCapture
            source="early-access-signup"
            variant="default"
            buttonText="Get Started"
            placeholder="your@company.com"
            onSuccess={handleSuccess}
            className="w-full"
            initialEmail={emailFromUrl || undefined}
            autoSubmit={!!emailFromUrl}
          />
          <p className="text-xs text-gray-500 mt-4 text-center">
            Takes only 30 seconds • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Trust badges */}
        <div className="text-center text-sm text-gray-500">
          <p>Trusted by leading companies worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessSignup;