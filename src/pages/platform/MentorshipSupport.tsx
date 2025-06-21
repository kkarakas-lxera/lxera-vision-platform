import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Clock, Brain, ArrowRight, Zap, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const MentorshipSupport = () => {
  const supportFeatures = [
    {
      title: "AI Chat Support",
      description: "Intelligent 24/7 assistance that understands context and provides personalized guidance",
      icon: Brain,
      benefits: ["Instant responses", "Context awareness", "Learning continuity", "Personalized help"]
    },
    {
      title: "Mentor Matching Logic",
      description: "Smart algorithms that connect learners with the most suitable mentors based on multiple factors",
      icon: Users,
      benefits: ["Skill alignment", "Personality matching", "Goal compatibility", "Availability sync"]
    },
    {
      title: "Live Chat & Video",
      description: "Real-time communication tools for immediate support and face-to-face interactions",
      icon: MessageCircle,
      benefits: ["Real-time help", "Video sessions", "Screen sharing", "Group discussions"]
    },
    {
      title: "24/7 Availability",
      description: "Round-the-clock support ensuring learners never feel stuck or abandoned",
      icon: Clock,
      benefits: ["Always available", "Global time zones", "Instant escalation", "Emergency support"]
    }
  ];

  const scalabilityFeatures = [
    {
      title: "Automated Triage",
      description: "Smart routing of support requests to the most appropriate resource",
      impact: "90% faster response times"
    },
    {
      title: "Knowledge Base Integration",
      description: "AI-powered search and suggestions from comprehensive learning resources",
      impact: "75% self-service resolution"
    },
    {
      title: "Peer Learning Networks",
      description: "Facilitated connections between learners with complementary skills and needs",
      impact: "3x increase in peer collaboration"
    },
    {
      title: "Expert Pool Management",
      description: "Efficient allocation of subject matter experts across multiple learners and topics",
      impact: "5x improvement in expert utilization"
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
            Always-On Support
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Mentorship &
            <span className="text-business-black"> Support Tools</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Scalable, personalized support that ensures no learner is ever alone on their journey. 
            From AI-powered guidance to expert mentorship, help is always available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Experience Support Tools
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Support Overview
            </Button>
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Comprehensive Support Ecosystem
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Multiple layers of support ensure learners get the right help at the right time
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

      {/* Scalability Focus */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Built for Scale and Personalization
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Advanced systems that maintain personal touch while supporting thousands of learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scalabilityFeatures.map((feature, index) => (
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

      {/* Support Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Support That Never Sleeps
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Committed to learner success around the clock
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">&lt; 30sec</div>
                <div className="text-sm text-white/70">Average AI Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">95%</div>
                <div className="text-sm text-white/70">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">Global Availability</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Never Leave Learners Behind
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Discover how comprehensive support transforms learning outcomes and learner satisfaction
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Try Support Tools
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/security-privacy">
                Security & Privacy <ArrowRight className="w-4 h-4 ml-2" />
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
