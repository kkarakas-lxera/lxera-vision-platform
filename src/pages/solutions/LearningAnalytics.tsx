
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnalyticsDashboardPreview from "@/components/AnalyticsDashboardPreview";
import FeatureComparisonTable from "@/components/FeatureComparisonTable";
import IndustryUseCases from "@/components/IndustryUseCases";
import { BarChart3, Brain, TrendingUp, Eye, Activity, Compass, RefreshCw, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const LearningAnalytics = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const MetricsSection = () => (
    <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
          Proven Results
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">75%</div>
            <p className="text-business-black/70">Faster issue identification</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">89%</div>
            <p className="text-business-black/70">Accuracy in predicting frustration</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
            <p className="text-business-black/70">Increase in completion rates</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-business-black/70">Accuracy predicting at-risk learners</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Understand engagement and performance in real time to improve outcomes with intelligent learning data."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data, enterprise learning"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-future-green/20 text-business-black border-future-green/30 px-4 py-2 text-sm font-medium rounded-full">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data-Driven Learning
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight">
            Learning Analytics &
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Insights</span>
          </h1>
          
          <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Understand engagement and performance in real time to improve outcomes with intelligent learning data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              aria-label="Request a demo of learning analytics features"
            >
              Request a Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
              aria-label="See how learning analytics works"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <MetricsSection />

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            Knowing who clicked isn't enough.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            Traditional learning platforms tell you who completed a course. LXERA helps you understand how they engaged, what they felt, and when they needed help. Data should do more than measure—it should guide decisions.
          </p>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-6 lg:px-12">
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

      {/* How LXERA Helps */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Turn data into action, instantly.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const isExpanded = expandedSection === `feature-${index}`;
              
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group rounded-3xl">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-business-black/80 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <Badge className="bg-business-black/10 text-business-black text-xs px-2 py-1 rounded-full">
                      {feature.metric}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 leading-relaxed text-center mb-4">
                      {feature.description}
                    </CardDescription>
                    
                    <button
                      onClick={() => toggleSection(`feature-${index}`)}
                      className="w-full flex items-center justify-center text-business-black/70 hover:text-business-black text-sm font-medium transition-colors"
                      aria-expanded={isExpanded}
                      aria-controls={`feature-details-${index}`}
                    >
                      {isExpanded ? 'Less details' : 'More details'}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div id={`feature-details-${index}`} className="mt-4 p-4 bg-gray-50 rounded-3xl">
                        <p className="text-sm text-business-black/70 leading-relaxed">
                          {feature.details}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
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

      {/* Industry Use Cases */}
      <section className="py-20 px-6 lg:px-12">
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

      {/* What You Gain Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            Clear visibility. Smarter decisions.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            LXERA equips L&D teams and managers with insights that go far beyond completion rates. You'll know who's engaged, who's thriving, and where to focus your attention—before issues arise.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-12 shadow-2xl border border-green-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
              Unlock deeper learning with smarter insights.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Get a Demo
              </Button>
              <Button
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-green-600 hover:border-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Explore Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearningAnalytics;
