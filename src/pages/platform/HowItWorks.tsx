
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, Brain, BarChart3, MessageCircle, Lightbulb, ArrowRight, CheckCircle, Zap, Info, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import PricingContactSales from "@/components/forms/PricingContactSales";
import VideoModal from "@/components/VideoModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HowItWorksProps {
  openDemoModal?: (source: string) => void;
  openContactSalesModal?: (source: string) => void;
}

const HowItWorks = ({ openDemoModal, openContactSalesModal }: HowItWorksProps) => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const journeySteps = [
    {
      step: "1",
      title: "Onboarding & Profiling",
      description: "AI creates personalized learner profiles based on skills, goals, and learning preferences",
      icon: Users,
      features: ["Skill assessment", "Learning style analysis", "Goal setting", "Team integration"],
      mainBenefit: "Personalized learning paths from day one",
      metrics: null
    },
    {
      step: "2", 
      title: "Personalized Content",
      description: "Dynamic content curation based on individual needs and organizational objectives",
      icon: Brain,
      features: ["Adaptive pathways", "Content recommendations", "Skill gap detection", "Progress tracking"],
      mainBenefit: "Content that adapts to your pace and style",
      metrics: null
    },
    {
      step: "3",
      title: "Active Learning",
      description: "Engaging experiences with real-time support and collaboration tools",
      icon: Zap,
      features: ["Interactive modules", "Peer collaboration", "AI mentorship", "Innovation projects"],
      mainBenefit: "Learn by doing with AI-powered support",
      metrics: null
    },
    {
      step: "4",
      title: "Insights & Growth",
      description: "Continuous feedback loop with analytics driving improvement and innovation",
      icon: BarChart3,
      features: ["Performance analytics", "Engagement insights", "Impact measurement", "Future planning"],
      mainBenefit: "Measurable ROI and business impact",
      metrics: {
        engagement: "85%",
        completion: "92%",
        roi: "3.2x"
      }
    }
  ];

  const touchpoints = [
    {
      title: "AI-Powered Guidance",
      description: "24/7 intelligent support that adapts to learning patterns",
      icon: Brain
    },
    {
      title: "Peer Collaboration",
      description: "Connect with colleagues for shared learning experiences",
      icon: Users
    },
    {
      title: "Expert Mentorship", 
      description: "Access to subject matter experts and industry leaders",
      icon: MessageCircle
    },
    {
      title: "Innovation Labs",
      description: "Hands-on spaces for experimentation and creative problem-solving",
      icon: Lightbulb
    }
  ];

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation openDemoModal={openDemoModal} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Target className="w-4 h-4 mr-2" />
            Platform Overview
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
            How LXERA
            <span className="text-business-black block mt-2"> Works</span>
          </h1>
          <p className="text-lg sm:text-xl text-business-black/70 max-w-4xl mx-auto mb-12 leading-relaxed font-normal font-inter">
            Discover the intelligent ecosystem that transforms learning into innovation. 
            From personalized onboarding to measurable business impact.
          </p>
          {/* Hick's Law: Clear visual hierarchy for CTAs */}
          <div className="flex flex-col gap-6 items-center">
            {/* Primary CTA - Large and centered */}
            <div className="animate-pulse-subtle">
              <ProgressiveDemoCapture
                source="how_it_works_platform_page"
                buttonText="Start Your Journey"
                onSuccess={() => {}}
                openDemoModal={openDemoModal}
                className="!px-12 !py-6 !text-lg !font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              />
            </div>
            
            {/* Secondary CTA - Ghost button */}
            <Button 
              variant="ghost" 
              size="lg" 
              className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:bg-future-green/10 font-inter font-normal text-business-black/70 hover:text-business-black" 
              onClick={() => setIsVideoModalOpen(true)}
            >
              Watch How It Works
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Journey Flow Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              The Complete Learning Journey
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Follow the intelligent path from initial engagement to transformative innovation
            </p>
          </div>

          <TooltipProvider>
            <div className="relative">
              {/* Serial Position Effect: Visual progress connector */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-future-green/20 via-future-green to-future-green/20 transform -translate-y-1/2" />
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
                {journeySteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isExpanded = expandedCards.includes(index);
                  const isHovered = hoveredStep === index;
                  const isResultStep = index === 3; // Step 4 - Von Restorff Effect
                  const isMiddleStep = index === 1 || index === 2; // Steps 2-3 - Serial Position Effect
                  
                  return (
                    <div key={index} className="relative">
                      {/* Serial Position Effect: Pulsing dots for middle steps */}
                      {isMiddleStep && (
                        <div className="hidden lg:block absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-future-green rounded-full animate-pulse" />
                      )}
                      
                      <Card 
                        className={`
                          relative overflow-hidden border-0 transition-all duration-300 cursor-pointer
                          ${isResultStep 
                            ? 'bg-gradient-to-br from-future-green/10 to-future-green/5 shadow-2xl scale-105 lg:scale-110' 
                            : 'shadow-lg hover:shadow-xl'
                          }
                          ${isHovered ? 'transform scale-105' : ''}
                          ${isMiddleStep ? 'ring-2 ring-future-green/20' : ''}
                        `}
                        onMouseEnter={() => setHoveredStep(index)}
                        onMouseLeave={() => setHoveredStep(null)}
                        onClick={() => {
                          toggleCardExpansion(index);
                          setIsVideoModalOpen(true); // Fitts's Law: Entire card clickable for demo
                        }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isResultStep ? 'bg-future-green text-white' : 'bg-future-green/10'
                            }`}>
                              <IconComponent className={`w-6 h-6 ${isResultStep ? 'text-white' : 'text-business-black'}`} />
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              isResultStep ? 'bg-business-black' : 'bg-future-green'
                            }`}>
                              {step.step}
                            </div>
                          </div>
                          <CardTitle className="text-xl font-bold text-business-black transition-colors">
                            {step.title}
                          </CardTitle>
                          
                          {/* Miller's Law: Show main benefit with tooltip for details */}
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-base font-semibold bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
                              {step.mainBenefit}
                            </p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-business-black/40 hover:text-business-black cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm">{step.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {/* Von Restorff Effect: Show metrics for results step */}
                          {isResultStep && step.metrics && (
                            <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in">
                              <div className="text-center p-2 bg-white/50 rounded-lg">
                                <p className="text-2xl font-bold text-future-green">{step.metrics.engagement}</p>
                                <p className="text-xs text-business-black/60">Engagement</p>
                              </div>
                              <div className="text-center p-2 bg-white/50 rounded-lg">
                                <p className="text-2xl font-bold text-future-green">{step.metrics.completion}</p>
                                <p className="text-xs text-business-black/60">Completion</p>
                              </div>
                              <div className="text-center p-2 bg-white/50 rounded-lg">
                                <p className="text-2xl font-bold text-future-green">{step.metrics.roi}</p>
                                <p className="text-xs text-business-black/60">ROI</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Miller's Law: Expandable features */}
                          {isExpanded ? (
                            <ul className="space-y-2 animate-fade-in">
                              {step.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center text-sm text-business-black font-medium">
                                  <CheckCircle className="w-4 h-4 text-future-green mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center justify-between text-sm text-business-black font-medium">
                              <span>Click to explore features</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </CardContent>
                        
                        {/* Fitts's Law: Visual indicator for clickable area */}
                        <div className="absolute inset-0 bg-gradient-to-t from-future-green/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </Card>
                      
                      {/* Progress connector dots */}
                      {index < journeySteps.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                          <div className="w-2 h-2 bg-future-green rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* Support Touchpoints */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Support Throughout Your Journey
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Multiple touchpoints ensure learners are never alone in their growth journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {touchpoints.map((touchpoint, index) => {
              const IconComponent = touchpoint.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black">
                      {touchpoint.title}
                    </CardTitle>
                    <CardDescription className="text-business-black font-medium">
                      {touchpoint.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-lg sm:text-xl text-business-black/70 mb-12 leading-relaxed font-normal font-inter">
            Discover how LXERA can revolutionize learning and innovation in your organization
          </p>
          
          {/* Hick's Law: Clear visual hierarchy with single primary CTA */}
          <div className="flex flex-col gap-6 items-center">
            {/* Primary CTA - Emphasized and centered */}
            <div className="transform hover:scale-105 transition-all duration-300">
              <ProgressiveDemoCapture
                source="how_it_works_cta_section"
                buttonText="Start Your Journey"
                onSuccess={() => {}}
                openDemoModal={openDemoModal}
                className="!px-12 !py-6 !text-lg !font-medium shadow-lg hover:shadow-xl bg-future-green hover:bg-future-green/90"
              />
            </div>
            
            {/* Secondary option - De-emphasized ghost button */}
            <div className="text-sm text-business-black/50">
              or
            </div>
            <PricingContactSales 
              source="how_it_works_page"
              className="!bg-transparent !border-business-black/20 !text-business-black/70 hover:!bg-business-black/5 hover:!text-business-black !font-normal"
              openContactSalesModal={openContactSalesModal}
            />
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        setIsOpen={setIsVideoModalOpen}
        videoUrl="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera-Demo-v2.mp4"
        videoCaption="LXERA Platform Demo"
      />
    </div>
  );
};

export default HowItWorks;
