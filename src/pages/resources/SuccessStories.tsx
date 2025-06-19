
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, Target, Rocket, Users, Brain, TrendingUp, Zap, CheckCircle, ArrowRight, Lightbulb } from "lucide-react";

const SuccessStories = () => {
  const heroStats = [
    { value: "65%", label: "Faster onboarding", icon: TrendingUp },
    { value: "92%", label: "AI accuracy rate", icon: Target },
    { value: "3min", label: "Path generation", icon: Zap },
    { value: "100%", label: "User satisfaction", icon: CheckCircle }
  ];

  const storyCategories = [
    {
      title: "Pilot Program Insights",
      icon: Target,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      stories: [
        {
          title: "Early Adopter Validation",
          description: "In a closed pilot with 5 early adopters, LXERA helped identify skill gaps and generate personalized learning paths in under 3 minutes using our AI engine.",
          metric: "3min avg generation",
          tag: "Validated",
          tagColor: "bg-blue-100 text-blue-800"
        },
        {
          title: "Rapid Learning Path Creation",
          description: "During internal testing, our AI engine achieved 92% accuracy in learner intent detection after just the first 3 interactions.",
          metric: "92% accuracy rate",
          tag: "Technical",
          tagColor: "bg-blue-100 text-blue-800"
        }
      ]
    },
    {
      title: "Future Impact Vision",
      icon: Rocket,
      gradient: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      stories: [
        {
          title: "The Retail Revolution",
          description: "Picture this: A mid-sized retail company enables 120 frontline employees to become citizen innovators through LXERA's AI-guided studio — all without a single line of code. Within 6 weeks, 3 internal tools are launched.",
          metric: "120 employees empowered",
          tag: "Future Impact",
          tagColor: "bg-purple-100 text-purple-800"
        },
        {
          title: "Manufacturing Transformation",
          description: "Imagine a manufacturing team where every worker becomes an innovation catalyst. Through LXERA's personalized engine, 200+ floor workers master digital skills and create 15 process improvements.",
          metric: "15 innovations created",
          tag: "Transformative",
          tagColor: "bg-purple-100 text-purple-800"
        }
      ]
    },
    {
      title: "Co-Creation Highlights",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      stories: [
        {
          title: "Cross-Industry Expert Collaboration",
          description: "We co-developed our AI onboarding model with input from digital learning experts across 3 industries. The result? A 92% accuracy in learner intent detection after the first 3 interactions.",
          metric: "3 industries consulted",
          tag: "Collaborative",
          tagColor: "bg-emerald-100 text-emerald-800"
        },
        {
          title: "Advisory Board Innovation",
          description: "Working with learning and development leaders, we refined our mentorship algorithms to provide contextually relevant guidance that adapts to individual learning styles and pace.",
          metric: "Real-world relevance",
          tag: "Expert-Driven",
          tagColor: "bg-emerald-100 text-emerald-800"
        }
      ]
    },
    {
      title: "Team Breakthrough Stories",
      icon: Brain,
      gradient: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      stories: [
        {
          title: "Walking the Talk",
          description: "Our own product team used LXERA's learning engine to reskill on prompt engineering and build a smarter onboarding AI agent — in just 2 weeks.",
          metric: "2 weeks to mastery",
          tag: "Proven",
          tagColor: "bg-amber-100 text-amber-800"
        },
        {
          title: "Innovation Lab Results",
          description: "Using our prototype studio, our non-technical team members built two AI-powered microtools for customer feedback analysis — with zero coding experience required.",
          metric: "2 tools built by non-tech team",
          tag: "Empowering",
          tagColor: "bg-amber-100 text-amber-800"
        }
      ]
    }
  ];

  const testimonials = [
    {
      quote: "The AI accuracy in identifying learning needs was unreal — even in the pilot. It felt like the platform knew me.",
      author: "Sarah M.",
      role: "Pilot Program Participant",
      company: "Manufacturing Partner",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c593?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "We built tools we never thought possible without our technical team. LXERA made citizen development actually accessible.",
      author: "Michael R.",
      role: "Team Lead",
      company: "LXERA Internal",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The personalization wasn't just smart — it was intuitive. Like having a mentor who understood exactly what I needed to learn next.",
      author: "Dr. Emma T.",
      role: "Learning Professional",
      company: "Industry Expert",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige/50 via-white to-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-business-black/5 via-transparent to-future-green/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-future-green/20 text-business-black border-0 px-6 py-2 text-sm">
              Early Results & Future Vision
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-8 font-inter leading-tight">
              Success <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">Stories</span>
            </h1>
            <p className="text-xl lg:text-2xl text-business-black/70 mb-12 max-w-4xl mx-auto font-inter leading-relaxed">
              Real results from pilot programs, internal breakthroughs, and the future we're building together
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {heroStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-future-green to-emerald rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-business-black mb-2 font-inter">
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

      {/* Story Categories */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {storyCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="mb-20">
                {/* Category Header */}
                <div className="flex items-center mb-12">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-3xl flex items-center justify-center mr-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-business-black font-inter mb-2">{category.title}</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-future-green to-emerald rounded-full"></div>
                  </div>
                </div>
                
                {/* Stories Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {category.stories.map((story, storyIndex) => (
                    <Card key={storyIndex} className="group hover:shadow-2xl transition-all duration-500 hover:scale-102 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${category.gradient}`}></div>
                      <CardHeader className="pb-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className={`${story.tagColor} border-0 px-3 py-1`}>
                            {story.tag}
                          </Badge>
                          <div className="text-sm font-semibold text-business-black/60 bg-gray-50 px-3 py-1 rounded-full">
                            {story.metric}
                          </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-business-black font-inter mb-3 group-hover:text-emerald transition-colors duration-300">
                          {story.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-business-black/70 font-inter text-lg leading-relaxed">
                          {story.description}
                        </CardDescription>
                        <div className="mt-6 flex items-center text-emerald group-hover:text-business-black transition-colors duration-300">
                          <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                          <span className="font-semibold">Learn more</span>
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

      {/* Testimonials */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-gray-50 to-smart-beige/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-business-black text-white px-6 py-2">
              Voices from Our Journey
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6 font-inter">
              What People Are <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">Saying</span>
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto font-inter">
              Real feedback from early users, partners, and our own team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-future-green to-emerald"></div>
                <CardHeader className="pb-6">
                  <Quote className="w-10 h-10 text-future-green/30 mb-4" />
                  <CardDescription className="text-business-black/80 font-inter text-lg leading-relaxed italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <div className="font-bold text-business-black font-inter">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-business-black/60 font-inter">
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

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-business-black via-business-black/95 to-business-black"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="mb-8">
            <Lightbulb className="w-16 h-16 text-future-green mx-auto mb-6" />
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-inter">
              Be Part of the Next <span className="text-future-green">Success Story</span>
            </h2>
            <p className="text-xl text-white/80 mb-12 font-inter max-w-3xl mx-auto leading-relaxed">
              Join our pilot program and help shape the future of learning and innovation. 
              Experience firsthand what makes LXERA different.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="bg-future-green text-business-black hover:bg-emerald px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-semibold">
              Request Pilot Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-business-black px-8 py-4 rounded-xl text-lg font-semibold">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
