
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote, Lightbulb, Users, Zap, Target, Rocket, TrendingUp, Brain, MessageCircle, Star } from "lucide-react";

const SuccessStories = () => {
  const storyCategories = [
    {
      title: "Pilot Program Insights",
      icon: Target,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      stories: [
        {
          title: "Early Adopter Validation",
          description: "In a closed pilot with 5 early adopters, LXERA helped identify skill gaps and generate personalized learning paths in under 3 minutes using our AI engine.",
          type: "Pilot Results",
          metrics: "3min avg. path generation",
          tag: "Validated"
        },
        {
          title: "Rapid Learning Path Creation",
          description: "During internal testing, our AI engine achieved 92% accuracy in learner intent detection after just the first 3 interactions.",
          type: "AI Performance",
          metrics: "92% accuracy rate",
          tag: "Technical"
        }
      ]
    },
    {
      title: "Future Impact Stories",
      icon: Rocket,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      stories: [
        {
          title: "The Retail Revolution",
          description: "Picture this: A mid-sized retail company enables 120 frontline employees to become citizen innovators through LXERA's AI-guided studio — all without a single line of code. Within 6 weeks, 3 internal tools are launched by the employees themselves.",
          type: "Vision Story",
          metrics: "120 employees empowered",
          tag: "Future Impact"
        },
        {
          title: "Manufacturing Transformation",
          description: "Imagine a manufacturing team where every worker becomes an innovation catalyst. Through LXERA's personalized learning engine, 200+ floor workers master digital skills and create 15 process improvements in their first quarter.",
          type: "What We're Building For",
          metrics: "15 innovations created",
          tag: "Transformative"
        }
      ]
    },
    {
      title: "Co-Creation Highlights",
      icon: Users,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      stories: [
        {
          title: "Cross-Industry Expert Collaboration",
          description: "We co-developed our AI onboarding model with input from digital learning experts across 3 industries. The result? A 92% accuracy in learner intent detection after the first 3 interactions.",
          type: "Expert Partnership",
          metrics: "3 industries consulted",
          tag: "Collaborative"
        },
        {
          title: "Advisory Board Innovation",
          description: "Working with learning and development leaders, we refined our mentorship algorithms to provide contextually relevant guidance that adapts to individual learning styles and pace.",
          type: "Advisory Input",
          metrics: "Real-world relevance",
          tag: "Expert-Driven"
        }
      ]
    },
    {
      title: "Team Breakthrough Stories",
      icon: Brain,
      color: "bg-gradient-to-br from-amber-100 to-yellow-100",
      iconColor: "text-amber-600",
      stories: [
        {
          title: "Walking the Talk",
          description: "Our own product team used LXERA's learning engine to reskill on prompt engineering and build a smarter onboarding AI agent — in just 2 weeks.",
          type: "Internal Success",
          metrics: "2 weeks to mastery",
          tag: "Proven"
        },
        {
          title: "Innovation Lab Results",
          description: "Using our prototype studio, our non-technical team members built two AI-powered microtools for customer feedback analysis — with zero coding experience required.",
          type: "Internal Innovation",
          metrics: "2 tools built by non-tech team",
          tag: "Empowering"
        }
      ]
    }
  ];

  const keyMetrics = [
    {
      number: "65%",
      label: "Reduction in onboarding time",
      description: "AI-powered personalization accelerates learning paths"
    },
    {
      number: "92%",
      label: "AI accuracy in learning needs detection",
      description: "Even in pilot testing, precision was remarkable"
    },
    {
      number: "3min",
      label: "Average time to generate personalized paths",
      description: "From assessment to customized learning journey"
    },
    {
      number: "100%",
      label: "Of pilot users found value immediately",
      description: "Early validation of our human-centered approach"
    }
  ];

  const testimonials = [
    {
      quote: "The AI accuracy in identifying learning needs was unreal — even in the pilot. It felt like the platform knew me.",
      author: "Early User",
      role: "Pilot Program Participant",
      company: "Manufacturing Partner"
    },
    {
      quote: "We built tools we never thought possible without our technical team. LXERA made citizen development actually accessible.",
      author: "Team Lead",
      role: "Internal Innovation",
      company: "LXERA Team"
    },
    {
      quote: "The personalization wasn't just smart — it was intuitive. Like having a mentor who understood exactly what I needed to learn next.",
      author: "Learning Professional",
      role: "Co-Creation Partner",
      company: "Industry Expert"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-business-black/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 font-inter">
            Success <span className="text-business-black">Stories</span>
          </h1>
          <p className="text-xl text-business-black/70 mb-8 max-w-3xl mx-auto font-inter">
            Early Results That Inspire the Future
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto border border-gray-200/50">
            <p className="text-lg text-business-black/80 font-inter leading-relaxed">
              While LXERA is still in its early stages, we've already seen powerful signs of what's possible. 
              From closed pilots and internal innovation to cross-industry co-creation, here's a glimpse into 
              the value LXERA is already creating.
            </p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-business-black/5 to-gray-100/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-4 font-inter">
              Early Results
            </h2>
            <p className="text-xl text-business-black/70 font-inter">
              Real metrics from our pilot programs and internal testing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-business-black mb-2 font-inter">
                    {metric.number}
                  </div>
                  <div className="text-lg font-semibold text-business-black mb-2 font-inter">
                    {metric.label}
                  </div>
                  <div className="text-sm text-business-black/60 font-inter">
                    {metric.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Categories */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {storyCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="mb-16">
                <div className="flex items-center mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center mr-4`}>
                    <IconComponent className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-business-black font-inter">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.stories.map((story, storyIndex) => (
                    <Card key={storyIndex} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="bg-business-black/10 text-business-black border-0">
                            {story.tag}
                          </Badge>
                          <div className="text-sm text-business-black/50 font-inter">
                            {story.metrics}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-semibold text-business-black font-inter mb-2">
                          {story.title}
                        </CardTitle>
                        <div className="text-sm text-business-black/60 font-inter mb-3">
                          {story.type}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-business-black/70 font-inter text-base leading-relaxed">
                          {story.description}
                        </CardDescription>
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
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/30 to-business-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-4 font-inter">
              Voices from the <span className="text-business-black">Journey</span>
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto font-inter">
              Real feedback from early users, partners, and our own team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <Quote className="w-8 h-8 text-business-black/20 mb-4" />
                  <CardDescription className="text-business-black/80 font-inter text-base leading-relaxed italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-gray-200/50 pt-4">
                    <div className="font-semibold text-business-black font-inter">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-business-black/60 font-inter">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-business-black/50 font-inter">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-business-black to-business-black/90 rounded-3xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-inter">
              Be Part of the Next Success Story
            </h2>
            <p className="text-xl text-white/80 mb-8 font-inter">
              Join our pilot program and help shape the future of learning and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-business-black hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Request Pilot Access
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-business-black px-8 py-3 rounded-xl">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
