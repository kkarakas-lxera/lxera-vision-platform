
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnalyticsDashboardPreview from "@/components/AnalyticsDashboardPreview";
import FeatureComparisonTable from "@/components/FeatureComparisonTable";
import IndustryUseCases from "@/components/IndustryUseCases";
import HeroSection from "@/components/analytics/HeroSection";
import MetricsSection from "@/components/analytics/MetricsSection";
import CoreFeaturesGrid from "@/components/analytics/CoreFeaturesGrid";
import CTASection from "@/components/analytics/CTASection";
import { BarChart3, Brain, TrendingUp, RefreshCw, Zap, Compass } from "lucide-react";
import { useState } from "react";

const LearningAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);

  const coreFeatures = [
    {
      icon: BarChart3,
      title: "Live Engagement Tracking",
      description: "See how learners interact with content and identify drop-off points quickly.",
      metric: "75% faster issue identification",
      details: "Real-time monitoring of learner interactions, scroll patterns, time spent on sections, and engagement drops. Get instant alerts when learners disengage."
    },
    {
      icon: Brain,
      title: "Motivation & Emotional Analysis", 
      description: "Detects patterns of confusion, fatigue, or momentum based on behavior.",
      metric: "89% accuracy in predicting learner frustration",
      details: "Advanced behavioral analysis using interaction patterns, response times, and engagement metrics to understand learner emotional states."
    },
    {
      icon: TrendingUp,
      title: "Progress Dashboards",
      description: "Tracks individual and team progress, showing where support or recognition is needed.",
      metric: "40% improvement in manager visibility",
      details: "Comprehensive dashboards showing individual progress, team comparisons, skill development trajectories, and achievement milestones."
    },
    {
      icon: RefreshCw,
      title: "Responsive Feedback Loops",
      description: "Adjusts learning content and nudges based on real-time activity.",
      metric: "60% increase in course completion",
      details: "Intelligent content adaptation that modifies difficulty, provides additional resources, or suggests breaks based on learner performance patterns."
    },
    {
      icon: Zap,
      title: "Predictive Learning Insights",
      description: "Flags who might fall behind so you can intervene before performance drops.",
      metric: "85% accuracy in predicting at-risk learners",
      details: "Machine learning algorithms analyze engagement patterns, assessment scores, and behavioral data to predict learner success and intervention needs."
    },
    {
      icon: Compass,
      title: "Skill Gap Intelligence",
      description: "Maps current skills to learning progress and highlights opportunities for development.",
      metric: "50% faster skill gap identification",
      details: "Automated skill mapping that compares current competencies with target roles, identifies gaps, and recommends personalized learning paths."
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Understand engagement and performance in real time to improve outcomes with intelligent learning data."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data, enterprise learning"
      />
      <Navigation />
      
      {/* Hero Section - Light background */}
      <div className="bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
        <HeroSection />
      </div>

      {/* Metrics Section - Green accent background */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100">
        <MetricsSection />
      </div>

      {/* The Challenge Section - White background */}
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            Knowing who clicked isn't enough.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            Traditional learning platforms tell you who completed a course. LXERA helps you understand how they engaged, what they felt, and when they needed help. Data should do more than measure—it should guide decisions.
          </p>
        </div>
      </section>

      {/* Dashboard Preview Section - Light beige background */}
      <section className="py-20 px-6 lg:px-12 bg-smart-beige/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              See your data in action
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Get instant insights into learner engagement, performance, and areas needing attention.
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
              </div>
            </div>
          ) : (
            <AnalyticsDashboardPreview />
          )}
        </div>
      </section>

      {/* Core Features Section - White background */}
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Turn data into action, instantly.
            </h2>
          </div>
          <CoreFeaturesGrid features={coreFeatures} />
        </div>
      </section>

      {/* Feature Comparison Section - Light gray background */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Beyond traditional analytics
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              See how LXERA's intelligent analytics compare to standard LMS reporting.
            </p>
          </div>
          <FeatureComparisonTable />
        </div>
      </section>

      {/* Industry Use Cases - White background */}
      <section className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Real-world impact across industries
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              See how organizations are using LXERA analytics to transform their learning outcomes.
            </p>
          </div>
          <IndustryUseCases />
        </div>
      </section>

      {/* What You Gain Section - Light beige background */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/40 to-future-green/20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            Clear visibility. Smarter decisions.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            LXERA equips L&D teams and managers with insights that go far beyond completion rates. You'll know who's engaged, who's thriving, and where to focus your attention—before issues arise.
          </p>
        </div>
      </section>

      {/* CTA Section - Green gradient background */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-500">
        <CTASection />
      </div>

      <Footer />
    </div>
  );
};

export default LearningAnalytics;
