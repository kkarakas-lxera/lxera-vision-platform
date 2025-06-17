import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    companyName: '',
    jobTitle: '',
    phoneNumber: '',
    numberOfEmployees: '',
    location: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.workEmail || !formData.companyName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Demo request submitted:', formData);
      toast({
        title: "Demo Request Submitted!",
        description: "We'll get back to you within 24 hours to schedule your demo.",
      });
      
      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        companyName: '',
        jobTitle: '',
        phoneNumber: '',
        numberOfEmployees: '',
        location: '',
        message: ''
      });
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[4rem] border-0 shadow-2xl">
        <DialogHeader className="rounded-t-[4rem] px-8 pt-8">
          <div className="flex items-center justify-start mb-6">
            <img
              src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
              alt="LXERA logo"
              className="h-6 object-contain"
              draggable={false}
            />
          </div>
          <DialogTitle className="text-2xl font-semibold text-left text-business-black">
            Get a demo
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 px-8 pb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">First name</label>
              <Input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Last name</label>
              <Input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Work email</label>
              <Input
                name="workEmail"
                type="email"
                placeholder="your.email@company.com"
                value={formData.workEmail}
                onChange={handleInputChange}
                required
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Company name</label>
              <Input
                name="companyName"
                placeholder="Company name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Job title</label>
              <Input
                name="jobTitle"
                placeholder="Your role"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Phone number</label>
              <Input
                name="phoneNumber"
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium"># of employees</label>
              <Select value={formData.numberOfEmployees} onValueChange={(value) => handleSelectChange('numberOfEmployees', value)}>
                <SelectTrigger className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-0 shadow-xl">
                  <SelectItem value="1-10" className="rounded-xl">1-10</SelectItem>
                  <SelectItem value="11-50" className="rounded-xl">11-50</SelectItem>
                  <SelectItem value="51-200" className="rounded-xl">51-200</SelectItem>
                  <SelectItem value="201-1000" className="rounded-xl">201-1000</SelectItem>
                  <SelectItem value="1000+" className="rounded-xl">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Location</label>
              <Select value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                <SelectTrigger className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-0 shadow-xl">
                  <SelectItem value="north-america" className="rounded-xl">North America</SelectItem>
                  <SelectItem value="europe" className="rounded-xl">Europe</SelectItem>
                  <SelectItem value="asia-pacific" className="rounded-xl">Asia Pacific</SelectItem>
                  <SelectItem value="latin-america" className="rounded-xl">Latin America</SelectItem>
                  <SelectItem value="africa" className="rounded-xl">Africa</SelectItem>
                  <SelectItem value="middle-east" className="rounded-xl">Middle East</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-3 block font-medium">How can we help you?</label>
            <Textarea
              name="message"
              placeholder="Tell us about your learning and development needs..."
              value={formData.message}
              onChange={handleInputChange}
              className="border-0 bg-gray-100 min-h-[120px] rounded-[2rem] px-5 py-4 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
            />
          </div>

          <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-6 rounded-[2rem]">
            By completing and submitting this form, you agree that LXERA may email or call you with product updates, educational resources, and other promotional information. To learn more about how LXERA uses your information, see our{' '}
            <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;
