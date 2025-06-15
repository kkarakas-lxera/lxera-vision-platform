import { 
  Shield, 
  BarChart3, 
  Settings, 
  Bot, 
  Target, 
  FileText, 
  Code, 
  Gamepad, 
  UserCheck, 
  Users, 
  Bell 
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import FeatureCard from "./FeatureCard";

// Add a 'category' field for grouping features by theme
const highlightsData = [
  {
    category: "Security & Compliance",
    icon: <Shield className="w-8 h-8" />, // Use Shield (or Lock if preferred) for Security
    title: "Enterprise-Grade Security & Compliance",
    subtitle: "Trust Built Into Every Layer",
    description: "SOC2 & GDPR aligned\nProtect your data with role-based access, encryption, and compliance-ready systems.",
    bullets: [
      "SOC2 & GDPR aligned",
      "Role-based access",
      "Data encryption at rest and in transit"
    ],
    badges: [
      { text: "Data Privacy", tooltip: "Your data privacy is protected at every layer", type: "quality" },
      { text: "Compliance", tooltip: "SOC2 & GDPR aligned", type: "quality" },
      { text: "Enterprise Security", tooltip: "Best practices for enterprise security", type: "feature" },
      { text: "Trustworthy AI", tooltip: "Built with AI you can trust", type: "tech" },
    ],
    iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
    cardBg: "bg-white/90",
    roi: "Trust & compliance ready"
  },
  {
    category: "Analytics",
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Executive-Ready Analytics Dashboard",
    subtitle: "Predict Learning ROI with Confidence",
    description: "Actionable insights for every stakeholder\nVisualize outcomes and innovation metrics across departments.",
    bullets: [
      "ROI tracking & forecasting",
      "Executive-level views across teams",
      "Departmental skill analytics"
    ],
    badges: [
      { text: "ROI Tracking", tooltip: "Easily measure learning investment impact", type: "feature" },
      { text: "Executive Views", tooltip: "Share insights across the entire leadership team", type: "benefit" },
      { text: "Skill Insights", tooltip: "Track critical skill development by trend", type: "feature" },
      { text: "Departmental Analytics", tooltip: "See analytics by business group", type: "benefit" },
    ],
    iconBg: "bg-gradient-to-br from-lxera-blue to-emerald",
    cardBg: "bg-white/90",
    roi: "Predict learning ROI"
  },
  {
    category: "HR Integration",
    icon: <Settings className="w-8 h-8" />,
    title: "Automated Role-Based Learning (HRIS Integration)",
    subtitle: "HR System-Aware Learning Journeys",
    description: "Fully automated journeys\nSync with HR systems to personalize content by job role and performance.",
    bullets: [
      "Syncs with HRIS in real-time",
      "Personalizes by job function",
      "Performance-triggered learning paths"
    ],
    badges: [
      { text: "HRIS", tooltip: "Integrates with leading HRIS", type: "tech" },
      { text: "Career Pathing", tooltip: "Personalized for career development", type: "benefit" },
      { text: "Auto-Personalization", tooltip: "Learning auto-personalized by role", type: "feature" },
    ],
    iconBg: "bg-gradient-to-br from-emerald to-lxera-blue",
    cardBg: "bg-white/90",
    roi: "Fully automated journeys"
  },
  {
    category: "AI & Personalization",
    icon: <Bot className="w-8 h-8" />,
    title: "AI Hyper-Personalized Learning Engine",
    subtitle: "Tailored Learning at the Speed of Thought",
    description: "Truly individualized journeys\nAdapts learning based on role, behavior, and goals using LLMs and RAG.",
    bullets: [
      "LLM-powered adaptation",
      "Journey updates with each user interaction",
      "Immediate relevance, zero generic"
    ],
    badges: [
      { text: "LLM-Powered", tooltip: "Leverages large language models for adaptation", type: "tech" },
      { text: "Dynamic Personalization", tooltip: "Journeys adapt dynamically to user needs", type: "feature" },
      { text: "Real-Time Relevance", tooltip: "Ensures all learning is immediately applicable", type: "benefit" }
    ],
    iconBg: "bg-gradient-to-br from-emerald to-future-green",
    cardBg: "bg-white/90",
    popular: true,
    roi: "Truly individualized journeys"
  },
  {
    category: "Skill Analysis",
    icon: <Target className="w-8 h-8" />,
    title: "Real-Time Skill Gap Analysis",
    subtitle: "Market-Aligned Taxonomy Engine",
    description: "3x faster skill development\nAlign skills with job needs and future market requirements.",
    bullets: [
      "Market-aligned skill graph",
      "Gap insights for critical roles",
      "Future-proof workforce skills"
    ],
    badges: [
      { text: "Gap Analysis", tooltip: "Identify the biggest skill gaps instantly", type: "feature" },
      { text: "Skill Graph", tooltip: "Map and visualize organizational skills", type: "tech" },
      { text: "Workforce Agility", tooltip: "Adapt quickly to shifting market needs", type: "benefit" },
    ],
    iconBg: "bg-gradient-to-br from-emerald to-future-green",
    cardBg: "bg-white/90",
    roi: "3x faster skill development"
  },
  {
    category: "Content Transformation",
    icon: <FileText className="w-8 h-8" />,
    title: "Knowledge Base Transformation",
    subtitle: "Convert Legacy Content into Learning Assets",
    description: "+70% internal content engagement\nTurn SOPs and reports into microlearning modules.",
    bullets: [
      "Upgrade SOPs into smart modules",
      "Contextual assets for just-in-time learning",
      "Microlearning from existing docs"
    ],
    badges: [
      { text: "Legacy Upgrade", tooltip: "Transform legacy content into interactive learning", type: "feature" },
      { text: "Smart Learning Assets", tooltip: "Contextualized, searchable, measurable", type: "benefit" },
      { text: "Microlearning", tooltip: "Quick learning in bite-sized modules", type: "quality" }
    ],
    iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
    cardBg: "bg-white/90",
    roi: "+70% engagement"
  },
  {
    category: "Analytics",
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Learner Analytics Dashboards",
    subtitle: "Empower Learners With Their Own Data",
    description: "+25% self-driven completion rate\nHelp learners track their progress and own their development.",
    bullets: [
      "Self-service analytics for every learner",
      "Customizable progress views",
      "Drive autonomy and motivation"
    ],
    badges: [
      { text: "Progress Tracking", tooltip: "Learners can see their own journeys", type: "feature" },
      { text: "Learner Autonomy", tooltip: "Increases self-directed learning completion", type: "benefit" },
      { text: "Self-Insight", tooltip: "Deeper insight creates faster results", type: "benefit" }
    ],
    iconBg: "bg-gradient-to-br from-future-green to-lxera-blue",
    cardBg: "bg-white/90",
    roi: "+25% self-completion"
  },
  {
    category: "Innovation",
    icon: <Code className="w-8 h-8" />,
    title: "Low-Code / No-Code Innovation Sandbox",
    subtitle: "Build Without Technical Barriers",
    description: "10x faster prototyping\nEnable bottom-up innovation through app building and automation.",
    bullets: [
      "Drag-and-drop app building",
      "Automate workflows instantly",
      "Empower business users—not just IT"
    ],
    badges: [
      { text: "Citizen Development", tooltip: "Enable anyone to innovate", type: "benefit" },
      { text: "Low-Code", tooltip: "Rapid creation with minimal code", type: "tech" },
      { text: "Innovation Enablement", tooltip: "Ignite creative problem solving", type: "feature" }
    ],
    iconBg: "bg-gradient-to-br from-lxera-red to-emerald",
    cardBg: "bg-white/90",
    roi: "10x faster prototyping"
  },
  {
    category: "Gamification",
    icon: <Gamepad className="w-8 h-8" />,
    title: "Real-Time Adaptive Gamification",
    subtitle: "Motivation That Moves With You",
    description: "+40% higher engagement\nGame mechanics adjust to each learner’s behavior and progress.",
    bullets: [
      "Gamification powered by behavioral AI",
      "Personalized challenges & rewards",
      "Dynamic adaptation to learning style"
    ],
    badges: [
      { text: "Gamified Learning", tooltip: "Boost engagement with game elements", type: "feature" },
      { text: "Behavioral AI", tooltip: "Learner motivation model", type: "tech" },
      { text: "Engagement Engine", tooltip: "Persistent, adaptive motivation", type: "benefit" }
    ],
    iconBg: "bg-gradient-to-br from-lxera-red to-lxera-blue",
    cardBg: "bg-white/90",
    roi: "+40% engagement"
  },
  {
    category: "AI & Personalization",
    icon: <UserCheck className="w-8 h-8" />,
    title: "Human-in-the-Loop Intelligence",
    subtitle: "AI-Powered. Human-Refined.",
    description: "Expert accuracy with emotional depth\nCombine scalable AI with human review for high-trust learning.",
    bullets: [
      "Hybrid intelligence—AI plus human experts",
      "Mentor oversight ensures accuracy",
      "Trusted recommendations"
    ],
    badges: [
      { text: "Ethical AI", tooltip: "AI reviewed for safety, ethics, and bias", type: "quality" },
      { text: "Mentor Oversight", tooltip: "Human mentors refine every learning journey", type: "benefit" },
      { text: "Hybrid Intelligence", tooltip: "AI + Human collaboration", type: "tech" }
    ],
    iconBg: "bg-gradient-to-br from-future-green to-lxera-red",
    cardBg: "bg-white/90",
    roi: "Expert accuracy"
  },
  {
    category: "Content Generation",
    icon: <Users className="w-8 h-8" />,
    title: "AI Avatar-Powered Content Creation",
    subtitle: "Transform Text to Video Instantly",
    description: "90% content production savings\nGenerate dynamic video lessons with lifelike avatars.",
    bullets: [
      "Text-to-video in seconds",
      "Lifelike digital presenters",
      "Natural-sounding speech"
    ],
    badges: [
      { text: "AI Avatars", tooltip: "Digital presenters generate content 24/7", type: "tech" },
      { text: "Voice Synthesis", tooltip: "Natural-sounding voiceovers", type: "tech" },
      { text: "Instant Video", tooltip: "Instant video from text", type: "feature" }
    ],
    iconBg: "bg-gradient-to-br from-lxera-blue to-future-green",
    cardBg: "bg-white/90",
    roi: "90% content efficiency"
  },
  {
    category: "AI & Personalization",
    icon: <Bot className="w-8 h-8" />,
    title: "Organization-Specific Mentor Chatbot",
    subtitle: "24/7 Personalized AI Learning Support",
    description: "Always available, always contextual\nPrivate AI mentor trained on internal content.",
    bullets: [
      "24/7 contextual guidance",
      "Trained on your internal resources",
      "Answers, recommendations, and reminders"
    ],
    badges: [
      { text: "AI Coach", tooltip: "Your own AI mentor", type: "feature" },
      { text: "Always-On", tooltip: "Support whenever you need it", type: "benefit" },
      { text: "Smart Help", tooltip: "Contextual, relevant advice", type: "tech" }
    ],
    iconBg: "bg-gradient-to-br from-emerald to-future-green",
    cardBg: "bg-white/90",
    roi: "Always available & tailored"
  },
  {
    category: "Collaboration",
    icon: <Users className="w-8 h-8" />,
    title: "Social Learning Communities",
    subtitle: "Peer-to-Peer Growth in Action",
    description: "+50% collaboration in hybrid teams\nSpaces for discussion, mentorship, and informal learning.",
    bullets: [
      "Mentorship matching & tracking",
      "Team challenges and collaboration",
      "Informal knowledge sharing"
    ],
    badges: [
      { text: "Peer Learning", tooltip: "Learn from colleagues and peers", type: "feature" },
      { text: "Team Challenges", tooltip: "Boosts collaboration across teams", type: "benefit" },
      { text: "Social Spaces", tooltip: "Foster informal learning", type: "feature" }
    ],
    iconBg: "bg-gradient-to-br from-emerald to-lxera-red",
    cardBg: "bg-white/90",
    roi: "+50% collaboration"
  },
  {
    category: "Engagement",
    icon: <Bell className="w-8 h-8" />,
    title: "Smart Nudging & Behavioral Triggers",
    subtitle: "Right Nudge. Right Time. Right Outcome.",
    description: "+35% completion rate improvement\nNudges and reminders based on user behavior via Slack/email.",
    bullets: [
      "Automated nudge delivery",
      "Behavior-based reminders",
      "Slack & email integration"
    ],
    badges: [
      { text: "Behavioral Nudges", tooltip: "Timely nudges drive outcomes", type: "feature" },
      { text: "Engagement Boost", tooltip: "Reminders boost motivation and completion", type: "benefit" },
      { text: "Micro-Motivation", tooltip: "Tiny triggers, big impact", type: "tech" }
    ],
    iconBg: "bg-gradient-to-br from-lxera-red to-lxera-blue",
    cardBg: "bg-white/90",
    roi: "+35% completion"
  },
];

// Get all unique categories
const categories = Array.from(
  new Set(highlightsData.map((item) => item.category))
);

const groupedByCategory: Record<string, typeof highlightsData> = {};
categories.forEach((cat) => {
  groupedByCategory[cat] = highlightsData.filter((item) => item.category === cat);
});

const PlatformHighlightsSection = () => {
  const [tabValue, setTabValue] = useState(categories[0]);
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) contactSection.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="features"
      className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige via-white to-smart-beige/50 relative overflow-hidden"
    >
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
              <span>100% personalized Learning</span>
            </div>
          </div>
        </div>
        
        {/* Tabbed Layout and Horizontal Carousel for Features */}
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-4 bg-transparent mb-8">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-5 py-2 rounded-full bg-white text-business-black font-semibold border-2 border-future-green/30 data-[state=active]:bg-future-green/10 data-[state=active]:text-future-green transition-all"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="w-full">
              {/* Desktop: Horizontal Carousel, 3 at a time */}
              <div className="hidden lg:block">
                <Carousel opts={{ align: "start", slidesToScroll: 1 }}>
                  <CarouselContent>
                    {groupedByCategory[cat].map((feature, index) => (
                      <CarouselItem
                        key={feature.title}
                        className="basis-1/3 flex-grow-0"
                      >
                        <FeatureCard
                          feature={feature}
                          index={index}
                          desktop
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              {/* Mobile: Stack vertically */}
              <div className="block lg:hidden space-y-4">
                {groupedByCategory[cat].map((feature, idx) => (
                  <FeatureCard
                    key={feature.title}
                    feature={feature}
                    index={idx}
                    expanded
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
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
