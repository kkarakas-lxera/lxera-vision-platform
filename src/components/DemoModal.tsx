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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.workEmail.trim()) newErrors.workEmail = 'Work email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      newErrors.workEmail = 'Please enter a valid email address';
    }
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

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
      setErrors({});
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
              <label className="text-sm text-gray-600 mb-3 block font-medium">First name *</label>
              <Input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={`border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base transition-all duration-200 ${
                  errors.firstName 
                    ? 'ring-2 ring-red-500 bg-red-50' 
                    : 'focus:ring-2 focus:ring-blue-500 focus:bg-white'
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Last name *</label>
              <Input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={`border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base transition-all duration-200 ${
                  errors.lastName 
                    ? 'ring-2 ring-red-500 bg-red-50' 
                    : 'focus:ring-2 focus:ring-blue-500 focus:bg-white'
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Work email *</label>
              <Input
                name="workEmail"
                type="email"
                placeholder="your.email@company.com"
                value={formData.workEmail}
                onChange={handleInputChange}
                required
                className={`border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base transition-all duration-200 ${
                  errors.workEmail 
                    ? 'ring-2 ring-red-500 bg-red-50' 
                    : 'focus:ring-2 focus:ring-blue-500 focus:bg-white'
                }`}
              />
              {errors.workEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.workEmail}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Company name *</label>
              <Input
                name="companyName"
                placeholder="Company name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className={`border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base transition-all duration-200 ${
                  errors.companyName 
                    ? 'ring-2 ring-red-500 bg-red-50' 
                    : 'focus:ring-2 focus:ring-blue-500 focus:bg-white'
                }`}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
              )}
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
                <SelectContent className="bg-white border border-gray-200 rounded-[2rem] shadow-xl z-50 max-h-64 overflow-y-auto">
                  <SelectItem value="1-10" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">1-10</SelectItem>
                  <SelectItem value="11-50" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">11-50</SelectItem>
                  <SelectItem value="51-200" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">51-200</SelectItem>
                  <SelectItem value="201-1000" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">201-1000</SelectItem>
                  <SelectItem value="1000+" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-3 block font-medium">Country</label>
              <Select value={formData.location} onValueChange={(value) => handleSelectChange('location', value)}>
                <SelectTrigger className="border-0 bg-gray-100 rounded-[2rem] h-14 px-5 text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-[2rem] shadow-xl z-50 max-h-64 overflow-y-auto">
                  <SelectItem value="afghanistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Afghanistan</SelectItem>
                  <SelectItem value="albania" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Albania</SelectItem>
                  <SelectItem value="algeria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Algeria</SelectItem>
                  <SelectItem value="argentina" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Argentina</SelectItem>
                  <SelectItem value="australia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Australia</SelectItem>
                  <SelectItem value="austria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Austria</SelectItem>
                  <SelectItem value="bangladesh" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bangladesh</SelectItem>
                  <SelectItem value="belgium" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Belgium</SelectItem>
                  <SelectItem value="brazil" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Brazil</SelectItem>
                  <SelectItem value="canada" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Canada</SelectItem>
                  <SelectItem value="chile" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Chile</SelectItem>
                  <SelectItem value="china" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">China</SelectItem>
                  <SelectItem value="colombia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Colombia</SelectItem>
                  <SelectItem value="denmark" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Denmark</SelectItem>
                  <SelectItem value="egypt" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Egypt</SelectItem>
                  <SelectItem value="finland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Finland</SelectItem>
                  <SelectItem value="france" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">France</SelectItem>
                  <SelectItem value="germany" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Germany</SelectItem>
                  <SelectItem value="ghana" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ghana</SelectItem>
                  <SelectItem value="greece" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Greece</SelectItem>
                  <SelectItem value="india" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">India</SelectItem>
                  <SelectItem value="indonesia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Indonesia</SelectItem>
                  <SelectItem value="ireland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ireland</SelectItem>
                  <SelectItem value="italy" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Italy</SelectItem>
                  <SelectItem value="japan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Japan</SelectItem>
                  <SelectItem value="kenya" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kenya</SelectItem>
                  <SelectItem value="malaysia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Malaysia</SelectItem>
                  <SelectItem value="mexico" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mexico</SelectItem>
                  <SelectItem value="netherlands" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Netherlands</SelectItem>
                  <SelectItem value="new-zealand" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">New Zealand</SelectItem>
                  <SelectItem value="nigeria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Nigeria</SelectItem>
                  <SelectItem value="norway" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Norway</SelectItem>
                  <SelectItem value="pakistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Pakistan</SelectItem>
                  <SelectItem value="philippines" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Philippines</SelectItem>
                  <SelectItem value="poland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Poland</SelectItem>
                  <SelectItem value="portugal" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Portugal</SelectItem>
                  <SelectItem value="russia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Russia</SelectItem>
                  <SelectItem value="saudi-arabia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Saudi Arabia</SelectItem>
                  <SelectItem value="singapore" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Singapore</SelectItem>
                  <SelectItem value="south-africa" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">South Africa</SelectItem>
                  <SelectItem value="south-korea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">South Korea</SelectItem>
                  <SelectItem value="spain" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Spain</SelectItem>
                  <SelectItem value="sweden" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sweden</SelectItem>
                  <SelectItem value="switzerland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Switzerland</SelectItem>
                  <SelectItem value="thailand" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Thailand</SelectItem>
                  <SelectItem value="turkey" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Turkey</SelectItem>
                  <SelectItem value="ukraine" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ukraine</SelectItem>
                  <SelectItem value="united-arab-emirates" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United Arab Emirates</SelectItem>
                  <SelectItem value="united-kingdom" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United Kingdom</SelectItem>
                  <SelectItem value="united-states" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United States</SelectItem>
                  <SelectItem value="vietnam" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Vietnam</SelectItem>
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
