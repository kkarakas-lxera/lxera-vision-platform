import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { ArrowRight, Gamepad2, Trophy, Target, Zap, Star, Users, BarChart3, Brain, Sparkles, Award, TrendingUp } from "lucide-react";

const AIGamificationMotivation = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const gamificationFeatures = [
    {
      id: "dynamic-rewards",
      title: "Dynamic Reward Systems",
      description: "AI-powered reward mechanisms that adapt to individual preferences and learning styles",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      details: [
        "Personalized achievement badges and certificates",
        "Adaptive point systems based on effort and progress",
        "Custom reward pathways for different learning styles",
        "Real-time recognition for micro-achievements"
      ]
    },
    {
      id: "intelligent-challenges",
      title: "Intelligent Challenges",
      description: "AI creates personalized challenges that maintain optimal difficulty and engagement",
      icon: Target,
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      details: [
        "Adaptive difficulty adjustment based on performance",
        "Personalized challenge types matching learning preferences",
        "Progressive skill-building challenges",
        "Team-based collaborative challenges"
      ]
    },
    {
      id: "progress-gamification",
      title: "Progress Gamification",
      description: "Transform learning journeys into engaging adventures with clear progression paths",
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      details: [
        "Visual progress maps and learning paths",
        "Level-based progression systems",
        "Milestone celebrations and achievements",
        "Progress streaks and consistency rewards"
      ]
    },
    {
      id: "social-engagement",
      title: "Social Engagement",
      description: "Foster community and collaboration through social gamification elements",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      details: [
        "Team leaderboards and competitions",
        "Peer recognition and kudos systems",
        "Collaborative learning challenges",
        "Social sharing of achievements"
      ]
    },
    {
      id: "ai-motivation",
      title: "AI-Powered Motivation",
      description: "Intelligent motivation systems that understand and respond to individual needs",
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      details: [
        "Personalized motivational messages and reminders",
        "Predictive intervention for engagement drops",
        "Customized goal-setting and tracking",
        "Adaptive feedback and encouragement"
      ]
    },
    {
      id: "performance-analytics",
      title: "Engagement Analytics",
      description: "Deep insights into engagement patterns and motivation drivers",
      icon: BarChart3,
      color: "from-emerald-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-cyan-50",
      details: [
        "Real-time engagement monitoring",
        "Motivation pattern analysis",
        "Gamification effectiveness metrics",
        "Personalized improvement recommendations"
      ]
    }
  ];

  const benefits = [
    {
      title: "Increased Engagement",
      description: "Boost learning engagement by up to 90% through personalized gamification",
      icon: Zap,
      stat: "90%"
    },
    {
      title: "Higher Completion Rates",
      description: "Achieve 85% higher course completion rates with motivational AI",
      icon: Trophy,
      stat: "85%"
    },
    {
      title: "Improved Retention",
      description: "Enhance knowledge retention by 75% through engaging experiences",
      icon: Brain,
      stat: "75%"
    },
    {
      title: "Better Performance",
      description: "See 60% improvement in learning outcomes and skill development",
      icon: TrendingUp,
      stat: "60%"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-6 bg-orange-100 text-orange-800 border-orange-200 px-4 py-2 text-sm font-medium rounded-full">
              AI Gamification & Motivation
            </Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
              Boost Engagement with
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> AI-Powered Gamification</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
              Transform learning into an engaging adventure. Our AI-driven gamification system creates 
              personalized challenges, dynamic rewards, and intelligent motivation that keeps learners 
              engaged and achieving their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Try Interactive Demo
                <Gamepad2 className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                Schedule Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-orange-100 via-red-50 to-pink-100 rounded-3xl p-12 shadow-2xl animate-fade-in-scale">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-business-black mb-2 font-inter">Dynamic Rewards</h3>
                  <p className="text-sm text-business-black/70 font-inter">Personalized achievement systems</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-business-black mb-2 font-inter">Smart Challenges</h3>
                  <p className="text-sm text-business-black/70 font-inter">AI-adaptive difficulty levels</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-business-black mb-2 font-inter">Progress Tracking</h3>
                  <p className="text-sm text-business-black/70 font-inter">Visual learning journeys</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-business-black mb-2 font-inter">Social Elements</h3>
                  <p className="text-sm text-business-black/70 font-inter">Team collaboration & competition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Gamification Features"
            subtitle="Discover how our AI-powered gamification system creates engaging, personalized learning experiences that motivate and inspire continuous growth."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gamificationFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${feature.bgColor} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-orange-600 transition-colors duration-300 font-inter">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/70 leading-relaxed font-inter">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-sm text-business-black/80 font-inter">
                          <Star className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="ghost"
                      className={`w-full group-hover:bg-gradient-to-r ${feature.color} group-hover:text-white transition-all duration-300 font-medium font-inter`}
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

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Proven Results"
            subtitle="See the measurable impact of AI-powered gamification on learning engagement, completion rates, and overall performance."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className="text-center bg-white/70 backdrop-blur-sm border-orange-100 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-orange-600 mb-2 font-inter">{benefit.stat}</div>
                    <h3 className="text-lg font-semibold text-business-black mb-3 font-inter">{benefit.title}</h3>
                    <p className="text-business-black/70 text-sm leading-relaxed font-inter">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="How AI Gamification Works"
            subtitle="Our intelligent system analyzes learner behavior and preferences to create personalized gamification experiences that drive engagement and motivation."
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-business-black mb-4 font-inter">Analyze & Understand</h3>
              <p className="text-business-black/70 leading-relaxed font-inter">
                AI analyzes learning patterns, preferences, and engagement levels to understand what motivates each individual learner.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-business-black mb-4 font-inter">Personalize & Adapt</h3>
              <p className="text-business-black/70 leading-relaxed font-inter">
                Creates personalized challenges, rewards, and motivational elements that adapt in real-time based on learner response and progress.
              </p>
            </div>
            
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-business-black mb-4 font-inter">Engage & Motivate</h3>
              <p className="text-business-black/70 leading-relaxed font-inter">
                Delivers engaging experiences through dynamic rewards, intelligent challenges, and continuous motivation to drive learning success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-3xl p-12 shadow-2xl animate-fade-in-scale">
            <Gamepad2 className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6 font-inter">
              Ready to Gamify Your Learning Experience?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto font-inter">
              Transform your learning programs with AI-powered gamification that boosts engagement, 
              increases completion rates, and drives measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white font-inter"
              >
                Start Free Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl font-inter"
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIGamificationMotivation;
