
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import { ArrowRight, Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Gamepad2 } from "lucide-react";

interface SolutionsProps {
  openDemoModal?: (source: string) => void;
}

const Solutions = ({ openDemoModal }: SolutionsProps) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reordered useCases array
  const useCases = [
    {
      id: "ai-personalized-learning",
      title: "AI-Personalized Learning",
      description: "Adaptive learning experiences that adjust to each individual's pace, style, and goals",
      icon: Brain,
      features: ["Adaptive Content Delivery", "Learning Path Optimization", "Real-time Difficulty Adjustment"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      id: "workforce-reskilling",
      title: "Workforce Reskilling & Upskilling",
      description: "Future-proof your workforce with targeted skill development programs",
      icon: Users,
      features: ["Skills Gap Analysis", "Career Pathway Mapping", "Progress Tracking"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      id: "ai-gamification",
      title: "AI Gamification & Motivation",
      description: "Boost engagement with dynamic rewards and intelligent challenges",
      icon: Gamepad2,
      features: ["Dynamic Reward Systems", "Intelligent Challenges", "Progress Gamification"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      id: "ai-mentorship",
      title: "AI Mentorship & Support",
      description: "Real-time guidance to keep learners engaged and on track",
      icon: MessageCircle,
      features: ["24/7 AI Support", "Personalized Mentorship", "Instant Feedback"],
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50"
    },
    {
      id: "learning-analytics",
      title: "Learning Analytics & Engagement Insights",
      description: "Data-driven insights to optimize learning outcomes and engagement",
      icon: BarChart3,
      features: ["Performance Analytics", "Engagement Metrics", "Predictive Insights"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      id: "citizen-innovation",
      title: "Citizen Developer Enablement",
      description: "Empower business users to build and automate without coding",
      icon: Lightbulb,
      features: ["No-Code Tools", "Automation Workflows", "Self-Service Development"],
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50"
    },
    {
      id: "enterprise-innovation",
      title: "Enterprise Innovation Enablement",
      description: "Transform your organization's innovation capabilities and culture",
      icon: Building2,
      features: ["Innovation Frameworks", "Collaboration Tools", "ROI Measurement"],
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100"
    }
  ];

  // Handle scroll detection for mobile carousel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const cardWidth = 288; // w-72 = 18rem = 288px
      const gap = 16; // gap-4 = 1rem = 16px
      const scrollUnit = cardWidth + gap;
      const index = Math.round(scrollLeft / scrollUnit);
      setCurrentScrollIndex(Math.min(index, useCases.length - 1));
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [useCases.length]);

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation openDemoModal={openDemoModal} />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-4 sm:mb-6 bg-future-green/20 text-business-black border-future-green/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full">
              Solutions Portfolio
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
              Transform Learning with
              <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent block sm:inline"> AI-Powered Solutions</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-business-black/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Discover our comprehensive suite of AI-driven solutions designed to revolutionize learning, 
              development, and innovation across organizations and communities.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile - Horizontal scroll container for all cards */}
          <div className="md:hidden">
            {/* Scroll container wrapper with fade edges */}
            <div className="relative">
              {/* Left fade edge indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-smart-beige to-transparent z-10 pointer-events-none"></div>
              
              {/* Right fade edge indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-smart-beige to-transparent z-10 pointer-events-none"></div>

              {/* Horizontal scroll container */}
              <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
                  {useCases.map((useCase, index) => {
                    const IconComponent = useCase.icon;
                    const isActive = activeCard === useCase.id;
                    return (
                      <Card
                        key={useCase.id}
                        className={`group cursor-pointer transition-all duration-500 border-0 ${useCase.bgColor} animate-fade-in-up flex-shrink-0 w-72 ring-2 ring-future-green/20`}
                        style={{ animationDelay: `${index * 100}ms`, scrollSnapAlign: 'center' }}
                        onTouchStart={() => setActiveCard(useCase.id)}
                        onTouchEnd={() => setActiveCard(null)}
                      >
                        <CardHeader className="pb-3 p-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-business-black group-hover:text-emerald transition-colors duration-300 leading-tight">
                            {useCase.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-business-black/70 leading-relaxed">
                            {useCase.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <ul className="space-y-2 mb-4">
                            {useCase.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center text-xs text-business-black/80">
                                <div className="w-1.5 h-1.5 bg-future-green rounded-full mr-2 flex-shrink-0"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant="ghost"
                            className={`w-full group-hover:bg-gradient-to-r ${useCase.color} group-hover:text-white transition-all duration-300 font-medium text-sm py-2`}
                            onClick={() => navigate(`/solutions/${useCase.id}`)}
                          >
                            Learn More
                            <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Scroll indicators */}
              <div className="flex justify-center mt-4 gap-1">
                {useCases.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentScrollIndex 
                        ? 'w-6 h-1.5 bg-future-green' 
                        : 'w-1.5 h-1.5 bg-business-black/20 hover:bg-business-black/30'
                    }`}
                    onClick={() => {
                      const scrollContainer = scrollContainerRef.current;
                      if (scrollContainer) {
                        const cardWidth = 288;
                        const gap = 16;
                        const scrollPosition = index * (cardWidth + gap);
                        scrollContainer.scrollTo({
                          left: scrollPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid - Show all cards */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card
                  key={useCase.id}
                  className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${useCase.bgColor} animate-fade-in-up ring-2 ring-future-green/20`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setActiveCard(useCase.id)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                    <div className={`w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-business-black group-hover:text-emerald transition-colors duration-300 leading-tight">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-business-black/70 leading-relaxed">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <ul className="space-y-2 mb-4 sm:mb-6">
                      {useCase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-xs sm:text-sm text-business-black/80">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-future-green rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="ghost"
                      className={`w-full group-hover:bg-gradient-to-r ${useCase.color} group-hover:text-white transition-all duration-300 font-medium text-sm sm:text-base py-2 sm:py-3`}
                      onClick={() => navigate(`/solutions/${useCase.id}`)}
                    >
                      Learn More
                      <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl animate-fade-in-scale">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-4 sm:mb-6 leading-tight">
              Ready to Transform Your Organization?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Discover how our AI-powered solutions can revolutionize learning and innovation 
              in your organization. Let's build the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
              <div className="relative">
                <ProgressiveDemoCapture
                  source="solutions_page_cta"
                  buttonText="Schedule Strategic Demo"
                  openDemoModal={openDemoModal}
                  className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/50 focus:ring-offset-2 border-0 inline-flex items-center justify-center w-full sm:w-auto"
                />
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 absolute right-6 sm:right-8 md:right-10 top-1/2 -translate-y-1/2 pointer-events-none text-orange-600" />
              </div>
              <Button
                onClick={() => navigate('/contact-sales')}
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-orange-600 hover:border-white font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/50 focus:ring-offset-2 w-full sm:w-auto"
              >
                Request Executive Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
