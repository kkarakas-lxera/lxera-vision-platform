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
                  <SelectItem value="andorra" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Andorra</SelectItem>
                  <SelectItem value="angola" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Angola</SelectItem>
                  <SelectItem value="antigua-and-barbuda" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Antigua and Barbuda</SelectItem>
                  <SelectItem value="argentina" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Argentina</SelectItem>
                  <SelectItem value="armenia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Armenia</SelectItem>
                  <SelectItem value="australia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Australia</SelectItem>
                  <SelectItem value="austria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Austria</SelectItem>
                  <SelectItem value="azerbaijan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Azerbaijan</SelectItem>
                  <SelectItem value="bahamas" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bahamas</SelectItem>
                  <SelectItem value="bahrain" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bahrain</SelectItem>
                  <SelectItem value="bangladesh" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bangladesh</SelectItem>
                  <SelectItem value="barbados" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Barbados</SelectItem>
                  <SelectItem value="belarus" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Belarus</SelectItem>
                  <SelectItem value="belgium" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Belgium</SelectItem>
                  <SelectItem value="belize" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Belize</SelectItem>
                  <SelectItem value="benin" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Benin</SelectItem>
                  <SelectItem value="bhutan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bhutan</SelectItem>
                  <SelectItem value="bolivia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bolivia</SelectItem>
                  <SelectItem value="bosnia-and-herzegovina" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bosnia and Herzegovina</SelectItem>
                  <SelectItem value="botswana" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Botswana</SelectItem>
                  <SelectItem value="brazil" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Brazil</SelectItem>
                  <SelectItem value="brunei" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Brunei</SelectItem>
                  <SelectItem value="bulgaria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Bulgaria</SelectItem>
                  <SelectItem value="burkina-faso" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Burkina Faso</SelectItem>
                  <SelectItem value="burundi" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Burundi</SelectItem>
                  <SelectItem value="cabo-verde" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Cabo Verde</SelectItem>
                  <SelectItem value="cambodia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Cambodia</SelectItem>
                  <SelectItem value="cameroon" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Cameroon</SelectItem>
                  <SelectItem value="canada" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Canada</SelectItem>
                  <SelectItem value="central-african-republic" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Central African Republic</SelectItem>
                  <SelectItem value="chad" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Chad</SelectItem>
                  <SelectItem value="chile" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Chile</SelectItem>
                  <SelectItem value="china" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">China</SelectItem>
                  <SelectItem value="colombia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Colombia</SelectItem>
                  <SelectItem value="comoros" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Comoros</SelectItem>
                  <SelectItem value="congo-democratic-republic" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Congo (Democratic Republic)</SelectItem>
                  <SelectItem value="congo-republic" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Congo (Republic)</SelectItem>
                  <SelectItem value="costa-rica" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Costa Rica</SelectItem>
                  <SelectItem value="cote-divoire" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Côte d'Ivoire</SelectItem>
                  <SelectItem value="croatia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Croatia</SelectItem>
                  <SelectItem value="cuba" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Cuba</SelectItem>
                  <SelectItem value="cyprus" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Cyprus</SelectItem>
                  <SelectItem value="czech-republic" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Czech Republic</SelectItem>
                  <SelectItem value="denmark" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Denmark</SelectItem>
                  <SelectItem value="djibouti" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Djibouti</SelectItem>
                  <SelectItem value="dominica" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Dominica</SelectItem>
                  <SelectItem value="dominican-republic" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Dominican Republic</SelectItem>
                  <SelectItem value="ecuador" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ecuador</SelectItem>
                  <SelectItem value="egypt" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Egypt</SelectItem>
                  <SelectItem value="el-salvador" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">El Salvador</SelectItem>
                  <SelectItem value="equatorial-guinea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Equatorial Guinea</SelectItem>
                  <SelectItem value="eritrea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Eritrea</SelectItem>
                  <SelectItem value="estonia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Estonia</SelectItem>
                  <SelectItem value="eswatini" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Eswatini</SelectItem>
                  <SelectItem value="ethiopia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ethiopia</SelectItem>
                  <SelectItem value="fiji" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Fiji</SelectItem>
                  <SelectItem value="finland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Finland</SelectItem>
                  <SelectItem value="france" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">France</SelectItem>
                  <SelectItem value="gabon" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Gabon</SelectItem>
                  <SelectItem value="gambia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Gambia</SelectItem>
                  <SelectItem value="georgia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Georgia</SelectItem>
                  <SelectItem value="germany" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Germany</SelectItem>
                  <SelectItem value="ghana" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ghana</SelectItem>
                  <SelectItem value="greece" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Greece</SelectItem>
                  <SelectItem value="grenada" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Grenada</SelectItem>
                  <SelectItem value="guatemala" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Guatemala</SelectItem>
                  <SelectItem value="guinea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Guinea</SelectItem>
                  <SelectItem value="guinea-bissau" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Guinea-Bissau</SelectItem>
                  <SelectItem value="guyana" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Guyana</SelectItem>
                  <SelectItem value="haiti" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Haiti</SelectItem>
                  <SelectItem value="honduras" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Honduras</SelectItem>
                  <SelectItem value="hungary" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Hungary</SelectItem>
                  <SelectItem value="iceland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Iceland</SelectItem>
                  <SelectItem value="india" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">India</SelectItem>
                  <SelectItem value="indonesia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Indonesia</SelectItem>
                  <SelectItem value="iran" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Iran</SelectItem>
                  <SelectItem value="iraq" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Iraq</SelectItem>
                  <SelectItem value="ireland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ireland</SelectItem>
                  <SelectItem value="israel" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Israel</SelectItem>
                  <SelectItem value="italy" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Italy</SelectItem>
                  <SelectItem value="jamaica" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Jamaica</SelectItem>
                  <SelectItem value="japan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Japan</SelectItem>
                  <SelectItem value="jordan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Jordan</SelectItem>
                  <SelectItem value="kazakhstan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kazakhstan</SelectItem>
                  <SelectItem value="kenya" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kenya</SelectItem>
                  <SelectItem value="kiribati" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kiribati</SelectItem>
                  <SelectItem value="kosovo" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kosovo</SelectItem>
                  <SelectItem value="kuwait" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kuwait</SelectItem>
                  <SelectItem value="kyrgyzstan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Kyrgyzstan</SelectItem>
                  <SelectItem value="laos" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Laos</SelectItem>
                  <SelectItem value="latvia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Latvia</SelectItem>
                  <SelectItem value="lebanon" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Lebanon</SelectItem>
                  <SelectItem value="lesotho" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Lesotho</SelectItem>
                  <SelectItem value="liberia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Liberia</SelectItem>
                  <SelectItem value="libya" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Libya</SelectItem>
                  <SelectItem value="liechtenstein" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Liechtenstein</SelectItem>
                  <SelectItem value="lithuania" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Lithuania</SelectItem>
                  <SelectItem value="luxembourg" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Luxembourg</SelectItem>
                  <SelectItem value="madagascar" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Madagascar</SelectItem>
                  <SelectItem value="malawi" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Malawi</SelectItem>
                  <SelectItem value="maldives" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Maldives</SelectItem>
                  <SelectItem value="mali" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mali</SelectItem>
                  <SelectItem value="malta" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Malta</SelectItem>
                  <SelectItem value="marshall-islands" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Marshall Islands</SelectItem>
                  <SelectItem value="mauritania" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mauritania</SelectItem>
                  <SelectItem value="mauritius" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mauritius</SelectItem>
                  <SelectItem value="mexico" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mexico</SelectItem>
                  <SelectItem value="micronesia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Micronesia</SelectItem>
                  <SelectItem value="moldova" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Moldova</SelectItem>
                  <SelectItem value="monaco" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Monaco</SelectItem>
                  <SelectItem value="mongolia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mongolia</SelectItem>
                  <SelectItem value="montenegro" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Montenegro</SelectItem>
                  <SelectItem value="morocco" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Morocco</SelectItem>
                  <SelectItem value="mozambique" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Mozambique</SelectItem>
                  <SelectItem value="myanmar" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Myanmar</SelectItem>
                  <SelectItem value="namibia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Namibia</SelectItem>
                  <SelectItem value="nauru" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Nauru</SelectItem>
                  <SelectItem value="nepal" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Nepal</SelectItem>
                  <SelectItem value="netherlands" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Netherlands</SelectItem>
                  <SelectItem value="new-zealand" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">New Zealand</SelectItem>
                  <SelectItem value="nicaragua" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Nicaragua</SelectItem>
                  <SelectItem value="niger" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Niger</SelectItem>
                  <SelectItem value="nigeria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Nigeria</SelectItem>
                  <SelectItem value="north-korea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">North Korea</SelectItem>
                  <SelectItem value="north-macedonia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">North Macedonia</SelectItem>
                  <SelectItem value="norway" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Norway</SelectItem>
                  <SelectItem value="oman" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Oman</SelectItem>
                  <SelectItem value="pakistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Pakistan</SelectItem>
                  <SelectItem value="palau" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Palau</SelectItem>
                  <SelectItem value="palestine" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Palestine</SelectItem>
                  <SelectItem value="panama" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Panama</SelectItem>
                  <SelectItem value="papua-new-guinea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Papua New Guinea</SelectItem>
                  <SelectItem value="paraguay" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Paraguay</SelectItem>
                  <SelectItem value="peru" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Peru</SelectItem>
                  <SelectItem value="philippines" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Philippines</SelectItem>
                  <SelectItem value="poland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Poland</SelectItem>
                  <SelectItem value="portugal" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Portugal</SelectItem>
                  <SelectItem value="qatar" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Qatar</SelectItem>
                  <SelectItem value="romania" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Romania</SelectItem>
                  <SelectItem value="russia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Russia</SelectItem>
                  <SelectItem value="rwanda" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Rwanda</SelectItem>
                  <SelectItem value="saint-kitts-and-nevis" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Saint Kitts and Nevis</SelectItem>
                  <SelectItem value="saint-lucia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Saint Lucia</SelectItem>
                  <SelectItem value="saint-vincent-and-the-grenadines" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Saint Vincent and the Grenadines</SelectItem>
                  <SelectItem value="samoa" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Samoa</SelectItem>
                  <SelectItem value="san-marino" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">San Marino</SelectItem>
                  <SelectItem value="sao-tome-and-principe" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sao Tome and Principe</SelectItem>
                  <SelectItem value="saudi-arabia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Saudi Arabia</SelectItem>
                  <SelectItem value="senegal" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Senegal</SelectItem>
                  <SelectItem value="serbia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Serbia</SelectItem>
                  <SelectItem value="seychelles" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Seychelles</SelectItem>
                  <SelectItem value="sierra-leone" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sierra Leone</SelectItem>
                  <SelectItem value="singapore" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Singapore</SelectItem>
                  <SelectItem value="slovakia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Slovakia</SelectItem>
                  <SelectItem value="slovenia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Slovenia</SelectItem>
                  <SelectItem value="solomon-islands" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Solomon Islands</SelectItem>
                  <SelectItem value="somalia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Somalia</SelectItem>
                  <SelectItem value="south-africa" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">South Africa</SelectItem>
                  <SelectItem value="south-korea" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">South Korea</SelectItem>
                  <SelectItem value="south-sudan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">South Sudan</SelectItem>
                  <SelectItem value="spain" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Spain</SelectItem>
                  <SelectItem value="sri-lanka" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sri Lanka</SelectItem>
                  <SelectItem value="sudan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sudan</SelectItem>
                  <SelectItem value="suriname" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Suriname</SelectItem>
                  <SelectItem value="sweden" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Sweden</SelectItem>
                  <SelectItem value="switzerland" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Switzerland</SelectItem>
                  <SelectItem value="syria" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Syria</SelectItem>
                  <SelectItem value="taiwan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Taiwan</SelectItem>
                  <SelectItem value="tajikistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Tajikistan</SelectItem>
                  <SelectItem value="tanzania" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Tanzania</SelectItem>
                  <SelectItem value="thailand" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Thailand</SelectItem>
                  <SelectItem value="timor-leste" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Timor-Leste</SelectItem>
                  <SelectItem value="togo" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Togo</SelectItem>
                  <SelectItem value="tonga" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Tonga</SelectItem>
                  <SelectItem value="trinidad-and-tobago" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Trinidad and Tobago</SelectItem>
                  <SelectItem value="tunisia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Tunisia</SelectItem>
                  <SelectItem value="turkey" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Turkey</SelectItem>
                  <SelectItem value="turkmenistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Turkmenistan</SelectItem>
                  <SelectItem value="tuvalu" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Tuvalu</SelectItem>
                  <SelectItem value="uganda" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Uganda</SelectItem>
                  <SelectItem value="ukraine" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Ukraine</SelectItem>
                  <SelectItem value="united-arab-emirates" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United Arab Emirates</SelectItem>
                  <SelectItem value="united-kingdom" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United Kingdom</SelectItem>
                  <SelectItem value="united-states" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">United States</SelectItem>
                  <SelectItem value="uruguay" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Uruguay</SelectItem>
                  <SelectItem value="uzbekistan" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Uzbekistan</SelectItem>
                  <SelectItem value="vanuatu" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Vanuatu</SelectItem>
                  <SelectItem value="vatican-city" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Vatican City</SelectItem>
                  <SelectItem value="venezuela" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Venezuela</SelectItem>
                  <SelectItem value="vietnam" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Vietnam</SelectItem>
                  <SelectItem value="yemen" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Yemen</SelectItem>
                  <SelectItem value="zambia" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Zambia</SelectItem>
                  <SelectItem value="zimbabwe" className="rounded-xl hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 cursor-pointer transition-colors duration-200">Zimbabwe</SelectItem>
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
