import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building, Headphones, Users, MessageCircle, Loader2 } from "lucide-react";
import { ticketService } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";
import DemoModal from "@/components/DemoModal";

const Contact = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();
  const contactOptions = [
    {
      icon: Building,
      title: "Sales Inquiries",
      description: "Learn how LXERA can transform your organization's learning strategy",
      action: "Contact Sales",
      email: "sales@lxera.ai",
      ticketType: 'contact_sales' as const
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help with your LXERA platform and account questions",
      action: "Get Support",
      email: "support@lxera.ai",
      ticketType: 'contact_sales' as const
    },
    {
      icon: Users,
      title: "Partnerships",
      description: "Explore partnership opportunities and integration possibilities",
      action: "Partner With Us",
      email: "partnerships@lxera.ai",
      ticketType: 'contact_sales' as const
    },
    {
      icon: MessageCircle,
      title: "General Inquiries",
      description: "For press, media, or other general questions about LXERA",
      action: "Send Message",
      email: "hello@lxera.ai",
      ticketType: 'contact_sales' as const
    }
  ];

  const handleContactOptionClick = async (option: typeof contactOptions[0]) => {
    // Pre-fill the subject based on the contact type
    const subjectMap = {
      "Contact Sales": "Sales Inquiry",
      "Get Support": "Support Request",
      "Partner With Us": "Partnership Opportunity",
      "Send Message": "General Inquiry"
    };
    
    setFormData(prev => ({
      ...prev,
      subject: subjectMap[option.action as keyof typeof subjectMap] || option.title
    }));
    
    // Scroll to the contact form
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await ticketService.submitTicket({
        ticketType: 'contact_sales',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        message: `Subject: ${formData.subject}\n\n${formData.message}`,
        source: 'Contact Page'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit contact form');
      }

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Contact form submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Contact Form - Enhanced Curved Design */}
      <section id="contact-form" className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Send Us a Message
            </h2>
            <p className="text-lg text-business-black/70">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
          
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10">
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-business-black font-medium mb-3 text-lg">First Name</label>
                    <Input 
                      placeholder="Your first name" 
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      className="border-business-black/20 rounded-2xl h-14 px-6 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-3 text-lg">Last Name</label>
                    <Input 
                      placeholder="Your last name" 
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      className="border-business-black/20 rounded-2xl h-14 px-6 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg" 
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-business-black font-medium mb-3 text-lg">Email</label>
                    <Input 
                      type="email" 
                      placeholder="your.email@company.com" 
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className="border-business-black/20 rounded-2xl h-14 px-6 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-3 text-lg">Company</label>
                    <Input 
                      placeholder="Your company name" 
                      value={formData.company}
                      onChange={handleInputChange("company")}
                      className="border-business-black/20 rounded-2xl h-14 px-6 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg" 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-business-black font-medium mb-3 text-lg">Subject</label>
                  <Input 
                    placeholder="What would you like to discuss?" 
                    value={formData.subject}
                    onChange={handleInputChange("subject")}
                    className="border-business-black/20 rounded-2xl h-14 px-6 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-business-black font-medium mb-3 text-lg">Message</label>
                  <Textarea 
                    placeholder="Tell us more about your learning goals and how we can help..."
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange("message")}
                    className="border-business-black/20 rounded-2xl px-6 py-4 text-lg bg-white/70 focus:bg-white transition-all duration-300 focus:shadow-lg resize-none"
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-future-green to-emerald text-business-black font-semibold py-6 rounded-2xl text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin inline" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </div>
              </form>
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
          <Button 
            onClick={() => setIsDemoModalOpen(true)}
            className="bg-future-green text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105"
          >
            Schedule Demo
          </Button>
        </div>
      </section>

      <Footer />
      
      {/* Demo Modal */}
      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        source="Contact Page CTA"
      />
    </div>
  );
};

export default Contact;
