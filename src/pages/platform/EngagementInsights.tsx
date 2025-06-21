import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Brain, Target, ArrowRight, Activity, Zap, Eye, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const EngagementInsights = () => {
  const dashboardFeatures = [
    {
      title: "Executive Strategy Dashboard",
      description: "C-suite insights for enterprise transformation progress, strategic ROI measurement, and competitive advantage tracking",
      icon: TrendingUp,
      metrics: ["Strategic transformation ROI", "Enterprise capability growth", "Innovation pipeline health", "Competitive readiness scores"]
    },
    {
      title: "Predictive Business Analytics",
      description: "AI-powered forecasting of organizational transformation success, capability development outcomes, and business impact",
      icon: Brain,
      metrics: ["Success probability forecasts", "Strategic risk insights", "Capability development trends", "Business alignment metrics"]
    },
    {
      title: "Innovation Impact Tracking",
      description: "Monitor innovation initiatives, strategic transformation progress, and competitive advantage development",
      icon: Zap,
      metrics: ["Innovation project success", "Strategic maturity progress", "Competitive positioning", "Future readiness index"]
    },
    {
      title: "Enterprise Transformation Insights",
      description: "Comprehensive analytics on organizational development, strategic capabilities, and enterprise-wide transformation",
      icon: Users,
      metrics: ["Strategic capability progress", "Executive development ROI", "Organizational evolution", "Competitive advantage impact"]
    }
  ];

  const strategicInsights = [
    {
      title: "Strategic Investment Optimization",
      description: "Identify highest-impact capability investments and optimize resource allocation for maximum business value",
      impact: "4x improvement in strategic ROI"
    },
    {
      title: "Early Transformation Risk Detection",
      description: "Proactive identification of organizational transformation challenges before they impact strategic initiatives",
      impact: "70% reduction in transformation risks"
    },
    {
      title: "Innovation Capability Enhancement",
      description: "Measure and optimize organizational innovation capacity and strategic transformation readiness",
      impact: "60% faster innovation cycles"
    },
    {
      title: "Strategic Enterprise Planning",
      description: "Data-driven insights for future capability requirements and competitive advantage development",
      impact: "90% more accurate strategic forecasting"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-6 py-3 rounded-3xl text-business-black font-medium text-sm mb-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            Enterprise Intelligence & Analytics
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Strategic Insights &
            <span className="text-business-black"> Analytics Dashboard</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Transform organizational data into strategic intelligence. Executive-level analytics designed for organizational leaders driving measurable competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              View Executive Dashboard
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Strategic Analytics Overview
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Executive Intelligence Dashboards
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Strategic analytics suite providing actionable insights for enterprise transformation and competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {dashboardFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Eye className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="text-sm text-business-black/70 bg-future-green/10 rounded-lg px-3 py-2">
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

      {/* Strategic Insights Impact */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Intelligence That Drives Results
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              See how data-driven strategic decisions accelerate enterprise transformation and competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategicInsights.map((insight, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {insight.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
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

      {/* ROI Impact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Measurable Strategic Impact
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Real ROI metrics that matter to organizational leaders
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">340%</div>
                <div className="text-sm text-white/70">Average Strategic ROI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">75%</div>
                <div className="text-sm text-white/70">Faster Transformation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">90%</div>
                <div className="text-sm text-white/70">Strategic Alignment</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* C-Suite Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Built for Executive Decision-Making
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Strategic insights designed specifically for C-suite and senior leadership needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Strategic ROI Transparency",
                description: "Clear visibility into strategic investment returns and competitive advantage metrics"
              },
              {
                icon: Target,
                title: "Business Alignment", 
                description: "Ensure all transformation initiatives support broader organizational strategic goals"
              },
              {
                icon: TrendingUp,
                title: "Competitive Advantage",
                description: "Data-driven insights that create sustainable competitive differentiation"
              }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black mb-2">
                      {benefit.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Transform Strategic Decision-Making with Data
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Discover how strategic intelligence transforms enterprise transformation and competitive positioning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Schedule Executive Demo
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
