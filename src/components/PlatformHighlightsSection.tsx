
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Gamepad2, Target, Users, Bot, Code, FileText, BarChart3, MessageSquare, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const PlatformHighlightsSection = () => {
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Hyper-Personalized Learning Engine",
      subtitle: "Tailored learning using LLMs, RAG, SME layers",
      description: "Advanced AI adapts content to individual cognitive styles, learning pace, and professional context. Every learner receives a unique journey optimized for their success.",
      badges: [
        { text: "AI-Powered", tooltip: "Powered by advanced machine learning algorithms" },
        { text: "Adaptive Content", tooltip: "Content automatically adjusts to learning preferences" },
        { text: "SME Validated", tooltip: "Subject Matter Expert reviewed and approved content" }
      ],
      iconBg: "bg-gradient-to-br from-future-green to-light-green",
      cardBg: "bg-gradient-to-br from-future-green/5 to-light-green/10"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Real-Time Adaptive Gamification",
      subtitle: "Dynamic motivation through behavioral mechanics",
      description: "Intelligent gamification that evolves with learner behavior. No static badges—every element responds to individual motivation patterns and engagement levels.",
      badges: [
        { text: "Behavioral AI", tooltip: "AI analyzes user behavior patterns for optimization" },
        { text: "Dynamic Rewards", tooltip: "Rewards system adapts based on individual preferences" },
        { text: "Engagement Boost", tooltip: "Proven to increase learning engagement by 40%" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-red to-lxera-blue",
      cardBg: "bg-gradient-to-br from-lxera-red/5 to-lxera-blue/10"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Skill Taxonomy Engine",
      subtitle: "Live mapping of skills to roles and market needs",
      description: "Real-time skill gap analysis aligned with industry demands. Automatically identifies critical capabilities and creates targeted development pathways.",
      badges: [
        { text: "Market Aligned", tooltip: "Synced with real-time job market data" },
        { text: "Gap Analysis", tooltip: "Identifies skill gaps and provides targeted recommendations" },
        { text: "Career Mapping", tooltip: "Maps skills to career progression pathways" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-future-green",
      cardBg: "bg-gradient-to-br from-emerald/5 to-future-green/10"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "AI Avatar-Powered Video & Audio",
      subtitle: "Human-like, immersive content delivery",
      description: "Dynamic AI avatars deliver personalized video content with natural speech. Transform any text into engaging, professional video lessons instantly.",
      badges: [
        { text: "AI Avatars", tooltip: "Lifelike digital presenters for content delivery" },
        { text: "Voice Synthesis", tooltip: "Natural-sounding AI-generated speech" },
        { text: "Instant Video", tooltip: "Convert text to professional video in seconds" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
      cardBg: "bg-gradient-to-br from-lxera-blue/5 to-future-green/10"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "24/7 AI Mentor Chatbot",
      subtitle: "Instant feedback and personalized coaching",
      description: "Organization-specific AI mentor trained on your data. Provides contextual guidance, answers questions, and offers personalized learning recommendations around the clock.",
      badges: [
        { text: "Always Available", tooltip: "24/7 support with instant response times" },
        { text: "Contextual Help", tooltip: "Understands your specific learning context and goals" },
        { text: "Org-Specific", tooltip: "Trained on your organization's unique content and processes" }
      ],
      iconBg: "bg-gradient-to-br from-light-green to-emerald",
      cardBg: "bg-gradient-to-br from-light-green/5 to-emerald/10"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Low-Code / No-Code Innovation Sandbox",
      subtitle: "Tools to build, automate, and prototype",
      description: "Empower citizen developers with intuitive tools for rapid prototyping. Create workflows, automate processes, and build solutions without technical barriers.",
      badges: [
        { text: "Citizen Development", tooltip: "Enables non-technical users to build solutions" },
        { text: "Rapid Prototyping", tooltip: "Build and test ideas in minutes, not weeks" },
        { text: "Automation", tooltip: "Automate repetitive tasks and workflows" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-red to-emerald",
      cardBg: "bg-gradient-to-br from-lxera-red/5 to-emerald/10"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Knowledge Base Transformation",
      subtitle: "Convert SOPs/docs into smart learning assets",
      description: "AI transforms existing documentation into interactive learning modules. Turn static knowledge into engaging, searchable, and trackable learning experiences.",
      badges: [
        { text: "Document AI", tooltip: "AI-powered document analysis and transformation" },
        { text: "Smart Conversion", tooltip: "Automatically converts docs to interactive content" },
        { text: "Interactive Content", tooltip: "Searchable, trackable, and engaging learning materials" }
      ],
      iconBg: "bg-gradient-to-br from-future-green to-lxera-blue",
      cardBg: "bg-gradient-to-br from-future-green/5 to-lxera-blue/10"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Reporting & Dashboards",
      subtitle: "Full visibility for L&D and HR leaders",
      description: "Comprehensive analytics with predictive insights. Track learning ROI, identify skill trends, and make data-driven decisions with enterprise-grade reporting.",
      badges: [
        { text: "Predictive Analytics", tooltip: "AI predicts learning outcomes and trends" },
        { text: "ROI Tracking", tooltip: "Measure the financial impact of learning programs" },
        { text: "Executive Insights", tooltip: "C-suite ready dashboards and reports" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-light-green",
      cardBg: "bg-gradient-to-br from-lxera-blue/5 to-light-green/10"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Social Learning Spaces",
      subtitle: "Peer engagement, mentorship, and team challenges",
      description: "Collaborative environments that foster peer-to-peer learning. Create communities, facilitate mentorship, and drive engagement through social interaction.",
      badges: [
        { text: "Peer Learning", tooltip: "Learn from colleagues and industry peers" },
        { text: "Mentorship", tooltip: "Structured mentorship programs and matching" },
        { text: "Team Challenges", tooltip: "Collaborative challenges that build team skills" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-lxera-red",
      cardBg: "bg-gradient-to-br from-emerald/5 to-lxera-red/10"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "HRIS Integration",
      subtitle: "Connects with HR systems for role-based learning automation",
      description: "Seamless integration with existing HR systems. Automatically assign learning paths based on roles, performance reviews, and career progression plans.",
      badges: [
        { text: "HRIS Sync", tooltip: "Syncs with popular HR information systems" },
        { text: "Role-Based", tooltip: "Automatically assigns content based on job roles" },
        { text: "Automated Assignment", tooltip: "Learning paths assigned based on HR triggers" }
      ],
      iconBg: "bg-gradient-to-br from-light-green to-lxera-blue",
      cardBg: "bg-gradient-to-br from-light-green/5 to-lxera-blue/10"
    }
  ];

  const toggleMobileExpanded = (index: number) => {
    setExpandedMobile(expandedMobile === index ? null : index);
  };

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
        
        {/* Desktop Grid - 2 rows of 5 */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.cardBg} border-0 lxera-shadow group transition-all duration-500 hover:shadow-xl hover:scale-105 animate-fade-in-up relative overflow-hidden`}
              style={{animationDelay: `${0.8 + index * 0.1}s`}}
            >
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0`}>
                  {feature.icon}
                </div>
                
                {/* Content with consistent spacing */}
                <div className="flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-business-black mb-2 group-hover:text-future-green transition-colors duration-300 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm italic text-business-black/60 mb-3 font-medium leading-relaxed">
                    {feature.subtitle}
                  </p>
                  
                  <p className="text-sm text-business-black/80 leading-relaxed mb-4 group-hover:text-business-black transition-colors duration-300 flex-grow">
                    {feature.description}
                  </p>
                  
                  {/* Feature badges with tooltips */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {feature.badges.map((badge, badgeIndex) => (
                      <Tooltip key={badgeIndex}>
                        <TooltipTrigger asChild>
                          <Badge 
                            className="text-xs px-2 py-1 bg-white/50 text-business-black border-business-black/10 hover:bg-white/70 transition-colors duration-300 cursor-help"
                          >
                            {badge.text}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{badge.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Accordion Layout */}
        <div className="lg:hidden space-y-4 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.cardBg} border-0 lxera-shadow transition-all duration-300`}
            >
              <CardContent className="p-0">
                {/* Header - Always Visible */}
                <button
                  onClick={() => toggleMobileExpanded(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/20 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-business-black">
                        {feature.title}
                      </h3>
                      <p className="text-sm italic text-business-black/60 font-medium">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                  {expandedMobile === index ? 
                    <ChevronUp className="w-5 h-5 text-business-black/60" /> : 
                    <ChevronDown className="w-5 h-5 text-business-black/60" />
                  }
                </button>

                {/* Expandable Content */}
                {expandedMobile === index && (
                  <div className="px-6 pb-6 animate-fade-in-up">
                    <p className="text-sm text-business-black/80 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {feature.badges.map((badge, badgeIndex) => (
                        <Tooltip key={badgeIndex}>
                          <TooltipTrigger asChild>
                            <Badge 
                              className="text-xs px-3 py-1 bg-white/50 text-business-black border-business-black/10 hover:bg-white/70 transition-colors duration-300 cursor-help"
                            >
                              {badge.text}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{badge.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
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
