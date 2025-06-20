
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones, Building2, Users } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      contact: "hello@lxera.com",
      action: "Send Email",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with support",
      contact: "Available 24/7",
      action: "Start Chat",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our headquarters",
      contact: "San Francisco, CA",
      action: "Get Directions",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const supportTypes = [
    {
      icon: Building2,
      title: "Enterprise Sales",
      description: "Discuss enterprise solutions and custom implementations",
      email: "sales@lxera.com"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help with your account, billing, or technical issues",
      email: "support@lxera.com"
    },
    {
      icon: Users,
      title: "Partnerships",
      description: "Explore partnership opportunities and integrations",
      email: "partnerships@lxera.com"
    }
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Innovation Drive, Suite 100",
      timezone: "PST (UTC-8)",
      hours: "9:00 AM - 6:00 PM"
    },
    {
      city: "New York",
      address: "456 Business Plaza, Floor 15",
      timezone: "EST (UTC-5)",
      hours: "9:00 AM - 6:00 PM"
    },
    {
      city: "London",
      address: "789 Tech Avenue, Level 8",
      timezone: "GMT (UTC+0)",
      hours: "9:00 AM - 5:00 PM"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 to-emerald/5"></div>
        <div className="max-w-6xl mx-auto relative text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6">
            Let's start a
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              conversation
            </span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            Whether you're ready to transform your organization's learning or just want to learn more, 
            we're here to help. Reach out and let's explore what's possible together.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm text-center">
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-business-black">
                      {method.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-business-black/60 mb-4">{method.description}</p>
                    <p className="text-business-black font-medium mb-4">{method.contact}</p>
                    <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Support Types */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-bold text-business-black mb-6">
                Send us a message
              </h2>
              <p className="text-business-black/70 mb-8 text-lg">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-business-black font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/90 border-0 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/90 border-0 rounded-xl"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-business-black font-medium mb-2">
                      Company
                    </label>
                    <Input
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="bg-white/90 border-0 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-business-black font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="bg-white/90 border-0 rounded-xl"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-business-black font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-white/90 border-0 rounded-xl min-h-[120px]"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Support Types */}
            <div>
              <h3 className="text-3xl font-bold text-business-black mb-6">
                Choose the right team
              </h3>
              <p className="text-business-black/70 mb-8 text-lg">
                Get directed to the right department for faster assistance.
              </p>
              
              <div className="space-y-6">
                {supportTypes.map((type, index) => {
                  const IconComponent = type.icon;
                  return (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-future-green to-emerald rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-business-black mb-2 group-hover:text-future-green transition-colors duration-300">
                              {type.title}
                            </h4>
                            <p className="text-business-black/70 mb-3 leading-relaxed">
                              {type.description}
                            </p>
                            <a 
                              href={`mailto:${type.email}`}
                              className="text-future-green hover:text-emerald font-medium transition-colors duration-300"
                            >
                              {type.email}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Our Global Offices
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Visit us in person or connect virtually with our teams around the world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-business-black group-hover:text-future-green transition-colors duration-300">
                    {office.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-center space-x-2">
                    <MapPin className="w-5 h-5 text-future-green mt-0.5 flex-shrink-0" />
                    <p className="text-business-black/70">{office.address}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5 text-future-green" />
                    <p className="text-business-black/70">{office.hours}</p>
                  </div>
                  <p className="text-sm text-business-black/60">{office.timezone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Book a personalized demo and see how LXERA can transform learning in your organization.
          </p>
          <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
            Book a Demo
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Contact;
