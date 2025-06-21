
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Users, BarChart3, Target, Zap, Eye, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const AIEngine = () => {
  const aiCapabilities = [
    {
      title: "Learner Profiling",
      description: "Deep understanding of individual learning patterns, preferences, and goals",
      icon: Users,
      features: [
        "Behavioral pattern analysis",
        "Learning style identification", 
        "Skill gap assessment",
        "Motivation profiling"
      ]
    },
    {
      title: "Behavioral Analysis",
      description: "Real-time monitoring and prediction of learner engagement and outcomes",
      icon: Eye,
      features: [
        "Engagement tracking",
        "Performance prediction",
        "Risk identification",
        "Intervention triggers"
      ]
    },
    {
      title: "Motivation Modeling",
      description: "Understanding what drives each learner to optimize their experience",
      icon: Zap,
      features: [
        "Intrinsic motivation mapping",
        "Reward system optimization",
        "Challenge level calibration",
        "Achievement recognition"
      ]
    },
    {
      title: "Adaptive Decisions",
      description: "Intelligent content and pathway adjustments based on real-time data",
      icon: Brain,
      features: [
        "Dynamic content curation",
        "Pathway optimization",
        "Difficulty adjustment",
        "Timing recommendations"
      ]
    }
  ];

  const solutions = [
    {
      title: "Skill Gap Detection",
      description: "Automatically identify and address competency gaps across teams",
      impact: "85% faster skill assessment"
    },
    {
      title: "Learning Style Adaptation", 
      description: "Personalize content delivery to match individual preferences",
      impact: "60% higher engagement"
    },
    {
      title: "Performance Prediction",
      description: "Forecast learner outcomes and proactively intervene",
      impact: "40% improvement in completion rates"
    },
    {
      title: "Content Optimization",
      description: "Continuously improve learning materials based on effectiveness data",
      impact: "50% reduction in learning time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Intelligent Platform Core
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-business-black mb-6">
            AI
            <span className="text-business-black"> Engine</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            The intelligent heart of LXERA that powers personalization, predicts outcomes, 
            and drives engagement through advanced machine learning and behavioral analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              See AI in Action
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Technical Overview
            </Button>
          </div>
        </div>
      </section>

      {/* AI Capabilities Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Four Pillars of Intelligence
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Our AI engine combines multiple sophisticated models to create truly personalized experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiCapabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Sparkles className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {capability.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-3 flex-shrink-0" />
                          {feature}
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

      {/* Solutions Powered Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Solutions Powered by AI
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              See how our AI engine drives measurable improvements across key learning scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {solution.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {solution.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs Preview */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Enterprise-Grade AI Architecture
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Built for scale, security, and continuous learning
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">99.9%</div>
                <div className="text-sm text-white/70">Uptime Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">&lt; 100ms</div>
                <div className="text-sm text-white/70">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">Learning & Adapting</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-business-black mb-6">
            Experience the Power of AI-Driven Learning
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            See how our AI engine can transform learning outcomes in your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Request AI Demo
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/engagement-insights">
                Explore Insights <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIEngine;
