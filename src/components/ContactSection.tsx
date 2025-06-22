
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import DemoModal from "./DemoModal";
import Loading from "./Loading";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const { toast } = useToast();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      case 'name':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
      case 'organization':
        return value.trim().length >= 2 ? '' : 'Organization must be at least 2 characters';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Demo request submitted:', formData);
      setIsSubmitted(true);
      toast({
        title: "Demo Request Submitted!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookDemo = () => {
    setIsDemoModalOpen(true);
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="w-full py-20 sm:py-24 px-6 lg:px-12 bg-business-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-scale">
            <CheckCircle2 className="w-16 h-16 text-future-green mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6">
              Thank You!
            </h2>
            <p className="text-lg sm:text-xl lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Your demo request has been submitted successfully. Our team will contact you within 24 hours.
            </p>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: '', email: '', organization: '', role: '' });
              }}
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-business-black transition-all duration-300"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="w-full py-20 sm:py-24 px-6 lg:px-12 bg-business-black" role="region" aria-labelledby="contact-heading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="contact-heading" className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 animate-fade-in-up">
            Let us show you how LXERA transforms your workforce.
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Join forward-thinking organizations already revolutionizing their learning and development approach.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Button 
              size="lg" 
              onClick={handleBookDemo}
              className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl min-h-[3rem] min-w-[10rem] focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
              aria-label="Book a product demonstration"
            >
              Book a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-business-black bg-white hover:bg-white/90 hover:text-business-black text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg min-h-[3rem] min-w-[10rem] focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
              aria-label="Contact our sales team"
            >
              Contact Sales
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.6s'}} noValidate>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Get Started Today
            </h3>
            <p className="text-white/70">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`bg-white/90 border-2 transition-all duration-300 min-h-[3rem] rounded-xl ${
                  errors.name ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-future-green'
                } focus:bg-white`}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-red-300 text-sm mt-1" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-white/90 border-2 transition-all duration-300 min-h-[3rem] rounded-xl ${
                  errors.email ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-future-green'
                } focus:bg-white`}
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-red-300 text-sm mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <Input
                name="organization"
                placeholder="Organization"
                value={formData.organization}
                onChange={handleInputChange}
                className={`bg-white/90 border-2 transition-all duration-300 min-h-[3rem] rounded-xl ${
                  errors.organization ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-future-green'
                } focus:bg-white`}
                required
                aria-invalid={!!errors.organization}
                aria-describedby={errors.organization ? "organization-error" : undefined}
              />
              {errors.organization && (
                <p id="organization-error" className="text-red-300 text-sm mt-1" role="alert">
                  {errors.organization}
                </p>
              )}
            </div>
            
            <div>
              <Input
                name="role"
                placeholder="Role/Title"
                value={formData.role}
                onChange={handleInputChange}
                className="bg-white/90 border-2 border-transparent focus:border-future-green focus:bg-white transition-all duration-300 min-h-[3rem] rounded-xl"
              />
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 text-lg px-12 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl min-h-[3rem] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
              aria-label={isSubmitting ? "Submitting demo request" : "Submit demo request"}
            >
              {isSubmitting ? (
                <Loading text="Submitting..." size="sm" />
              ) : (
                'Request Demo'
              )}
            </Button>
            
            <p className="text-xs text-white/60 mt-4">
              By submitting this form, you agree to receive communications from LXERA. 
              We respect your privacy and never share your information.
            </p>
          </div>
        </form>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </section>
  );
};

export default ContactSection;
