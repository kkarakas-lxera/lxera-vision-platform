
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Gamepad2, Target, Users, Bot, Code, FileText, BarChart3, MessageSquare, Settings } from "lucide-react";

const PlatformHighlightsSection = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Hyper-Personalized Learning Engine",
      subtitle: "Tailored learning using LLMs, RAG, SME layers",
      description: "Advanced AI adapts content to individual cognitive styles, learning pace, and professional context. Every learner receives a unique journey optimized for their success.",
      badges: ["AI-Powered", "Adaptive Content", "SME Validated"],
      iconBg: "bg-gradient-to-br from-future-green to-light-green",
      cardBg: "bg-gradient-to-br from-future-green/5 to-light-green/10"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Real-Time Adaptive Gamification",
      subtitle: "Dynamic motivation through behavioral mechanics",
      description: "Intelligent gamification that evolves with learner behavior. No static badges—every element responds to individual motivation patterns and engagement levels.",
      badges: ["Behavioral AI", "Dynamic Rewards", "Engagement Boost"],
      iconBg: "bg-gradient-to-br from-lxera-red to-lxera-blue",
      cardBg: "bg-gradient-to-br from-lxera-red/5 to-lxera-blue/10"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Skill Taxonomy Engine",
      subtitle: "Live mapping of skills to roles and market needs",
      description: "Real-time skill gap analysis aligned with industry demands. Automatically identifies critical capabilities and creates targeted development pathways.",
      badges: ["Market Aligned", "Gap Analysis", "Career Mapping"],
      iconBg: "bg-gradient-to-br from-emerald to-future-green",
      cardBg: "bg-gradient-to-br from-emerald/5 to-future-green/10"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "AI Avatar-Powered Video & Audio",
      subtitle: "Human-like, immersive content delivery",
      description: "Dynamic AI avatars deliver personalized video content with natural speech. Transform any text into engaging, professional video lessons instantly.",
      badges: ["AI Avatars", "Voice Synthesis", "Instant Video"],
      iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
      cardBg: "bg-gradient-to-br from-lxera-blue/5 to-future-green/10"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "24/7 AI Mentor Chatbot",
      subtitle: "Instant feedback and personalized coaching",
      description: "Organization-specific AI mentor trained on your data. Provides contextual guidance, answers questions, and offers personalized learning recommendations around the clock.",
      badges: ["Always Available", "Contextual Help", "Org-Specific"],
      iconBg: "bg-gradient-to-br from-light-green to-emerald",
      cardBg: "bg-gradient-to-br from-light-green/5 to-emerald/10"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Low-Code / No-Code Innovation Sandbox",
      subtitle: "Tools to build, automate, and prototype",
      description: "Empower citizen developers with intuitive tools for rapid prototyping. Create workflows, automate processes, and build solutions without technical barriers.",
      badges: ["Citizen Development", "Rapid Prototyping", "Automation"],
      iconBg: "bg-gradient-to-br from-lxera-red to-emerald",
      cardBg: "bg-gradient-to-br from-lxera-red/5 to-emerald/10"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Knowledge Base Transformation",
      subtitle: "Convert SOPs/docs into smart learning assets",
      description: "AI transforms existing documentation into interactive learning modules. Turn static knowledge into engaging, searchable, and trackable learning experiences.",
      badges: ["Document AI", "Smart Conversion", "Interactive Content"],
      iconBg: "bg-gradient-to-br from-future-green to-lxera-blue",
      cardBg: "bg-gradient-to-br from-future-green/5 to-lxera-blue/10"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Reporting & Dashboards",
      subtitle: "Full visibility for L&D and HR leaders",
      description: "Comprehensive analytics with predictive insights. Track learning ROI, identify skill trends, and make data-driven decisions with enterprise-grade reporting.",
      badges: ["Predictive Analytics", "ROI Tracking", "Executive Insights"],
      iconBg: "bg-gradient-to-br from-lxera-blue to-light-green",
      cardBg: "bg-gradient-to-br from-lxera-blue/5 to-light-green/10"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Social Learning Spaces",
      subtitle: "Peer engagement, mentorship, and team challenges",
      description: "Collaborative environments that foster peer-to-peer learning. Create communities, facilitate mentorship, and drive engagement through social interaction.",
      badges: ["Peer Learning", "Mentorship", "Team Challenges"],
      iconBg: "bg-gradient-to-br from-emerald to-lxera-red",
      cardBg: "bg-gradient-to-br from-emerald/5 to-lxera-red/10"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "HRIS Integration",
      subtitle: "Connects with HR systems for role-based learning automation",
      description: "Seamless integration with existing HR systems. Automatically assign learning paths based on roles, performance reviews, and career progression plans.",
      badges: ["HRIS Sync", "Role-Based", "Automated Assignment"],
      iconBg: "bg-gradient-to-br from-light-green to-lxera-blue",
      cardBg: "bg-gradient-to-br from-light-green/5 to-lxera-blue/10"
    }
  ];

  return (
    <section id="features" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-white to-smart-beige/50 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-20 w-32 h-32 bg-future-green/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-16 w-24 h-24 bg-light-green/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-emerald/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-20 h-20 bg-lxera-blue/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            Platform Highlights
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/70 max-w-4xl mx-auto animate-slide-in-right" style={{animationDelay: '0.4s'}}>
            <em>10 Features That Power the LXERA Advantage</em>
          </p>
          
          {/* Elegant separator */}
          <div className="mt-8 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
          </div>
        </div>
        
        {/* Feature Grid - 2 rows of 5 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.cardBg} border-0 lxera-shadow group transition-all duration-500 hover:shadow-xl hover:scale-105 animate-fade-in-up relative overflow-hidden`}
              style={{animationDelay: `${0.8 + index * 0.1}s`}}
            >
              <CardContent className="p-6 relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-business-black mb-2 group-hover:text-future-green transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-sm italic text-business-black/60 mb-3 font-medium">
                  {feature.subtitle}
                </p>
                
                <p className="text-sm text-business-black/80 leading-relaxed mb-4 group-hover:text-business-black transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Feature badges */}
                <div className="flex flex-wrap gap-1">
                  {feature.badges.map((badge, badgeIndex) => (
                    <Badge 
                      key={badgeIndex}
                      className="text-xs px-2 py-1 bg-white/50 text-business-black border-business-black/10 hover:bg-white/70 transition-colors duration-300"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '2s'}}>
          <div className="bg-gradient-to-r from-white/80 to-smart-beige/50 backdrop-blur-sm p-8 rounded-2xl border border-future-green/20 hover:border-future-green/40 transition-all duration-500 group">
            <p className="text-lg text-business-black/70 mb-6">
              Ready to transform your organization's learning and innovation capabilities?
            </p>
            <Button 
              className="bg-gradient-to-r from-future-green to-light-green text-business-black font-semibold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border-0"
            >
              See LXERA in Action →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlightsSection;
