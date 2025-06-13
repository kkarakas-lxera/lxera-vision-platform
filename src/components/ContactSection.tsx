
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demo request submitted:', formData);
    // Handle form submission
  };

  return (
    <section id="contact" className="w-full py-20 px-6 lg:px-12 bg-business-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up">
            Let us show you how LXERA transforms your workforce.
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Join forward-thinking organizations already revolutionizing their learning and development approach.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Button 
              size="lg" 
              className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Book a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Get Started Today
            </h3>
            <p className="text-white/70">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-white/90 border-2 border-transparent focus:border-future-green focus:bg-white transition-all duration-300"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-white/90 border-2 border-transparent focus:border-future-green focus:bg-white transition-all duration-300"
              required
            />
            <Input
              name="organization"
              placeholder="Organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="bg-white/90 border-2 border-transparent focus:border-future-green focus:bg-white transition-all duration-300"
              required
            />
            <Input
              name="role"
              placeholder="Role/Title"
              value={formData.role}
              onChange={handleInputChange}
              className="bg-white/90 border-2 border-transparent focus:border-future-green focus:bg-white transition-all duration-300"
              required
            />
          </div>
          
          <div className="text-center">
            <Button 
              type="submit"
              size="lg"
              className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 text-lg px-12 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Request Demo
            </Button>
            
            <p className="text-xs text-white/60 mt-4">
              By submitting this form, you agree to receive communications from LXERA. 
              We respect your privacy and never share your information.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
