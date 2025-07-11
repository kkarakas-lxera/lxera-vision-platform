import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SmartEmailCapture from '@/components/forms/SmartEmailCapture';
import ProgressiveDemoCapture from '@/components/forms/ProgressiveDemoCapture';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon?: React.ReactNode;
  ctaText: string;
  ctaAction: 'email' | 'demo';
}

const MobilePricingCards = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isMonthly, setIsMonthly] = useState(false); // Default to annual like desktop
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);

  // Add scroll animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in-left {
        from {
          transform: translateX(-20px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slide-in-right {
        from {
          transform: translateX(20px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const plans: PricingPlan[] = [
    {
      name: 'Core',
      price: isMonthly ? '$49' : '$39',
      period: 'per month/per user',
      description: 'Everything you need to get started',
      features: [
        'AI Hyper-Personalized Learning Engine',
        'AI Avatar-Powered Content Creation',
        'Real-Time Adaptive Gamification',
        'Smart Nudging & Behavioral Triggers',
        'Human-in-the-Loop Intelligence',
        'Executive-Ready Analytics Dashboard',
        'Knowledge Base Transformation',
        'Taxonomist Skill Gap Engine'
      ],
      popular: true,
      icon: <Star className="w-5 h-5" />,
      ctaText: 'Get Started',
      ctaAction: 'email'
    },
    {
      name: 'Enterprise',
      price: 'Custom pricing',
      period: '',
      description: 'Advanced features for growing teams',
      features: [
        'Everything in Core, plus:',
        'Organization-Specific AI Mentor',
        'Enterprise-Grade Security & Compliance',
        'Low-Code / No-Code Innovation Sandbox',
        'SSO/HRIS Integrations'
      ],
      icon: <Zap className="w-5 h-5" />,
      ctaText: 'Contact Sales',
      ctaAction: 'demo'
    }
  ];

  const toggleFeatures = (planName: string) => {
    setExpandedCard(expandedCard === planName ? null : planName);
  };

  // Handle swipe gestures
  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    let startX: number;
    let scrollLeft: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      e.preventDefault();
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      const cardWidth = container.offsetWidth;
      const scrollPosition = container.scrollLeft;
      const targetCard = Math.round(scrollPosition / cardWidth);
      
      container.scrollTo({
        left: targetCard * cardWidth,
        behavior: 'smooth'
      });
      
      setCurrentCard(targetCard);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Billing Toggle - Sticky */}
      <div className="sticky top-16 z-20 bg-gradient-to-br from-smart-beige/95 via-future-green/8 to-smart-beige/95 backdrop-blur-sm px-4 py-3 -mx-4 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-center gap-3">
          <span className={cn(
            "text-sm font-medium transition-colors",
            isMonthly ? "text-business-black" : "text-business-black/60"
          )}>
            Monthly
          </span>
          <button
            onClick={() => setIsMonthly(!isMonthly)}
            className="relative w-14 h-7 bg-business-black/10 rounded-full transition-colors hover:bg-business-black/20"
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 bg-future-green rounded-full transition-all duration-300 shadow-md",
              isMonthly ? "left-1" : "left-8"
            )} />
          </button>
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isMonthly ? "text-business-black" : "text-business-black/60"
          )}>
            Annual
            <span className="text-future-green ml-1 font-semibold">-20%</span>
          </span>
        </div>
      </div>

      {/* Swipeable Cards Container */}
      <div 
        ref={cardsRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className="flex-shrink-0 w-full snap-center animate-fade-in-up"
            style={{ animationDelay: `${400 + index * 200}ms` }}
          >
            <div className={cn(
              "bg-white rounded-2xl p-6 shadow-xl border transition-all duration-300",
              plan.popular ? "border-future-green/50 relative" : "border-gray-200"
            )}>
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-future-green text-business-black text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 pt-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.icon}
                  <h3 className="text-2xl font-semibold text-business-black">{plan.name}</h3>
                </div>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-business-black">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-business-black/70 ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-business-black/80">{plan.description}</p>
              </div>

              {/* CTA Button */}
              <div className="mb-6">
                {plan.ctaAction === 'email' ? (
                  <SmartEmailCapture 
                    source="mobile_pricing"
                    buttonText={plan.ctaText}
                    variant="mobile"
                    className="w-full"
                  />
                ) : (
                  <ProgressiveDemoCapture 
                    source="mobile_pricing"
                    buttonText={plan.ctaText}
                    variant="mobile"
                    className="w-full"
                  />
                )}
              </div>

              {/* Features Preview */}
              <div>
                <div className="space-y-3 mb-4">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-future-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-business-black/80">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Expand Button */}
                {plan.features.length > 3 && (
                  <>
                    <button
                      onClick={() => toggleFeatures(plan.name)}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-future-green hover:text-future-green/80 transition-colors py-2"
                    >
                      {expandedCard === plan.name ? (
                        <>
                          Show less
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View all {plan.features.length} features
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Expanded Features */}
                    {expandedCard === plan.name && (
                      <div className="mt-4 space-y-3 animate-fade-in-up">
                        {plan.features.slice(3).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-future-green mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-business-black/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {plans.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentCard === index
                ? "w-8 bg-future-green"
                : "w-1.5 bg-business-black/20"
            )}
          />
        ))}
      </div>

      {/* Trust Signal */}
      <div className="bg-future-green/20 border border-future-green/30 text-business-black px-4 py-3 rounded-lg text-center mt-6 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <span className="font-semibold flex items-center justify-center gap-2 text-sm">
          🚀 Join 200+ innovative teams already transforming their L&D
        </span>
      </div>
    </div>
  );
};

export default MobilePricingCards;