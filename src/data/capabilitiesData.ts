
import { Brain, Heart, BarChart3, Settings, TrendingDown, Zap, Target, Users, Lightbulb, TrendingUp, Shield } from "lucide-react";

export interface CapabilityData {
  icon: any;
  title: string;
  valueStatement: string;
  features: string[];
  impactStat: string;
  iconBg: string;
  badgeBg: string;
  badgeBorder: string;
  secondaryIcon: any;
}

export const capabilitiesData: CapabilityData[] = [
  {
    icon: Brain,
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
    secondaryIcon: Zap
  },
  {
    icon: Users,
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
    secondaryIcon: Heart
  },
  {
    icon: BarChart3,
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
    secondaryIcon: TrendingUp
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
    secondaryIcon: Lightbulb
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
    secondaryIcon: Shield
  }
];
