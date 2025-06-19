
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, Headphones, Download, ExternalLink, Users, Lightbulb, TrendingUp, MessageCircle } from "lucide-react";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Learning Materials",
      icon: BookOpen,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      resources: [
        {
          title: "AI-Powered Learning Guide",
          description: "Complete guide to implementing AI in your learning strategy",
          type: "PDF",
          duration: "45 min read",
          tag: "Popular"
        },
        {
          title: "Workforce Transformation Playbook", 
          description: "Step-by-step playbook for digital transformation",
          type: "eBook",
          duration: "2 hour read",
          tag: "Essential"
        },
        {
          title: "Innovation Framework Templates",
          description: "Ready-to-use templates for innovation programs",
          type: "Templates",
          duration: "30 min setup",
          tag: "New"
        }
      ]
    },
    {
      title: "Video Content",
      icon: Video,
      color: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      resources: [
        {
          title: "LXERA Platform Demo",
          description: "Complete walkthrough of the LXERA platform",
          type: "Video",
          duration: "15 minutes",
          tag: "Featured"
        },
        {
          title: "Customer Success Stories",
          description: "Real transformation stories from our clients",
          type: "Video Series",
          duration: "25 minutes",
          tag: "Inspiring"
        },
        {
          title: "AI in Learning Webinar",
          description: "Expert insights on AI implementation in learning",
          type: "Webinar",
          duration: "60 minutes",
          tag: "Expert"
        }
      ]
    },
    {
      title: "Podcasts & Audio",
      icon: Headphones,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      resources: [
        {
          title: "Future of Learning Podcast",
          description: "Weekly insights on learning innovation trends",
          type: "Podcast",
          duration: "30 min episodes",
          tag: "Weekly"
        },
        {
          title: "Leadership in Digital Age",
          description: "Conversations with transformation leaders",
          type: "Audio Series",
          duration: "45 min episodes",
          tag: "Leadership"
        }
      ]
    },
    {
      title: "Case Studies",
      icon: TrendingUp,
      color: "bg-gradient-to-br from-amber-100 to-yellow-100",
      iconColor: "text-amber-600",
      resources: [
        {
          title: "Fortune 500 Digital Transformation",
          description: "How a global company transformed their learning",
          type: "Case Study",
          duration: "20 min read",
          tag: "Enterprise"
        },
        {
          title: "SME Innovation Success",
          description: "Small business innovation program results",
          type: "Case Study", 
          duration: "15 min read",
          tag: "SME"
        }
      ]
    }
  ];

  const communityResources = [
    {
      title: "Community Forum",
      description: "Connect with other innovators and share best practices",
      icon: MessageCircle,
      action: "Join Discussion"
    },
    {
      title: "Expert Network", 
      description: "Access to learning and innovation experts",
      icon: Users,
      action: "Connect Now"
    },
    {
      title: "Innovation Lab",
      description: "Collaborative space for testing new ideas",
      icon: Lightbulb,
      action: "Explore Lab"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 font-inter">
            Learning <span className="text-future-green">Resources</span>
          </h1>
          <p className="text-xl text-business-black/70 mb-8 max-w-3xl mx-auto font-inter">
            Discover guides, templates, case studies, and insights to accelerate your learning and innovation journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-future-green hover:bg-future-green/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Browse All Resources
            </Button>
            <Button variant="outline" className="border-business-black/20 text-business-black hover:bg-business-black hover:text-white px-8 py-3 rounded-xl">
              Request Custom Content
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {resourceCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="mb-16">
                <div className="flex items-center mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center mr-4`}>
                    <IconComponent className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-business-black font-inter">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.resources.map((resource, resourceIndex) => (
                    <Card key={resourceIndex} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="bg-future-green/10 text-future-green border-0">
                            {resource.tag}
                          </Badge>
                          <ExternalLink className="w-4 h-4 text-business-black/40" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-business-black font-inter">
                          {resource.title}
                        </CardTitle>
                        <CardDescription className="text-business-black/60 font-inter">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-business-black/50 mb-4 font-inter">
                          <span>{resource.type}</span>
                          <span>{resource.duration}</span>
                        </div>
                        <Button className="w-full bg-business-black hover:bg-business-black/90 text-white rounded-xl">
                          <Download className="w-4 h-4 mr-2" />
                          Access Resource
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community Resources */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/30 to-future-green/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-4 font-inter">
              Community & <span className="text-future-green">Collaboration</span>
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto font-inter">
              Connect with like-minded innovators and access expert knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-future-green/10 to-emerald/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-future-green" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black font-inter mb-2">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 font-inter">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-future-green hover:bg-future-green/90 text-white rounded-xl">
                      {resource.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-business-black to-business-black/90 rounded-3xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-inter">
              Need Something Specific?
            </h2>
            <p className="text-xl text-white/80 mb-8 font-inter">
              Our team can create custom resources tailored to your specific needs and industry requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-future-green hover:bg-future-green/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Request Custom Resource
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-business-black px-8 py-3 rounded-xl">
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

export default Resources;
