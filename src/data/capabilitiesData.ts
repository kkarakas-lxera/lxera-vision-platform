
import { Brain, Heart, BarChart3, Users, Lightbulb, Shield } from "lucide-react";

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
    description: "LXERA's AI continuously adapts to each learner's preferences, behaviors, and feedback—delivering real-time, personalized content.",
    features: [
      "Tailored learning paths that reflect unique cognitive styles",
      "Content personalized through AI diagnostics and adaptive algorithms"
    ],
    impactStat: "",
    tangibleResults: {
      icon: Lightbulb,
      label: "Tangible Results",
      description: "Learners complete programs 60% faster and retain 85% more with tailored experiences."
    },
    iconBg: "bg-future-green",
    badgeBg: "bg-future-green/20",
    badgeBorder: "border-future-green",
    secondaryIcon: Lightbulb,
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
    title: "Enhanced Engagement & Motivation",
    valueStatement: "Where emotion meets education. Deeper connection. Stronger commitment.",
    description: "LXERA detects each learner's motivation signals and mood, using emotional intelligence and gamification to adapt the journey dynamically.",
    features: [
      "Personalized emotional responses powered by real-time sentiment tracking",
      "Immersive storytelling, dynamic avatars, and gamified incentives that maintain motivation"
    ],
    impactStat: "",
    tangibleResults: {
      icon: Heart,
      label: "Tangible Results",
      description: "Organizations report 3x higher engagement and a 40% lift in course completion."
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
    description: "LXERA transforms behavioral data into actionable intelligence, helping teams optimize learning strategies and unlock performance breakthroughs.",
    features: [
      "Actionable insights for learners, instructors, and managers",
      "Continuous feedback loops from engagement and outcome analytics"
    ],
    impactStat: "",
    tangibleResults: {
      icon: BarChart3,
      label: "Tangible Results",
      description: "Track skills, impact, and progress with real-time dashboards aligned to your goals."
    },
    iconBg: "bg-lxera-blue",
    badgeBg: "bg-lxera-blue/20",
    badgeBorder: "border-lxera-blue",
    secondaryIcon: BarChart3,
    category: "analytics",
    useCases: [
      "Manufacturing company reducing safety incidents through predictive skill gap analysis",
      "Financial services firm optimizing training budgets with performance correlation data",
      "Retail chain improving customer satisfaction by tracking service training effectiveness"
    ],
    roiMetrics: "Cost Reduction: 45%"
  },
  {
    icon: Lightbulb,
    title: "Rapid Prototyping & Innovation Enablement",
    valueStatement: "Fuel creativity from the ground up.",
    description: "LXERA empowers employees to turn ideas into prototypes—fast. Through guided no-code tools and citizen development, innovation becomes everyone's job.",
    features: [
      "Tools for co-creation, experimentation, and rapid prototyping",
      "Community learning spaces for bottom-up idea generation"
    ],
    impactStat: "",
    tangibleResults: {
      icon: Lightbulb,
      label: "Tangible Results",
      description: "70% of teams launch internal innovations within their first 90 days."
    },
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
  }
];
