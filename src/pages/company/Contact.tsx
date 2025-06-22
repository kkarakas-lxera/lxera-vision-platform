
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle, Users, Headphones, Building, Shield, Clock, Award, Zap } from "lucide-react";

const Contact = () => {
  const contactOptions = [
    {
      icon: Building,
      title: "Sales Inquiries",
      description: "Learn how LXERA can transform your organization's learning strategy",
      action: "Contact Sales",
      email: "sales@lxera.com"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help with your LXERA platform and account questions",
      action: "Get Support",
      email: "support@lxera.com"
    },
    {
      icon: Users,
      title: "Partnerships",
      description: "Explore partnership opportunities and integration possibilities",
      action: "Partner With Us",
      email: "partnerships@lxera.com"
    },
    {
      icon: MessageCircle,
      title: "General Inquiries",
      description: "For press, media, or other general questions about LXERA",
      action: "Send Message",
      email: "hello@lxera.com"
    }
  ];

  const trustFactors = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and end-to-end encryption"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock support from our dedicated customer success team"
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "95% customer satisfaction rate with measurable learning outcomes"
    },
    {
      icon: Zap,
      title: "Quick Implementation",
      description: "Get started in days, not months, with our streamlined onboarding"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight">
            Let's Start a
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            Whether you're ready to transform your learning strategy or just want to learn more 
            about LXERA, we're here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              How Can We Help?
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Choose the best way to connect with our team
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm group">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-emerald/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-future-green" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-future-green transition-colors duration-300">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Button className="bg-future-green text-business-black font-medium rounded-xl transition-all duration-300 hover:scale-105">
                        {option.action}
                      </Button>
                      <div className="text-sm text-business-black/60 text-center">
                        {option.email}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Send Us a Message
            </h2>
            <p className="text-lg text-business-black/70">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
          
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-business-black font-medium mb-2">First Name</label>
                    <Input placeholder="Your first name" className="border-business-black/20" />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-2">Last Name</label>
                    <Input placeholder="Your last name" className="border-business-black/20" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-business-black font-medium mb-2">Email</label>
                    <Input type="email" placeholder="your.email@company.com" className="border-business-black/20" />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-2">Company</label>
                    <Input placeholder="Your company name" className="border-business-black/20" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-business-black font-medium mb-2">Subject</label>
                  <Input placeholder="What would you like to discuss?" className="border-business-black/20" />
                </div>
                
                <div>
                  <label className="block text-business-black font-medium mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us more about your learning goals and how we can help..."
                    rows={5}
                    className="border-business-black/20"
                  />
                </div>
                
                <Button className="w-full bg-future-green text-business-black font-semibold py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Why Organizations Trust LXERA
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Join hundreds of forward-thinking organizations already transforming their learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFactors.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-emerald/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-future-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-business-black mb-2 group-hover:text-future-green transition-colors duration-300">
                    {factor.title}
                  </h3>
                  <p className="text-business-black/70 text-sm leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Schedule a personalized demo to see how LXERA can transform your organization's learning experience.
          </p>
          <Button className="bg-future-green text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
            Schedule Demo
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
