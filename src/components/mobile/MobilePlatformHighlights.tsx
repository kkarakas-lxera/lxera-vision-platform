import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Bot,
  Shield, 
  BarChart3, 
  Users, 
  Code, 
  Gamepad, 
  Bell,
  FileText, 
  Target,
  Settings,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Same highlights data as desktop
const highlightsData = [
  {
    icon: Bot,
    title: "AI Hyper-Personalized Learning Engine",
    microcopy: "Truly individualized journeys",
    description: "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
  },
  {
    icon: Users,
    title: "AI Avatar-Powered Content Creation",
    microcopy: "90% content efficiency",
    description: "Generate dynamic video lessons with lifelike avatars.",
  },
  {
    icon: Bot,
    title: "Organization-Specific Mentor Chatbot",
    microcopy: "Always available & tailored",
    description: "Private AI mentor trained on internal content.",
  },
  {
    icon: Gamepad,
    title: "Real-Time Adaptive Gamification",
    microcopy: "+40% engagement",
    description: "Game mechanics adjust to each learner's behavior and progress.",
  },
  {
    icon: Bell,
    title: "Smart Nudging & Behavioral Triggers",
    microcopy: "+35% completion",
    description: "Nudges and reminders based on user behavior via Slack/email.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security & Compliance",
    microcopy: "Trust & compliance ready",
    description: "SOC2 & GDPR aligned, encryption, role-based access.",
  },
  {
    icon: UserCheck,
    title: "Human-in-the-Loop Intelligence",
    microcopy: "Expert accuracy",
    description: "Combine scalable AI with human review for high-trust learning.",
  },
  {
    icon: BarChart3,
    title: "Executive-Ready Analytics Dashboard",
    microcopy: "Predict learning ROI",
    description: "Visualize outcomes and innovation metrics across departments.",
  },
  {
    icon: Code,
    title: "Low-Code / No-Code Innovation Sandbox",
    microcopy: "10x faster prototyping",
    description: "Enable bottom-up innovation through app building and automation.",
  },
  {
    icon: FileText,
    title: "Knowledge Base Transformation",
    microcopy: "+70% engagement",
    description: "Turn SOPs and reports into microlearning modules.",
  },
  {
    icon: Settings,
    title: "Automated Role-Based Learning (HRIS Integration)",
    microcopy: "Fully automated journeys",
    description: "Sync with HR systems to personalize content by job role.",
  },
  {
    icon: Users,
    title: "Social Learning Communities",
    microcopy: "+50% collaboration",
    description: "Spaces for discussion, mentorship, and informal learning.",
  }
];

const MobilePlatformHighlights = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  const toggleCard = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  // Handle swipe gestures for featured cards
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
      const cardWidth = container.offsetWidth / 2; // Show 2 cards at once
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

  const featuredFeatures = highlightsData.slice(0, 6);
  const additionalFeatures = highlightsData.slice(6);

  return (
    <>
      <section className="w-full py-16 px-4 bg-gradient-to-br from-smart-beige/30 via-white/60 to-smart-beige/40 relative overflow-hidden z-0 font-inter transition-all duration-1000 ease-in-out">
        <div className="max-w-7xl mx-auto relative z-0">
          {/* Header - same as desktop */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-medium text-business-black mb-6 font-inter">
              Platform Highlights
            </h2>
            <p className="text-base text-business-black/80 mb-2 max-w-3xl mx-auto font-normal font-inter">
              10+ features fueling impact, engagement, and innovation.
            </p>
          </div>

          {/* Swipeable Featured Cards */}
          <div 
            ref={cardsRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 mb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredFeatures.map((item, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-72 snap-center bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 shadow-lg rounded-2xl animate-fade-in-up"
                style={{
                  animationDelay: `${250 + index * 60}ms`,
                }}
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-business-black" />
                    </div>
                  </div>
                  
                  <h3 className="text-business-black font-medium text-base mb-1 font-inter text-center">{item.title}</h3>
                  <p className="text-business-black/70 mb-3 text-sm font-normal font-inter text-center">{item.description}</p>
                  
                  {/* Tap to reveal impact */}
                  <button
                    onClick={() => toggleCard(item.title)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-future-green hover:text-future-green/80 transition-colors py-2 bg-future-green/10 rounded-lg hover:bg-future-green/20"
                  >
                    {expandedCard === item.title ? (
                      <>
                        Hide impact
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show impact
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Expanded microcopy */}
                  {expandedCard === item.title && (
                    <div className="mt-3 animate-fade-in-up">
                      <p className="text-sm text-business-black/60 italic border-t border-future-green/20 pt-2 font-normal font-inter text-center">
                        {item.microcopy}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Swipe Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: Math.ceil(featuredFeatures.length / 2) }).map((_, index) => (
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

          {/* Show More/Less Features */}
          <div className="text-center">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center gap-2 text-future-green font-semibold hover:text-future-green/80 transition-colors py-2 px-4 bg-future-green/10 rounded-lg hover:bg-future-green/20"
            >
              {showAllFeatures ? (
                <>
                  Show fewer features
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show {additionalFeatures.length} more features
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Additional Features - Grid */}
          {showAllFeatures && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 animate-fade-in-up">
              {additionalFeatures.map((item, index) => (
                <Card
                  key={index + 6}
                  className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 shadow-lg rounded-2xl"
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-business-black" />
                      </div>
                    </div>
                    
                    <h3 className="text-business-black font-medium text-sm mb-1 font-inter text-center">{item.title}</h3>
                    <p className="text-business-black/70 mb-2 text-xs font-normal font-inter text-center">{item.description}</p>
                    
                    {/* Show microcopy directly for additional features */}
                    <p className="text-xs text-business-black/60 italic text-center font-normal font-inter">
                      {item.microcopy}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom text - same as desktop */}
          <p className="text-business-black/70 mb-2 text-center text-sm mt-8 font-normal font-inter">
            Each feature designed and refined with real-world feedback for measurable results.
          </p>
        </div>
      </section>

      {/* Section Separator - same as desktop */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/30 via-smart-beige/50 to-future-green/10 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/8 to-transparent"></div>
      </div>
    </>
  );
};

export default MobilePlatformHighlights;