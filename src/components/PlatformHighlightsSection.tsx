import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Gamepad2, Target, Users, Bot, Code, FileText, BarChart3, MessageSquare, Settings, ChevronDown, ChevronUp, Crown, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

const PlatformHighlightsSection = () => {
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Tailored learning at the speed of thought",
      subtitle: "AI Hyper-Personalized Learning Engine",
      description:
        "LXERA uses advanced AI (LLMs, RAG, and SME layer) to craft unique, real-time learning journeys based on each user’s role, behavior, and goals. It learns as the learner learns—delivering exactly what they need, when they need it.",
      bullets: [
        "Zero generic content",
        "Adaptive to career path",
        "AI-curated relevance"
      ],
      badges: [
        { text: "AI-Powered", tooltip: "Powered by advanced machine learning algorithms", type: "tech" },
        { text: "Career Adaptive", tooltip: "Adaptive to each learner's unique career path", type: "feature" },
        { text: "Relevance Curated", tooltip: "All content is uniquely curated by AI for highest relevance", type: "benefit" }
      ],
      iconBg: "bg-gradient-to-br from-future-green to-emerald",
      cardBg: "bg-white/90",
      popular: true,
      roi: "60% faster learning"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Boost Engagement by 40%",
      subtitle: "Real-Time Adaptive Gamification",
      description: "Intelligent gamification that evolves with learner behavior. No static badges—every element responds to individual motivation patterns and engagement levels.",
      bullets: [
        "AI analyzes user behavior for optimization",
        "Rewards adapt to individual preferences",
        "Proven 40% engagement increase"
      ],
      badges: [
        { text: "Behavioral AI", tooltip: "AI analyzes user behavior patterns for optimization", type: "tech" },
        { text: "Dynamic Rewards", tooltip: "Rewards system adapts based on individual preferences", type: "feature" },
        { text: "Engagement Boost", tooltip: "Proven to increase learning engagement by 40%", type: "result" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-red to-lxera-blue",
      cardBg: "bg-white/90",
      enterprise: true,
      roi: "40% higher engagement"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Real-Time Skill Gap Analysis",
      subtitle: "Market-Aligned Skill Taxonomy Engine",
      description: "Real-time skill gap analysis aligned with industry demands. Automatically identifies critical capabilities and creates targeted development pathways.",
      bullets: [
        "Synced with real-time job market data",
        "Identifies gaps with targeted recommendations",
        "Maps skills to career progression paths"
      ],
      badges: [
        { text: "Market Aligned", tooltip: "Synced with real-time job market data", type: "feature" },
        { text: "Gap Analysis", tooltip: "Identifies skill gaps and provides targeted recommendations", type: "feature" },
        { text: "Career Mapping", tooltip: "Maps skills to career progression pathways", type: "benefit" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-future-green",
      cardBg: "bg-white/90",
      roi: "3x faster skill development"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Transform Text to Video Instantly",
      subtitle: "AI Avatar-Powered Content Creation",
      description: "Dynamic AI avatars deliver personalized video content with natural speech. Transform any text into engaging, professional video lessons instantly.",
      bullets: [
        "Lifelike digital presenters for content",
        "Natural-sounding AI-generated speech",
        "Convert text to professional video in seconds"
      ],
      badges: [
        { text: "AI Avatars", tooltip: "Lifelike digital presenters for content delivery", type: "tech" },
        { text: "Voice Synthesis", tooltip: "Natural-sounding AI-generated speech", type: "tech" },
        { text: "Instant Video", tooltip: "Convert text to professional video in seconds", type: "feature" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
      cardBg: "bg-white/90",
      roi: "90% content creation savings"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "24/7 AI-Powered Learning Support",
      subtitle: "Organization-Specific Mentor Chatbot",
      description: "Organization-specific AI mentor trained on your data. Provides contextual guidance, answers questions, and offers personalized learning recommendations around the clock.",
      bullets: [
        "24/7 support with instant responses",
        "Understands your specific learning context",
        "Trained on organization's unique content"
      ],
      badges: [
        { text: "Always Available", tooltip: "24/7 support with instant response times", type: "benefit" },
        { text: "Contextual Help", tooltip: "Understands your specific learning context and goals", type: "feature" },
        { text: "Org-Specific", tooltip: "Trained on your organization's unique content and processes", type: "feature" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-future-green",
      cardBg: "bg-white/90",
      popular: true,
      roi: "24/7 availability"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Build Solutions Without Code",
      subtitle: "No-Code Innovation Sandbox",
      description: "Empower citizen developers with intuitive tools for rapid prototyping. Create workflows, automate processes, and build solutions without technical barriers.",
      bullets: [
        "Enables non-technical users to build solutions",
        "Build and test ideas in minutes, not weeks",
        "Automate repetitive tasks and workflows"
      ],
      badges: [
        { text: "Citizen Development", tooltip: "Enables non-technical users to build solutions", type: "benefit" },
        { text: "Rapid Prototyping", tooltip: "Build and test ideas in minutes, not weeks", type: "feature" },
        { text: "Automation", tooltip: "Automate repetitive tasks and workflows", type: "feature" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-red to-emerald",
      cardBg: "bg-white/90",
      roi: "10x faster prototyping"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "AI Hyper-Personalized Learning Engine",
      subtitle: "Tailored learning at the speed of thought",
      description: "LXERA uses advanced AI (LLMs, RAG, and SME layer) to craft unique, real-time learning journeys based on each user’s role, behavior, and goals. It learns as the learner learns—delivering exactly what they need, when they need it.",
      bullets: [
        "Zero generic content",
        "Adaptive to career path",
        "AI-curated relevance"
      ],
      badges: [
        { text: "AI-Powered", tooltip: "Powered by advanced machine learning algorithms", type: "tech" },
        { text: "Career Adaptive", tooltip: "Adaptive to each learner's unique career path", type: "feature" },
        { text: "Relevance Curated", tooltip: "All content is uniquely curated by AI for highest relevance", type: "benefit" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
      cardBg: "bg-white/90",
      roi: "Truly individualized learning"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Predict Learning ROI with AI",
      subtitle: "Executive-Ready Analytics Dashboard",
      description: "Comprehensive analytics with predictive insights. Track learning ROI, identify skill trends, and make data-driven decisions with enterprise-grade reporting.",
      bullets: [
        "AI predicts learning outcomes and trends",
        "Measure financial impact of learning programs",
        "C-suite ready dashboards and reports"
      ],
      badges: [
        { text: "Predictive Analytics", tooltip: "AI predicts learning outcomes and trends", type: "tech" },
        { text: "ROI Tracking", tooltip: "Measure the financial impact of learning programs", type: "feature" },
        { text: "Executive Insights", tooltip: "C-suite ready dashboards and reports", type: "benefit" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-emerald",
      cardBg: "bg-white/90",
      enterprise: true,
      roi: "Predictive ROI insights"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Foster Peer-to-Peer Learning",
      subtitle: "Social Learning Communities",
      description: "Collaborative environments that foster peer-to-peer learning. Create communities, facilitate mentorship, and drive engagement through social interaction.",
      bullets: [
        "Learn from colleagues and industry peers",
        "Structured mentorship programs and matching",
        "Collaborative challenges that build team skills"
      ],
      badges: [
        { text: "Peer Learning", tooltip: "Learn from colleagues and industry peers", type: "feature" },
        { text: "Mentorship", tooltip: "Structured mentorship programs and matching", type: "feature" },
        { text: "Team Challenges", tooltip: "Collaborative challenges that build team skills", type: "benefit" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-lxera-red",
      cardBg: "bg-white/90",
      roi: "Community-driven growth"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Seamless HR System Integration",
      subtitle: "Automated Role-Based Learning",
      description: "Seamless integration with existing HR systems. Automatically assign learning paths based on roles, performance reviews, and career progression plans.",
      bullets: [
        "Syncs with popular HR information systems",
        "Automatically assigns content based on job roles",
        "Learning paths assigned based on HR triggers"
      ],
      badges: [
        { text: "HRIS Sync", tooltip: "Syncs with popular HR information systems", type: "tech" },
        { text: "Role-Based", tooltip: "Automatically assigns content based on job roles", type: "feature" },
        { text: "Automated Assignment", tooltip: "Learning paths assigned based on HR triggers", type: "feature" }
      ],
      iconBg: "bg-gradient-to-br from-emerald to-lxera-blue",
      cardBg: "bg-white/90",
      enterprise: true,
      roi: "Automated efficiency"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "From static to strategic learning assets",
      subtitle: "Knowledge Base Transformation",
      description: "LXERA turns legacy SOPs, reports, and manuals into interactive learning modules—making institutional knowledge accessible, trackable, and engaging.",
      bullets: [
        "No content left behind",
        "Contextualized knowledge assets",
        "Richer than your old LMS"
      ],
      badges: [
        { text: "Content Transformation", tooltip: "No content left behind", type: "feature" },
        { text: "Contextualized", tooltip: "Contextualized knowledge assets", type: "benefit" },
        { text: "Beyond LMS", tooltip: "Richer than your old LMS", type: "quality" }
      ],
      iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
      cardBg: "bg-white/90",
      roi: "Legacy docs, newly valuable"
    },
  ];

  const displayedFeatures = showAllFeatures ? features : features.slice(0, 6);

  const toggleMobileExpanded = (index: number) => {
    setExpandedMobile(expandedMobile === index ? null : index);
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'tech':
        return 'bg-lxera-blue/20 text-lxera-blue border-lxera-blue/30';
      case 'feature':
        return 'bg-future-green/20 text-emerald border-future-green/30';
      case 'benefit':
        return 'bg-emerald/20 text-emerald border-emerald/30';
      case 'quality':
        return 'bg-emerald/20 text-emerald border-emerald/30';
      case 'result':
        return 'bg-lxera-red/20 text-lxera-red border-lxera-red/30';
      default:
        return 'bg-smart-beige/50 text-business-black border-business-black/10';
    }
  };

  return (
    <section id="features" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-white to-smart-beige/50 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-20 w-32 h-32 bg-future-green/20 rounded-full animate-float-gentle"></div>
        <div className="absolute top-1/3 right-16 w-24 h-24 bg-emerald/20 rounded-full animate-float-gentle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-emerald/20 rounded-full animate-float-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-20 h-20 bg-lxera-blue/20 rounded-full animate-float-gentle" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            Platform Highlights
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/70 max-w-4xl mx-auto animate-slide-in-right" style={{animationDelay: '0.4s'}}>
            <em>10 Features That Power Measurable Results</em>
          </p>
          
          {/* Enhanced separator with stats */}
          <div className="mt-8 flex justify-center items-center gap-8 animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
            <div className="hidden md:flex items-center gap-2 text-sm text-business-black/60">
              <TrendingUp className="w-4 h-4 text-future-green" />
              <span>40% avg. engagement boost</span>
            </div>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-future-green to-transparent"></div>
            <div className="hidden md:flex items-center gap-2 text-sm text-business-black/60">
              <Sparkles className="w-4 h-4 text-future-green" />
              <span>60% faster learning</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Desktop Grid with consistent heights */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-16">
          {displayedFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`${feature.cardBg} border-0 lxera-shadow group transition-all duration-700 hover:shadow-2xl hover:scale-102 animate-fade-in-up relative overflow-hidden h-[420px] flex flex-col`}
              style={{animationDelay: `${0.8 + index * 0.1}s`}}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 relative z-10 h-full flex flex-col">
                {/* Enhanced Header with badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center text-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 animate-glow`}>
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    {feature.popular && (
                      <Badge className="bg-future-green/20 text-future-green border-future-green/30 text-xs px-2 py-1">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    {feature.enterprise && (
                      <Badge className="bg-business-black/10 text-business-black border-business-black/20 text-xs px-2 py-1">
                        Enterprise Favorite
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Content with progressive disclosure */}
                <div className="flex-grow flex flex-col">
                  {/* SWAPPED: Now subtitle is the main heading, title is below as subtitle */}
                  <h3 className="text-lg font-bold text-business-black mb-2 group-hover:text-future-green transition-colors duration-300 leading-tight">
                    {feature.subtitle}
                  </h3>
                  <p className="text-sm italic text-business-black/60 mb-3 font-medium leading-relaxed">
                    {feature.title}
                  </p>
                  
                  {/* ROI indicator */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      {feature.roi}
                    </span>
                  </div>
                  
                  {/* Progressive disclosure - show description on hover or always on mobile */}
                  <div className={`transition-all duration-500 ${hoveredCard === index ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 lg:opacity-100 lg:max-h-40'} overflow-hidden`}>
                    <p className="text-sm text-business-black/80 leading-relaxed mb-4 group-hover:text-business-black transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Enhanced feature badges with improved styling */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {feature.badges.map((badge, badgeIndex) => (
                      <Tooltip key={badgeIndex}>
                        <TooltipTrigger asChild>
                          <Badge 
                            className={`text-xs px-2 py-1 ${getBadgeStyle(badge.type)} hover:scale-105 transition-all duration-300 cursor-help`}
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
                
                {/* Enhanced hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg"></div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show All Features Button */}
        {!showAllFeatures && (
          <div className="hidden lg:flex justify-center mb-8 animate-fade-in-up" style={{animationDelay: '2s'}}>
            <Button 
              onClick={() => setShowAllFeatures(true)}
              className="bg-white text-business-black hover:bg-future-green hover:text-business-black border-2 border-future-green transition-all duration-300"
            >
              See All {features.length} Features
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Enhanced Mobile Accordion Layout */}
        <div className="lg:hidden space-y-4 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white border-0 lxera-shadow transition-all duration-300 animate-fade-in-up"
              style={{animationDelay: `${0.8 + index * 0.05}s`}}
            >
              <CardContent className="p-0">
                {/* SWAPPED: subtitle before title */}
                <button
                  onClick={() => toggleMobileExpanded(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-smart-beige/20 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        {/* subtitle is the main heading */}
                        <h3 className="text-lg font-bold text-business-black">
                          {feature.subtitle}
                        </h3>
                        {feature.popular && (
                          <Badge className="bg-future-green/20 text-future-green border-future-green/30 text-xs px-2 py-1">
                            <Crown className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      {/* title is now the subtitle line */}
                      <p className="text-sm italic text-business-black/60 font-medium">
                        {feature.title}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-full mt-1">
                        <TrendingUp className="w-3 h-3" />
                        {feature.roi}
                      </span>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-business-black/60 transition-transform duration-300 ${
                      expandedMobile === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Enhanced Expandable Content */}
                {expandedMobile === index && (
                  <div className="px-6 pb-6 animate-fade-in-up bg-smart-beige/10">
                    <p className="text-sm text-business-black/80 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Bullet points */}
                    <ul className="mb-4 space-y-2">
                      {feature.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="text-sm text-business-black/70 flex items-start">
                          <span className="text-future-green mr-2 mt-1 font-bold">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap gap-2">
                      {feature.badges.map((badge, badgeIndex) => (
                        <Tooltip key={badgeIndex}>
                          <TooltipTrigger asChild>
                            <Badge 
                              className={`text-xs px-3 py-1 ${getBadgeStyle(badge.type)} hover:scale-105 transition-all duration-300 cursor-help`}
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
        
        {/* Enhanced Call to Action */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '2s'}}>
          <div className="bg-gradient-to-r from-white/80 to-smart-beige/50 backdrop-blur-sm p-8 rounded-2xl border border-future-green/20 hover:border-future-green/40 transition-all duration-500 group relative overflow-hidden">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-future-green/5 via-transparent to-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-business-black mb-2">
                Ready to Transform Learning & Innovation?
              </h3>
              <p className="text-lg text-business-black/70 mb-6">
                See these features in action and discover how they can drive measurable results for your organization.
              </p>
              
              {/* Enhanced stats */}
              <div className="flex justify-center items-center gap-8 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
                  <span className="text-business-black/60">60% Faster Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-business-black/60">40% Higher Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lxera-blue rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-business-black/60">90% Content Efficiency</span>
                </div>
              </div>
              
              <Button 
                onClick={scrollToContact}
                className="bg-gradient-to-r from-future-green to-emerald text-business-black font-semibold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border-0 group-hover:shadow-future-green/20"
              >
                <span>See These Features in Action</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlightsSection;
