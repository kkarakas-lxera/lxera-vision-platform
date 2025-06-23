
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Target, TrendingUp, Eye, Clock, Award, ArrowRight, CheckCircle } from "lucide-react";

const EngagementInsights = () => {
  const insightFeatures = [
    {
      title: "Real-Time Engagement Tracking",
      description: "Monitor learner engagement across all content and activities with live analytics",
      icon: Eye,
      features: ["Live activity monitoring", "Engagement heat maps", "Session duration tracking", "Interaction analytics"]
    },
    {
      title: "Learning Performance Analytics", 
      description: "Deep insights into learning effectiveness and knowledge retention patterns",
      icon: BarChart3,
      features: ["Comprehension scoring", "Retention analysis", "Skill progression", "Learning velocity"]
    },
    {
      title: "Team Collaboration Insights",
      description: "Understand how teams learn together and identify collaboration opportunities",
      icon: Users,
      features: ["Team dynamics", "Knowledge sharing patterns", "Collaboration metrics", "Peer learning analysis"]
    },
    {
      title: "Predictive Success Indicators",
      description: "AI-powered predictions to identify at-risk learners and success patterns",
      icon: Target,
      features: ["Success probability", "Risk identification", "Intervention recommendations", "Outcome prediction"]
    }
  ];

  const dashboardMetrics = [
    {
      name: "Engagement Rate",
      description: "Track overall learner engagement across all activities",
      icon: TrendingUp
    },
    {
      name: "Completion Rates",
      description: "Monitor course and module completion statistics",
      icon: Award
    },
    {
      name: "Time Investment",
      description: "Analyze learning time patterns and efficiency",
      icon: Clock
    },
    {
      name: "Knowledge Retention",
      description: "Measure long-term knowledge retention and application",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            Engagement & Insights
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Turn Learning Data Into
            <span className="text-business-black"> Actionable Insights</span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8">
            Advanced analytics and engagement tracking that help you understand, optimize, 
            and accelerate learning outcomes across your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Request a Demo
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Watch How It Works
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Comprehensive Learning Analytics
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Get deep insights into learning patterns, engagement levels, and performance outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {insightFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-future-green/10 rounded-xl flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-business-black" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Metrics */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Key Performance Metrics
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Track the metrics that matter most for learning success and organizational impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dashboardMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black">
                      {metric.name}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {metric.description}
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
            Start Measuring What Matters
          </h2>
          <p className="text-lg text-business-black/70 mb-8">
            Get actionable insights that drive better learning outcomes and business results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Request a Demo
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Talk to Our Experts
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EngagementInsights;
