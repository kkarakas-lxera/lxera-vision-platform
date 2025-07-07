
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Calendar, ChevronDown, ChevronUp, Search } from "lucide-react";
import { ticketService } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";
import CalendlyEmbed from "./CalendlyEmbed";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const DemoModal = ({ isOpen, onClose, source = "Website" }: DemoModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    companySize: "",
    country: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const { toast } = useToast();

  const companySizeOptions = [
    "51-200",
    "201-500",
    "11-50",
    "501-1000",
    "1-10",
    "1001-5000",
    "5000+"
  ];

  const countryOptions = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo (Congo-Brazzaville)",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Holy See",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar (formerly Burma)",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine State",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe"
  ];

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Updated validation to include mandatory fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.companySize || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including company size and country.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await ticketService.submitTicket({
        ticketType: 'demo_request',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        message: formData.message,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        companySize: formData.companySize,
        country: formData.country,
        source,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit demo request');
      }
      
      setIsSubmitted(true);
      // Remove toast notification here - will show after Calendly scheduling
    } catch (error) {
      console.error('Demo request submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      jobTitle: "",
      phone: "",
      companySize: "",
      country: "",
      message: ""
    });
    setIsSubmitted(false);
    setShowOptionalFields(false);
    setCountrySearch("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-future-green/20 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-semibold text-business-black font-inter">
            {isSubmitted ? "Thank You!" : "Request a Demo"}
          </DialogTitle>
          <DialogDescription>
            {isSubmitted ? "Schedule your demo meeting" : "See LXERA in action with a personalized demonstration"}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-future-green" />
                <h3 className="text-lg font-semibold text-business-black">
                  Schedule Your Demo
                </h3>
              </div>
              <p className="text-sm text-business-black/70">
                Now, pick a time that works best for you:
              </p>
            </div>
            
            {/* Calendly Embed */}
            <div className="relative">
              <CalendlyEmbed 
                url="https://calendly.com/kubilay-karakas-lxera/30min"
                prefill={{
                  email: formData.email,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  customAnswers: {
                    a1: formData.company,
                    a2: formData.jobTitle || '',
                    a3: formData.companySize,
                    a4: formData.country
                  }
                }}
                utm={{
                  utmSource: "website",
                  utmMedium: "demo_request",
                  utmCampaign: source ? source.toLowerCase().replace(/\s+/g, '_') : "website"
                }}
              />
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => {
                  toast({
                    title: "Demo Request Received!",
                    description: "We'll be in touch within 24 hours to schedule your personalized demo.",
                  });
                  handleClose();
                }}
                variant="outline"
                className="border-gray-300 text-business-black hover:bg-gray-50 font-medium px-6 py-2 rounded-xl"
              >
                I'll schedule later
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-business-black">
                    First name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-business-black">
                    Last name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-business-black">
                  Work email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-business-black">
                  Company name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleInputChange("company")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize" className="text-sm font-medium text-business-black">
                    # of employees <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.companySize} onValueChange={handleSelectChange("companySize")} required>
                    <SelectTrigger className="w-full h-11 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green bg-white hover:bg-gray-50 transition-colors">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-64">
                      {companySizeOptions.map((size) => (
                        <SelectItem 
                          key={size} 
                          value={size}
                          className="px-3 py-2 hover:bg-future-green/10 cursor-pointer text-gray-700 focus:bg-future-green/10 focus:text-business-black"
                        >
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-business-black">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.country} onValueChange={handleSelectChange("country")} required>
                    <SelectTrigger className="w-full h-11 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green bg-white hover:bg-gray-50 transition-colors">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl z-[100] max-h-64">
                      <div className="sticky top-0 bg-white p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="pl-8 h-9"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {countryOptions
                          .filter(country => 
                            country.toLowerCase().includes(countrySearch.toLowerCase())
                          )
                          .map((country) => (
                            <SelectItem 
                              key={country} 
                              value={country}
                              className="px-3 py-2 hover:bg-future-green/10 cursor-pointer text-gray-700 focus:bg-future-green/10 focus:text-business-black"
                            >
                              {country}
                            </SelectItem>
                          ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Fields Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="flex items-center gap-2 text-sm text-business-black/70 hover:text-business-black transition-colors"
                >
                  {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Add optional details
                </button>
              </div>

              {/* Optional Fields */}
              {showOptionalFields && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-sm font-medium text-business-black">
                        Job title
                      </Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        placeholder="Your role"
                        value={formData.jobTitle}
                        onChange={handleInputChange("jobTitle")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-business-black">
                        Phone number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-business-black">
                      How can we help you?
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your learning and development needs..."
                      value={formData.message}
                      onChange={handleInputChange("message")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-business-black/60">
                Required fields are marked with <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-business-black/60">
                By submitting this form, you agree to our <a href="/privacy" className="text-future-green hover:underline">Privacy Policy</a>.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-2 border-gray-300 text-business-black hover:bg-gray-50 hover:text-business-black font-medium py-2 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-future-green text-business-black hover:bg-future-green/90 font-medium py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Continue to Schedule →"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DemoModal;
