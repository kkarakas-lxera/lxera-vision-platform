
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OptimizedImage from "@/components/OptimizedImage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, Target, Rocket, Users, Brain, TrendingUp, Zap, CheckCircle, ArrowRight, Lightbulb, Sparkles, Code, Cpu, Database } from "lucide-react";

const SuccessStories = () => {
  const heroStats = [
    { value: "65%", label: "Faster onboarding", icon: TrendingUp },
    { value: "92%", label: "AI accuracy rate", icon: Target },
    { value: "3min", label: "Path generation", icon: Zap },
    { value: "100%", label: "User satisfaction", icon: CheckCircle }
  ];

  const storyCategories = [
    {
      title: "AI-Powered Pilot Insights",
      icon: Brain,
      gradient: "from-blue-500 via-indigo-500 to-purple-600",
      bgColor: "bg-blue-50",
      decorativeIcons: [Code, Cpu, Database],
      stories: [
        {
          title: "AI-Driven Validation Success",
          description: "Our advanced AI engine identified skill gaps and generated hyper-personalized learning paths in under 3 minutes during closed pilot testing with 5 forward-thinking early adopters.",
          metric: "3min avg generation",
          tag: "AI-Validated",
          tagColor: "bg-blue-100 text-blue-800"
        },
        {
          title: "Machine Learning Breakthrough",
          description: "Revolutionary AI accuracy achieved: 92% learner intent detection after just 3 interactions, powered by our proprietary deep learning algorithms.",
          metric: "92% accuracy rate",
          tag: "ML-Powered",
          tagColor: "bg-blue-100 text-blue-800"
        }
      ]
    },
    {
      title: "Future Innovation Vision",
      icon: Rocket,
      gradient: "from-purple-500 via-pink-500 to-red-500",
      bgColor: "bg-purple-50",
      decorativeIcons: [Sparkles, Zap, Lightbulb],
      stories: [
        {
          title: "Digital Transformation Revolution",
          description: "Envision: 120 frontline retail employees become citizen innovators through LXERA's AI-guided innovation studio—creating groundbreaking solutions without writing a single line of code.",
          metric: "120 innovators empowered",
          tag: "Future Vision",
          tagColor: "bg-purple-100 text-purple-800"
        },
        {
          title: "Smart Manufacturing Evolution",
          description: "Tomorrow's factory: 200+ floor workers evolve into digital innovation catalysts, mastering next-gen skills and generating 15 breakthrough process improvements.",
          metric: "15 innovations born",
          tag: "Industry 4.0",
          tagColor: "bg-purple-100 text-purple-800"
        }
      ]
    },
    {
      title: "Collaborative Innovation Lab",
      icon: Users,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgColor: "bg-emerald-50",
      decorativeIcons: [Target, CheckCircle, TrendingUp],
      stories: [
        {
          title: "Cross-Industry AI Co-Creation",
          description: "Pioneering collaboration: We co-engineered our AI onboarding model with digital innovation experts across 3 cutting-edge industries, achieving unprecedented 92% accuracy.",
          metric: "3 industries disrupted",
          tag: "Co-Innovation",
          tagColor: "bg-emerald-100 text-emerald-800"
        },
        {
          title: "Next-Gen Advisory Innovation",
          description: "Working with visionary L&D leaders, we revolutionized mentorship algorithms to deliver contextually intelligent guidance that adapts to individual innovation styles.",
          metric: "Intelligent mentorship",
          tag: "AI-Guided",
          tagColor: "bg-emerald-100 text-emerald-800"
        }
      ]
    },
    {
      title: "Innovation Catalyst Stories",
      icon: Sparkles,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgColor: "bg-amber-50",
      decorativeIcons: [Rocket, Brain, Code],
      stories: [
        {
          title: "Internal Innovation Sprint",
          description: "Innovation in action: Our product team leveraged LXERA's learning engine to master prompt engineering and build a next-generation AI onboarding agent—in just 2 weeks.",
          metric: "2 weeks to breakthrough",
          tag: "Innovation Sprint",
          tagColor: "bg-amber-100 text-amber-800"
        },
        {
          title: "No-Code Innovation Lab",
          description: "Democratizing innovation: Non-technical team members built two AI-powered microtools for advanced customer feedback analysis—zero coding experience required.",
          metric: "2 AI tools created",
          tag: "Citizen Innovation",
          tagColor: "bg-amber-100 text-amber-800"
        }
      ]
    }
  ];

  const testimonials = [
    {
      quote: "The AI's ability to understand learning needs was revolutionary—even in the pilot phase. It felt like the platform could read minds and predict innovation potential.",
      author: "Sarah M.",
      role: "Innovation Lead",
      company: "Manufacturing Partner",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c593?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "We built breakthrough tools we never imagined possible without our technical team. LXERA made citizen innovation not just accessible, but transformative.",
      author: "Michael R.",
      role: "Digital Innovation Director",
      company: "LXERA Internal",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The personalization wasn't just smart—it was intuitive and forward-thinking. Like having an AI mentor who understood exactly what breakthrough I needed next.",
      author: "Dr. Emma T.",
      role: "Learning Innovation Specialist",
      company: "Industry Expert",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige/50 via-white to-business-black/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-future-green rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-emerald rounded-full animate-bounce opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-future-green/20 rounded-full animate-float opacity-20" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-emerald rounded-full animate-pulse opacity-50" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-future-green/30 rounded-full animate-bounce opacity-30" style={{animationDelay: '4s'}}></div>
      </div>

      <Navigation />
      
      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-business-black/5 via-transparent to-future-green/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(122,229,198,0.1)_0%,transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-future-green/20 to-emerald/20 backdrop-blur-sm rounded-full px-6 py-2 border border-future-green/30">
                <Sparkles className="w-4 h-4 text-future-green animate-pulse" />
                <span className="text-business-black text-sm font-medium">Innovation Results & Future Vision</span>
                <Rocket className="w-4 h-4 text-emerald animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-8 font-inter leading-tight">
              Innovation <span className="bg-gradient-to-r from-future-green via-emerald to-teal-500 bg-clip-text text-transparent animate-shimmer">Success</span> Stories
            </h1>
            
            <p className="text-xl lg:text-2xl text-business-black/70 mb-12 max-w-4xl mx-auto font-inter leading-relaxed">
              Breakthrough results from AI-powered pilots, innovation breakthroughs, and the future we're engineering together
            </p>
          </div>

          {/* Enhanced Hero Stats with Innovation Theme */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {heroStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-future-green/30 rounded-full animate-pulse"></div>
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-future-green to-emerald rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                      <IconComponent className="w-6 h-6 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 rounded-2xl"></div>
                    </div>
                    
                    <div className="text-3xl font-bold text-business-black mb-2 font-inter group-hover:text-emerald transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm text-business-black/60 font-inter">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Story Categories */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {storyCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="mb-20">
                {/* Enhanced Category Header */}
                <div className="flex items-center mb-12 relative">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-3xl flex items-center justify-center mr-6 shadow-lg relative overflow-hidden group`}>
                    <IconComponent className="w-8 h-8 text-white relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-business-black font-inter mb-2">{category.title}</h2>
                    <div className="flex items-center gap-2">
                      <div className={`w-24 h-1 bg-gradient-to-r ${category.gradient} rounded-full`}></div>
                      <div className="flex gap-1">
                        {category.decorativeIcons.map((DecorIcon, idx) => (
                          <DecorIcon key={idx} className="w-3 h-3 text-business-black/30 animate-pulse" style={{animationDelay: `${idx * 0.5}s`}} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Stories Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {category.stories.map((story, storyIndex) => (
                    <Card key={storyIndex} className="group hover:shadow-2xl transition-all duration-500 hover:scale-102 border-0 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                      <div className={`h-2 bg-gradient-to-r ${category.gradient} relative`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                      
                      {/* Floating Innovation Indicators */}
                      <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-2 h-2 bg-future-green/40 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-emerald/60 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                      </div>
                      
                      <CardHeader className="pb-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className={`${story.tagColor} border-0 px-3 py-1 relative overflow-hidden`}>
                            <span className="relative z-10">{story.tag}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </Badge>
                          <div className="text-sm font-semibold text-business-black/60 bg-gradient-to-r from-gray-50 to-future-green/10 px-3 py-1 rounded-full border border-future-green/20">
                            {story.metric}
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-business-black font-inter mb-3 group-hover:text-emerald transition-colors duration-300">
                          {story.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-business-black/70 font-inter text-lg leading-relaxed mb-6">
                          {story.description}
                        </CardDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-emerald group-hover:text-business-black transition-colors duration-300">
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                            <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                            <span className="font-semibold">Explore Innovation</span>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-future-green/20 to-emerald/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Rocket className="w-4 h-4 text-emerald" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-gray-50 to-smart-beige/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(122,229,198,0.1)_0%,transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Badge className="bg-business-black text-white px-6 py-2 relative overflow-hidden">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                <span>Innovation Voices</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              </Badge>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6 font-inter">
              What Innovation <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">Leaders</span> Say
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto font-inter">
              Real insights from pioneers, early adopters, and innovation catalysts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-future-green to-emerald"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-future-green/30 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="pb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Quote className="w-10 h-10 text-future-green/30 animate-pulse" />
                    <div className="flex gap-1">
                      <Sparkles className="w-4 h-4 text-emerald/40 animate-bounce" />
                      <Brain className="w-4 h-4 text-future-green/40 animate-pulse" style={{animationDelay: '0.5s'}} />
                    </div>
                  </div>
                  <CardDescription className="text-business-black/80 font-inter text-lg leading-relaxed italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-future-green/20"
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-future-green to-emerald rounded-full flex items-center justify-center">
                        <Rocket className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-business-black font-inter flex items-center gap-2">
                        {testimonial.author}
                        <Sparkles className="w-3 h-3 text-future-green animate-pulse" />
                      </div>
                      <div className="text-sm text-business-black/60 font-inter font-medium">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-business-black/50 font-inter">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-business-black via-business-black/95 to-business-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        {/* Floating Innovation Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-3 h-3 bg-future-green/20 rounded-full animate-float"></div>
          <div className="absolute bottom-32 right-20 w-2 h-2 bg-emerald/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-future-green/40 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-future-green to-emerald rounded-full flex items-center justify-center animate-pulse relative overflow-hidden">
                <Lightbulb className="w-8 h-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-inter">
              Be Part of the Next <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">Innovation</span> Breakthrough
            </h2>
            <p className="text-xl text-white/80 mb-12 font-inter max-w-3xl mx-auto leading-relaxed">
              Join our innovation pilot program and help engineer the future of learning and transformation. 
              Experience firsthand what makes LXERA the catalyst for breakthrough innovation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="bg-gradient-to-r from-future-green to-emerald text-business-black hover:from-emerald hover:to-teal-500 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-semibold relative overflow-hidden group">
              <span className="relative z-10 flex items-center">
                <Rocket className="w-5 h-5 mr-2 animate-bounce" />
                Request Innovation Access
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            
            <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-business-black px-8 py-4 rounded-xl text-lg font-semibold group transition-all duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5 mr-2 group-hover:text-future-green transition-colors duration-300" />
              Schedule Innovation Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
