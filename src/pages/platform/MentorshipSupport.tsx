
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Clock, Brain, ArrowRight, Zap, Heart, CheckCircle, Bot, Target, Eye, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const MentorshipSupport = () => {
  const supportFeatures = [
    {
      title: "AI Behavior Monitoring",
      description: "Intelligent system that continuously monitors learner behavior and detects patterns indicating confusion or disengagement",
      icon: Eye,
      benefits: ["Real-time behavior analysis", "Stuck pattern detection", "Engagement monitoring", "Proactive intervention"]
    },
    {
      title: "Personalized AI Mentor",
      description: "Each learner gets a dedicated AI chatbot mentor, fine-tuned and trained on their learning data and company knowledge base",
      icon: Bot,
      benefits: ["One-to-one AI mentorship", "Personalized guidance", "Company-specific knowledge", "Adaptive learning support"]
    },
    {
      title: "Smart Intervention System",
      description: "AI automatically intervenes when learners get stuck, offering contextual help and support at the right moment",
      icon: Target,
      benefits: ["Automatic intervention", "Contextual assistance", "Timely support delivery", "Learning continuity"]
    },
    {
      title: "Knowledge Base Integration",
      description: "AI mentors are trained on your organization's knowledge base to provide relevant, company-specific guidance",
      icon: BookOpen,
      benefits: ["Company knowledge access", "Relevant content delivery", "Organizational alignment", "Custom guidance"]
    }
  ];

  const aiMentorshipFeatures = [
    {
      title: "Behavioral Pattern Recognition",
      description: "AI analyzes learning patterns to identify when learners are struggling or stuck",
      impact: "85% faster problem detection"
    },
    {
      title: "Personalized AI Chatbot",
      description: "Dedicated AI mentor for each learner, trained on their specific data and progress",
      impact: "3x more relevant guidance"
    },
    {
      title: "Company Knowledge Training",
      description: "AI mentors trained on organizational knowledge base for contextual support",
      impact: "90% more accurate responses"
    },
    {
      title: "Proactive Intervention",
      description: "AI automatically offers help when learners show signs of being stuck or confused",
      impact: "70% reduction in dropout rates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Heart className="w-4 h-4 mr-2" />
            AI-Powered Mentorship
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Mentorship &
            <span className="text-business-black"> Support Tools</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            AI that monitors learner behavior, detects when they're stuck, and provides personalized mentorship 
            through dedicated chatbot mentors trained on your company's knowledge base.
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

      {/* AI Mentorship Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              AI-Powered Mentorship Ecosystem
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Intelligent systems that understand learner behavior and provide personalized support when needed most
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {supportFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Zap className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-3 flex-shrink-0" />
                          {benefit}
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

      {/* How AI Mentorship Works */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Intelligent Mentorship at Scale
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Each learner receives a personalized AI mentor trained on their data and your company's knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiMentorshipFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {feature.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {feature.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Mentor Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                AI Mentorship That Never Sleeps
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Personalized AI mentors trained on your company's knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">AI Mentor Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">1:1</div>
                <div className="text-sm text-white/70">Personalized Mentorship</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">Smart</div>
                <div className="text-sm text-white/70">Behavioral Detection</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Give Every Learner Their Personal AI Mentor
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Discover how AI-powered mentorship transforms learning outcomes with personalized, intelligent support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Request a Demo
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/security-privacy">
                Talk to Our Experts <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentorshipSupport;
