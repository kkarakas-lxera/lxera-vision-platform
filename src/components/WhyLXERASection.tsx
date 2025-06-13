
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Heart, BarChart3, Settings, Network, Zap, Target, Users, Lightbulb, TrendingUp, Rocket, Shield } from "lucide-react";

const WhyLXERASection = () => {
  const capabilities = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personalized Learning Journeys",
      valueStatement: "Smarter paths. Faster mastery. Deeper learning.",
      features: [
        "AI adapts to individual cognitive styles and preferences",
        "Smart content sequencing based on learner progress",
        "Micro-learning paths that fit busy professional schedules"
      ],
      impactStat: "📈 60% faster completion rates",
      iconBg: "bg-future-green",
      badgeBg: "bg-future-green/20",
      badgeBorder: "border-future-green",
      secondaryIcon: <Zap className="w-5 h-5 text-future-green/70" />
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Enhanced Engagement & Motivation",
      valueStatement: "Where emotion meets education.",
      features: [
        "Real-time sentiment tracking for personalized responses",
        "Gamified elements and storytelling to boost motivation",
        "Social learning features that foster continuous peer-to-peer learning"
      ],
      impactStat: "🚀 3x higher engagement",
      iconBg: "bg-lxera-red",
      badgeBg: "bg-lxera-red/20",
      badgeBorder: "border-lxera-red",
      secondaryIcon: <Target className="w-5 h-5 text-lxera-red/70" />
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Data-Driven Decision-Making",
      valueStatement: "Every interaction becomes an insight.",
      features: [
        "Actionable analytics for learners, instructors, and managers",
        "Predictive insights to identify skill gaps before they impact performance",
        "**ROI tracking** that connects learning to business outcomes"
      ],
      impactStat: "⚡ 50% faster L&D decisions",
      iconBg: "bg-lxera-blue",
      badgeBg: "bg-lxera-blue/20",
      badgeBorder: "border-lxera-blue",
      secondaryIcon: <TrendingUp className="w-5 h-5 text-lxera-blue/70" />
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Rapid Prototyping & Innovation",
      valueStatement: "Turn learners into innovators.",
      features: [
        "Low-code tools for citizen development and experimentation",
        "Collaborative sandboxes for testing ideas safely",
        "Innovation sprints that drive bottom-up solutions"
      ],
      impactStat: "💡 72% more likely to innovate",
      iconBg: "bg-light-green",
      badgeBg: "bg-light-green/40",
      badgeBorder: "border-light-green",
      secondaryIcon: <Lightbulb className="w-5 h-5 text-light-green/80" />
    },
    {
      icon: <Network className="w-8 h-8 text-white" />,
      title: "Organizational Capability Building",
      valueStatement: "Scale learning that scales business impact.",
      features: [
        "Strategic upskilling aligned with business transformation goals",
        "Centralized platform for enterprise-wide capability development",
        "Leadership development programs that create change agents"
      ],
      impactStat: "💰 40% reduction in L&D costs",
      iconBg: "bg-emerald",
      badgeBg: "bg-emerald/20",
      badgeBorder: "border-emerald",
      secondaryIcon: <Users className="w-5 h-5 text-emerald/70" />
    }
  ];

  return (
    <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10 relative overflow-hidden">
      {/* Enhanced animated background elements with additional icons */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-future-green rounded-full animate-float flex items-center justify-center">
          <Rocket className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-64 right-20 w-24 h-24 bg-light-green rounded-full animate-float flex items-center justify-center" style={{animationDelay: '2s'}}>
          <Shield className="w-8 h-8 text-emerald" />
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-future-green rounded-full animate-float flex items-center justify-center" style={{animationDelay: '1s'}}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald rounded-full animate-float flex items-center justify-center" style={{animationDelay: '3s'}}>
          <Target className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Section Header with staggered animations */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            Why LXERA
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto animate-slide-in-right" style={{animationDelay: '0.4s'}}>
            Strategic Outcomes with Tangible Impact
          </p>
          
          {/* Animated underline */}
          <div className="mt-6 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow"></div>
          </div>
        </div>

        {/* Enhanced Capability Cards with staggered animations */}
        <div className="space-y-12">
          {capabilities.map((capability, index) => (
            <Card 
              key={index} 
              className={`bg-white/80 backdrop-blur-sm border-0 lxera-shadow overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:scale-102 animate-fade-in-up ${
                index % 2 === 0 ? '' : 'lg:flex-row-reverse'
              }`}
              style={{animationDelay: `${0.8 + index * 0.2}s`}}
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-center">
                  {/* Enhanced Icon Section with hover animations and secondary icons */}
                  <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col items-center lg:items-start relative">
                    {/* Floating background element */}
                    <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative">
                      <div className={`w-20 h-20 ${capability.iconBg} rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
                        <div className="transition-all duration-300 group-hover:scale-125">
                          {capability.icon}
                        </div>
                        
                        {/* Animated ring effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-future-green/20 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                      </div>
                      
                      {/* Secondary floating icon */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" style={{transitionDelay: '200ms'}}>
                        {capability.secondaryIcon}
                      </div>
                    </div>
                    
                    <Badge className={`${capability.badgeBg} text-business-black ${capability.badgeBorder} text-sm px-4 py-2 font-bold transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative z-10`}>
                      <span className="animate-pulse-slow">{capability.impactStat}</span>
                    </Badge>
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="lg:w-2/3 p-8 lg:p-12 lg:pl-0 relative">
                    <h3 className="text-2xl lg:text-3xl font-bold text-business-black mb-3 transition-all duration-300 group-hover:text-future-green">
                      {capability.title}
                    </h3>
                    <p className="text-lg font-semibold text-business-black/70 mb-6 transition-colors duration-300 group-hover:text-business-black/90">
                      {capability.valueStatement}
                    </p>
                    <ul className="space-y-3">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-business-black/80 group-hover:text-business-black transition-all duration-300 transform group-hover:translate-x-2" style={{transitionDelay: `${featureIndex * 100}ms`}}>
                          <div className="w-2 h-2 bg-future-green rounded-full mr-4 mt-2 flex-shrink-0 transition-all duration-300 group-hover:scale-150 group-hover:animate-pulse"></div>
                          <span dangerouslySetInnerHTML={{ __html: feature }} />
                        </li>
                      ))}
                    </ul>
                    
                    {/* Animated progress line */}
                    <div className="mt-6 w-full h-0.5 bg-gradient-to-r from-future-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="h-full bg-future-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
