
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
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
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
          Let us show you how LXERA transforms your workforce.
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
          >
            Book a Demo
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
          >
            Contact Sales
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Brochure
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="border-2 border-gray-200 focus:border-future-green"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="border-2 border-gray-200 focus:border-future-green"
              required
            />
            <Input
              name="organization"
              placeholder="Organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="border-2 border-gray-200 focus:border-future-green"
              required
            />
            <Input
              name="role"
              placeholder="Role/Title"
              value={formData.role}
              onChange={handleInputChange}
              className="border-2 border-gray-200 focus:border-future-green"
              required
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
