import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { ArrowRight, Gamepad2, Trophy, Target, Zap, Star, Users, BarChart3, Brain, Sparkles, Award, TrendingUp, Play } from "lucide-react";

const AIGamificationMotivation = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

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
      color: "from-slate-600 to-gray-800",
      bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
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
      stat: "90%",
      color: "from-amber-400 to-yellow-500"
    },
    {
      title: "Higher Completion Rates",
      description: "Achieve 85% higher course completion rates with motivational AI",
      icon: Trophy,
      stat: "85%",
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Improved Retention",
      description: "Enhance knowledge retention by 75% through engaging experiences",
      icon: Brain,
      stat: "75%",
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Better Performance",
      description: "See 60% improvement in learning outcomes and skill development",
      icon: TrendingUp,
      stat: "60%",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-red-100/30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <Badge className="mb-8 bg-orange-100 text-orange-800 border-orange-200 px-6 py-3 text-base font-medium rounded-full shadow-sm">
              AI Gamification & Motivation
            </Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
              Boost Engagement with
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block mt-2"> AI-Powered Gamification</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-16 max-w-4xl mx-auto leading-relaxed font-inter">
              Transform learning into an engaging adventure. Our AI-driven gamification system creates 
              personalized challenges, dynamic rewards, and intelligent motivation that keeps learners 
              engaged and achieving their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 font-semibold px-12 py-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-semibold px-12 py-5 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Early Access
              </Button>
            </div>
          </div>

          {/* Enhanced Hero Visual - Now with Interactive Demo Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-orange-100 via-red-50 to-pink-100 rounded-3xl p-16 shadow-2xl animate-fade-in-scale border border-orange-200/50">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-semibold text-business-black mb-4 font-inter">Experience Gamification Elements</h3>
                <p className="text-business-black/70 font-inter">Interactive preview of our AI-powered gamification features</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-semibold text-business-black mb-3 font-inter group-hover:text-orange-600 transition-colors">Dynamic Rewards</h4>
                  <p className="text-sm text-business-black/70 font-inter">Personalized achievement systems</p>
                  <div className="mt-3 bg-orange-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full w-3/4 rounded-full transition-all duration-1000 group-hover:w-full"></div>
                  </div>
                </div>
                
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-semibold text-business-black mb-3 font-inter group-hover:text-blue-600 transition-colors">Smart Challenges</h4>
                  <p className="text-sm text-business-black/70 font-inter">AI-adaptive difficulty levels</p>
                  <div className="mt-3 bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-full w-2/3 rounded-full transition-all duration-1000 group-hover:w-full"></div>
                  </div>
                </div>
                
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-semibold text-business-black mb-3 font-inter group-hover:text-green-600 transition-colors">Progress Tracking</h4>
                  <p className="text-sm text-business-black/70 font-inter">Visual learning journeys</p>
                  <div className="mt-3 bg-green-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-teal-500 h-full w-4/5 rounded-full transition-all duration-1000 group-hover:w-full"></div>
                  </div>
                </div>
                
                <div className="text-center group cursor-pointer">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-semibold text-business-black mb-3 font-inter group-hover:text-pink-600 transition-colors">Social Elements</h4>
                  <p className="text-sm text-business-black/70 font-inter">Team collaboration & competition</p>
                  <div className="mt-3 bg-pink-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-400 to-rose-500 h-full w-1/2 rounded-full transition-all duration-1000 group-hover:w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Grid Layout */}
      <section className="py-24 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-8 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                Gamification Features
              </h2>
              <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 max-w-4xl mx-auto animate-slide-in-right leading-relaxed font-medium font-inter" style={{animationDelay: '0.4s'}}>
                Discover how our AI-powered gamification system creates engaging, personalized learning experiences that motivate and inspire continuous growth.
              </p>
              
              <div className="mt-12 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
                  <div className="absolute inset-0 w-40 h-1.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Varied Layout - First 3 in grid, next 3 in different arrangement */}
          <div className="space-y-16">
            {/* First Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {gamificationFeatures.slice(0, 3).map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${feature.bgColor} animate-fade-in-up relative overflow-hidden`}
                    style={{ animationDelay: `${index * 150}ms` }}
                    onMouseEnter={() => setActiveFeature(feature.id)}
                    onMouseLeave={() => setActiveFeature(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="pb-4 relative z-10">
                      <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                        <IconComponent className="w-9 h-9 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-business-black group-hover:text-orange-600 transition-colors duration-300 font-inter">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-business-black/70 leading-relaxed font-inter">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <ul className="space-y-3">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start text-sm text-business-black/80 font-inter">
                            <Star className="w-4 h-4 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Second Row - 2 Cards + 1 Featured */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  {gamificationFeatures.slice(3, 5).map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Card
                        key={feature.id}
                        className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${feature.bgColor} animate-fade-in-up relative overflow-hidden`}
                        style={{ animationDelay: `${(index + 3) * 150}ms` }}
                        onMouseEnter={() => setActiveFeature(feature.id)}
                        onMouseLeave={() => setActiveFeature(null)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="pb-4 relative z-10">
                          <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                            <IconComponent className="w-9 h-9 text-white" />
                          </div>
                          <CardTitle className="text-xl font-semibold text-business-black group-hover:text-orange-600 transition-colors duration-300 font-inter">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-business-black/70 leading-relaxed font-inter">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <ul className="space-y-3">
                            {feature.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start text-sm text-business-black/80 font-inter">
                                <Star className="w-4 h-4 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Featured Card */}
              <div className="lg:col-span-1">
                {(() => {
                  const feature = gamificationFeatures[5];
                  const IconComponent = feature.icon;
                  return (
                    <Card
                      key={feature.id}
                      className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 ${feature.bgColor} animate-fade-in-up relative overflow-hidden h-full`}
                      style={{ animationDelay: '750ms' }}
                      onMouseEnter={() => setActiveFeature(feature.id)}
                      onMouseLeave={() => setActiveFeature(null)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="pb-4 relative z-10">
                        <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                          <IconComponent className="w-9 h-9 text-white" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-business-black group-hover:text-orange-600 transition-colors duration-300 font-inter">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-business-black/70 leading-relaxed font-inter">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <ul className="space-y-3">
                          {feature.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-sm text-business-black/80 font-inter">
                              <Star className="w-4 h-4 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced with Interactive Elements */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-smart-beige to-orange-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-8 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                Proven Results
              </h2>
              <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 max-w-4xl mx-auto animate-slide-in-right leading-relaxed font-medium font-inter" style={{animationDelay: '0.4s'}}>
                See the measurable impact of AI-powered gamification on learning engagement, completion rates, and overall performance.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className={`text-center backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-500 animate-fade-in-up group cursor-pointer relative overflow-hidden ${
                    benefit.title === "Higher Completion Rates" 
                      ? "bg-gradient-to-br from-green-50 to-emerald-50/80 border-green-200/60 hover:border-green-300" 
                      : "bg-white/90 border-orange-100/80 hover:border-orange-200"
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setHoveredBenefit(index)}
                  onMouseLeave={() => setHoveredBenefit(null)}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    benefit.title === "Higher Completion Rates"
                      ? "bg-gradient-to-br from-green-100/60 to-emerald-100/40"
                      : "bg-gradient-to-br from-white/60 to-orange-50/40"
                  }`}></div>
                  <CardContent className="pt-10 pb-8 relative z-10">
                    <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-orange-600 mb-4 font-inter group-hover:scale-110 transition-transform duration-300">
                      {benefit.stat}
                    </div>
                    <h3 className="text-xl font-semibold text-business-black mb-4 font-inter group-hover:text-orange-600 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-business-black/70 text-sm leading-relaxed font-inter mb-6">
                      {benefit.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${benefit.color} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{ 
                          width: hoveredBenefit === index ? `${parseInt(benefit.stat)}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section - Single Column Layout for Variety */}
      <section className="py-24 px-6 lg:px-12 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24 animate-fade-in-up relative">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-8 animate-slide-in-left leading-tight font-inter" style={{animationDelay: '0.2s'}}>
                How AI Gamification Works
              </h2>
              <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 max-w-4xl mx-auto animate-slide-in-right leading-relaxed font-medium font-inter" style={{animationDelay: '0.4s'}}>
                Our intelligent system analyzes learner behavior and preferences to create personalized gamification experiences that drive engagement and motivation.
              </p>
              
              {/* Enhanced decorative line */}
              <div className="mt-8 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
                  <div className="absolute inset-0 w-40 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vertical Timeline Layout */}
          <div className="space-y-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="lg:w-1/2">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-xl">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-semibold text-business-black mb-6 font-inter text-center lg:text-left">Analyze & Understand</h3>
                <p className="text-business-black/70 leading-relaxed font-inter text-lg text-center lg:text-left">
                  AI analyzes learning patterns, preferences, and engagement levels to understand what motivates each individual learner.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-business-black/70 font-inter">Analyzing learning patterns...</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/70 rounded-lg p-3 text-sm text-business-black/80 font-inter">Learning Style: Visual Learner</div>
                    <div className="bg-white/70 rounded-lg p-3 text-sm text-business-black/80 font-inter">Engagement Peak: Morning Sessions</div>
                    <div className="bg-white/70 rounded-lg p-3 text-sm text-business-black/80 font-inter">Motivation Driver: Achievement Badges</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="lg:w-1/2">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-semibold text-business-black mb-6 font-inter text-center lg:text-left">Personalize & Adapt</h3>
                <p className="text-business-black/70 leading-relaxed font-inter text-lg text-center lg:text-left">
                  Creates personalized challenges, rewards, and motivational elements that adapt in real-time based on learner response and progress.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-lg p-4 text-center">
                      <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-xs text-business-black/80 font-inter">Custom Badge</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4 text-center">
                      <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-xs text-business-black/80 font-inter">Smart Challenge</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-xs text-business-black/80 font-inter">Achievement</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4 text-center">
                      <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-xs text-business-black/80 font-inter">Power-up</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="lg:w-1/2">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-xl">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-semibold text-business-black mb-6 font-inter text-center lg:text-left">Engage & Motivate</h3>
                <p className="text-business-black/70 leading-relaxed font-inter text-lg text-center lg:text-left">
                  Delivers engaging experiences through dynamic rewards, intelligent challenges, and continuous motivation to drive learning success.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/70 rounded-lg p-4">
                      <span className="text-sm text-business-black/80 font-inter">Course Progress</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">80%</span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">🎉</div>
                      <div className="text-sm text-business-black/80 font-inter">Milestone Achieved!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-3xl p-16 shadow-2xl animate-fade-in-scale relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <Gamepad2 className="w-20 h-20 text-white mx-auto mb-8" />
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
                Ready to Gamify Your Learning Experience?
              </h2>
              <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto font-inter leading-relaxed">
                Transform your learning programs with AI-powered gamification that boosts engagement, 
                increases completion rates, and drives measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold px-12 py-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white font-inter"
                >
                  Request a Demo
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-12 py-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl font-inter"
                >
                  Get Early Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIGamificationMotivation;
