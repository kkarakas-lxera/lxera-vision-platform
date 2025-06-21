
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, TrendingUp, Users, Brain, Target, ArrowRight, Activity, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const EngagementInsights = () => {
  const dashboardFeatures = [
    {
      title: "Real-time Engagement Tracking",
      description: "Monitor learner activity, session duration, and interaction patterns as they happen",
      icon: Activity,
      metrics: ["Active sessions", "Time on task", "Click-through rates", "Completion velocity"]
    },
    {
      title: "Predictive Outcome Analytics",
      description: "AI-powered forecasting of learner success and potential intervention points",
      icon: TrendingUp,
      metrics: ["Success probability", "Risk indicators", "Performance trends", "Completion forecasts"]
    },
    {
      title: "Emotional Analytics",
      description: "Understanding learner sentiment and motivation through behavioral cues",
      icon: Brain,
      metrics: ["Engagement levels", "Frustration indicators", "Motivation patterns", "Satisfaction scores"]
    },
    {
      title: "Multi-level Dashboards",
      description: "Tailored views for learners, managers, and administrators with relevant insights",
      icon: Users,
      metrics: ["Personal progress", "Team performance", "Organizational impact", "Strategic alignment"]
    }
  ];

  const insights = [
    {
      title: "Learning Path Optimization",
      description: "Identify most effective content sequences and learning pathways",
      impact: "35% improvement in completion rates"
    },
    {
      title: "Early Warning System",
      description: "Proactive identification of at-risk learners before they disengage",
      impact: "60% reduction in dropout rates"
    },
    {
      title: "Content Performance",
      description: "Measure which materials drive the highest engagement and learning outcomes",
      impact: "50% increase in content effectiveness"
    },
    {
      title: "ROI Measurement",
      description: "Track learning investment returns through performance and business metrics",
      impact: "Quantifiable business impact"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/10 px-4 py-2 rounded-full text-future-green font-medium text-sm mb-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data-Driven Learning
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-business-black mb-6">
            Engagement &
            <span className="text-future-green"> Insights</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Transform learning data into actionable insights with real-time analytics, 
            predictive outcomes, and comprehensive dashboards that drive smarter decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-future-green text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              View Demo Dashboard
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Analytics Overview
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Visual Dashboards That Drive Decisions
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Comprehensive analytics suite providing insights at every level of your organization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {dashboardFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-emerald/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-future-green" />
                      </div>
                      <Eye className="w-5 h-5 text-future-green/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-future-green transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="text-sm text-business-black/70 bg-smart-beige/30 rounded-lg px-3 py-2">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Insights Impact */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Actionable Insights That Drive Results
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              See how data-driven decisions transform learning outcomes and business impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {insights.map((insight, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {insight.title}
                    </CardTitle>
                    <div className="bg-future-green/10 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-future-green">
                        {insight.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {insight.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-business-black mb-6">
            Turn Learning Data Into Strategic Advantage
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Discover insights that transform how your organization approaches learning and development
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-future-green text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Explore Analytics
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/innovation-hub">
                Innovation Hub <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EngagementInsights;
