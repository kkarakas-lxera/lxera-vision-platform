import { Brain, Heart, BarChart3, Settings, TrendingDown, Zap, Target, Users, Lightbulb, TrendingUp, Shield } from "lucide-react";

export interface CapabilityData {
  icon: any;
  title: string;
  valueStatement: string;
  description?: string;
  features: string[];
  impactStat: string;
  tangibleResults?: {
    icon: any;
    label: string;
    description: string;
  };
  iconBg: string;
  badgeBg: string;
  badgeBorder: string;
  secondaryIcon: any;
  category: string;
  useCases: string[];
  roiMetrics: string;
}

export const capabilitiesData: CapabilityData[] = [
  {
    icon: Brain,
    title: "Personalized Learning Journeys",
    valueStatement: "Smarter paths. Faster mastery. Deeper learning.",
    description: "Our AI adapts to each learner’s preferences, behavior, and feedback in real time.",
    features: [
      "Tailored learning paths that reflect unique cognitive styles",
      "Content personalized through AI diagnostics and adaptive algorithms"
    ],
    impactStat: "",
    tangibleResults: {
      icon: Zap,
      label: "Tangible Results",
      description: "Learners complete content 60% faster and retain up to 85% more using personalized experiences."
    },
    iconBg: "bg-future-green",
    badgeBg: "bg-future-green/20",
    badgeBorder: "border-future-green",
    secondaryIcon: Zap,
    category: "learning",
    useCases: [
      "Sales team learning new product features with adaptive content",
      "IT professionals upskilling on cloud technologies at their own pace",
      "Healthcare workers completing compliance training efficiently"
    ],
    roiMetrics: ""
  },
  {
    icon: Users,
    // Enhanced semantic & consistent structure
    title: "Enhanced Engagement and Motivation",
    valueStatement: "Where emotion meets education. Deeper connections, stronger commitment.",
    description: "LXERA leverages emotional intelligence and gamification—adapting in real time to each learner's mood and motivation signals.",
    features: [
      "Personalized emotional responses powered by real-time sentiment tracking",
      "Immersive storytelling, dynamic avatars, and gamified incentives that maintain motivation"
    ],
    impactStat: "",
    tangibleResults: {
      icon: Heart,
      label: "Tangible Results",
      description: "Learners engage 3x more often and dropout rates fall by 40% in emotionally optimized learning environments."
    },
    iconBg: "bg-lxera-red",
    badgeBg: "bg-lxera-red/20",
    badgeBorder: "border-lxera-red",
    secondaryIcon: Heart,
    category: "engagement",
    useCases: [
      "Remote teams building stronger connections through collaborative learning",
      "Customer service teams improving satisfaction scores through role-play scenarios",
      "Leadership development with peer mentoring and feedback loops"
    ],
    roiMetrics: "Engagement: +250%"
  },
  {
    icon: BarChart3,
    title: "Data-Driven Decision-Making",
    valueStatement: "Every interaction becomes an insight.",
    description: "We transform behavioral data into performance breakthroughs.",
    features: [
      "Actionable insights for learners and managers",
      "Continuous feedback loops from engagement and outcome analytics"
    ],
    impactStat: "⚡ 50% faster L&D decisions",
    iconBg: "bg-lxera-blue",
    badgeBg: "bg-lxera-blue/20",
    badgeBorder: "border-lxera-blue",
    secondaryIcon: TrendingUp,
    category: "analytics",
    useCases: [
      "Manufacturing company reducing safety incidents through predictive skill gap analysis",
      "Financial services firm optimizing training budgets with performance correlation data",
      "Retail chain improving customer satisfaction by tracking service training effectiveness"
    ],
    roiMetrics: "Cost Reduction: 45%"
  },
  {
    icon: Settings,
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
    secondaryIcon: Lightbulb,
    category: "learning",
    useCases: [
      "Engineering teams rapidly prototyping new solutions for client challenges",
      "Marketing departments testing campaign strategies in simulated environments",
      "Operations teams creating efficiency improvements through collaborative innovation"
    ],
    roiMetrics: "Innovation Rate: +180%"
  },
  {
    icon: TrendingDown,
    title: "Organizational Capability Building",
    valueStatement: "Scale learning that scales business impact.",
    features: [
      "Strategic upskilling aligned with business transformation goals",
      "Centralized platform for enterprise-wide capability development",
      "Leadership development programs that create change agents"
    ],
    impactStat: "📉 40% reduction in L&D costs",
    iconBg: "bg-emerald",
    badgeBg: "bg-emerald/20",
    badgeBorder: "border-emerald",
    secondaryIcon: Shield,
    category: "analytics",
    useCases: [
      "Global corporation aligning 50,000+ employees with digital transformation goals",
      "Mid-size company developing internal leaders for succession planning",
      "Startup scaling culture and capabilities while maintaining agility"
    ],
    roiMetrics: "Capability Growth: 65%"
  }
];
