import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Headphones, Users, MessageCircle } from "lucide-react";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";

const Contact = () => {
  const contactOptions = [
    {
      icon: Building,
      title: "Sales Inquiries",
      description: "Learn how LXERA can transform your organization's learning strategy",
      action: "Contact Sales",
      email: "sales@lxera.ai"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help with your LXERA platform and account questions",
      action: "Get Support",
      email: "support@lxera.ai"
    },
    {
      icon: Users,
      title: "Partnerships",
      description: "Explore partnership opportunities and integration possibilities",
      action: "Partner With Us",
      email: "partnerships@lxera.ai"
    },
    {
      icon: MessageCircle,
      title: "General Inquiries",
      description: "For press, media, or other general questions about LXERA",
      action: "Send Message",
      email: "hello@lxera.ai"
    }
  ];

  const handleContactOptionClick = (option: typeof contactOptions[0]) => {
    // Create a mailto link to open the user's email client
    const subject = encodeURIComponent(`${option.title} - LXERA Inquiry`);
    const body = encodeURIComponent(`Hello LXERA Team,\n\nI would like to inquire about ${option.title.toLowerCase()}.\n\nPlease get in touch with me to discuss further.\n\nBest regards,`);
    const mailtoLink = `mailto:${option.email}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
  };

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
                      <Button 
                        onClick={() => handleContactOptionClick(option)}
                        className="bg-future-green text-business-black font-medium rounded-xl transition-all duration-300 hover:scale-105"
                      >
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

      {/* Contact Information */}
      <section id="contact-info" className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-business-black/70">
              We're here to help you transform your organization's learning experience
            </p>
          </div>
          
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 text-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-medium text-business-black mb-4">
                    Ready to See LXERA in Action?
                  </h3>
                  <p className="text-lg text-business-black/70 mb-6">
                    Book a personalized demo to discover how LXERA can revolutionize your workforce development.
                  </p>
                  <ProgressiveDemoCapture
                    source="contact_page_demo"
                    buttonText="Schedule Your Demo"
                    variant="default"
                    className="bg-gradient-to-r from-future-green to-emerald text-business-black font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  />
                </div>
                
                <div className="pt-8 border-t border-business-black/10">
                  <h4 className="text-xl font-medium text-business-black mb-4">
                    Direct Contact
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-business-black/70 mb-2">General Inquiries</p>
                      <a 
                        href="mailto:hello@lxera.ai" 
                        className="text-future-green hover:text-emerald transition-colors duration-300 font-medium"
                      >
                        hello@lxera.ai
                      </a>
                    </div>
                    <div>
                      <p className="text-business-black/70 mb-2">Sales Team</p>
                      <a 
                        href="mailto:sales@lxera.ai" 
                        className="text-future-green hover:text-emerald transition-colors duration-300 font-medium"
                      >
                        sales@lxera.ai
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <ProgressiveDemoCapture
            source="contact_page_cta"
            buttonText="Schedule Demo"
            onSuccess={() => {}}
          />
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default Contact;
