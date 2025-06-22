import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, Brain, Users, Lightbulb, BarChart3, MessageCircle, Building2, Gamepad2 } from "lucide-react";

const Solutions = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // Reordered useCases array
  const useCases = [
    {
      id: "ai-personalized-learning",
      title: "AI-Personalized Learning",
      description: "Adaptive learning experiences that adjust to each individual's pace, style, and goals",
      icon: Brain,
      features: ["Adaptive Content Delivery", "Learning Path Optimization", "Real-time Difficulty Adjustment"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      id: "workforce-reskilling",
      title: "Workforce Reskilling & Upskilling",
      description: "Future-proof your workforce with targeted skill development programs",
      icon: Users,
      features: ["Skills Gap Analysis", "Career Pathway Mapping", "Progress Tracking"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      id: "ai-gamification",
      title: "AI Gamification & Motivation",
      description: "Boost engagement with dynamic rewards and intelligent challenges",
      icon: Gamepad2,
      features: ["Dynamic Reward Systems", "Intelligent Challenges", "Progress Gamification"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      id: "ai-mentorship",
      title: "AI Mentorship & Support",
      description: "Real-time guidance to keep learners engaged and on track",
      icon: MessageCircle,
      features: ["24/7 AI Support", "Personalized Mentorship", "Instant Feedback"],
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50"
    },
    {
      id: "learning-analytics",
      title: "Learning Analytics & Engagement Insights",
      description: "Data-driven insights to optimize learning outcomes and engagement",
      icon: BarChart3,
      features: ["Performance Analytics", "Engagement Metrics", "Predictive Insights"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      id: "citizen-innovation",
      title: "Citizen Developer Enablement",
      description: "Empower business users to build and automate without coding",
      icon: Lightbulb,
      features: ["No-Code Tools", "Automation Workflows", "Self-Service Development"],
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50"
    },
    {
      id: "enterprise-innovation",
      title: "Enterprise Innovation Enablement",
      description: "Transform your organization's innovation capabilities and culture",
      icon: Building2,
      features: ["Innovation Frameworks", "Collaboration Tools", "ROI Measurement"],
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-future-green/20 text-business-black border-future-green/30 px-4 py-2 text-sm font-medium rounded-full">
              Solutions Portfolio
            </Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight">
              Transform Learning with
              <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent"> AI-Powered Solutions</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive suite of AI-driven solutions designed to revolutionize learning, 
              development, and innovation across organizations and communities.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card
                  key={useCase.id}
                  className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${useCase.bgColor} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setActiveCard(useCase.id)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-emerald transition-colors duration-300">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/70 leading-relaxed">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {useCase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-business-black/80">
                          <div className="w-2 h-2 bg-future-green rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="ghost"
                      className={`w-full group-hover:bg-gradient-to-r ${useCase.color} group-hover:text-white transition-all duration-300 font-medium`}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-3xl p-12 shadow-2xl animate-fade-in-scale">
            <h2 className="lxera-section-title text-white mb-6">
              Ready to Transform Your Organization?
            </h2>
            <p className="lxera-body-large text-white/90 mb-8 max-w-2xl mx-auto">
              Discover how our AI-powered solutions can revolutionize learning and innovation 
              in your organization. Let's build the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
              >
                Schedule Strategic Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-orange-600 hover:border-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
              >
                Request Executive Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
