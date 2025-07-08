import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, Calendar, ChevronDown, ChevronUp, Search, ExternalLink } from "lucide-react";
import { ticketService } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import CalendlyEmbedOptimized from "./CalendlyEmbedOptimized";
import { cn } from "@/lib/utils";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const DemoModalOptimized = ({ isOpen, onClose, source = "Website" }: DemoModalProps) => {
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
  const [openCalendlyInNewTab, setOpenCalendlyInNewTab] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const companySizeOptions = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5000+"
  ];

  const popularCountries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Germany",
    "France",
    "Netherlands",
    "Australia",
    "Singapore",
    "India",
    "Brazil"
  ];

  const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
    "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia",
    "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
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
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.companySize || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      
      // On mobile, ask if they want to open Calendly in a new tab
      if (isMobile) {
        setOpenCalendlyInNewTab(true);
      } else {
        // Trigger progressive loading after a small delay
        setTimeout(() => setShowCalendly(true), 300);
      }
    } catch (error) {
      console.error('Demo request submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
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
    setOpenCalendlyInNewTab(false);
    setShowCalendly(false);
    onClose();
  };

  const openCalendlyExternal = () => {
    const params = new URLSearchParams({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      a1: formData.company,
      a2: formData.jobTitle || '',
      a3: formData.companySize,
      a4: formData.country,
      utm_source: "website",
      utm_medium: "demo_request",
      utm_campaign: source ? source.toLowerCase().replace(/\s+/g, '_') : "website"
    });
    
    window.open(`https://calendly.com/kubilay-karakas-lxera/30min?${params.toString()}`, '_blank');
    
    toast({
      title: "Demo Request Received!",
      description: "Schedule your demo in the new tab. We'll be in touch within 24 hours.",
    });
    
    handleClose();
  };

  const content = (
    <>
      {isSubmitted ? (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-future-green" />
              <h3 className="text-lg font-semibold text-business-black">
                {isMobile && openCalendlyInNewTab ? "Ready to Schedule!" : "Schedule Your Demo"}
              </h3>
            </div>
            <p className="text-sm text-business-black/70">
              {isMobile && openCalendlyInNewTab 
                ? "Your information has been saved. Click below to pick a time."
                : "Now, pick a time that works best for you:"}
            </p>
          </div>
          
          {/* Mobile: Show button to open Calendly */}
          {isMobile && openCalendlyInNewTab ? (
            <div className="space-y-4">
              <Button
                onClick={openCalendlyExternal}
                className="w-full bg-future-green text-business-black hover:bg-future-green/90 font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Open Calendar to Schedule
                <ExternalLink className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => {
                  toast({
                    title: "Demo Request Received!",
                    description: "We'll be in touch within 24 hours to schedule your personalized demo.",
                  });
                  handleClose();
                }}
                variant="outline"
                className="w-full border-gray-300 text-business-black hover:bg-gray-50 font-medium py-2 rounded-xl"
              >
                I'll schedule later
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop or Mobile embed with progressive loading */}
              {!showCalendly ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-6 text-center space-y-4">
                    <div className="flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-future-green animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-business-black">Ready to schedule?</h4>
                      <p className="text-sm text-gray-600">
                        Click below to view available time slots
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCalendly(true)}
                      className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Show Available Times
                    </Button>
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
                <>
                  <div className={cn(
                    "relative animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
                    isMobile && "mx--4" // Extend to full width on mobile
                  )}>
                    <CalendlyEmbedOptimized 
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
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Name fields - Stack on mobile */}
            <div className={cn(
              "gap-4",
              isMobile ? "space-y-4" : "grid grid-cols-2"
            )}>
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
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                  autoComplete="given-name"
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
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                  autoComplete="family-name"
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
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                required
                autoComplete="email"
                inputMode="email"
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
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                required
                autoComplete="organization"
              />
            </div>

            {/* Company size and Country - Stack on mobile */}
            <div className={cn(
              "gap-4",
              isMobile ? "space-y-4" : "grid grid-cols-2"
            )}>
              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium text-business-black">
                  # of employees <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.companySize} onValueChange={handleSelectChange("companySize")} required>
                  <SelectTrigger className={cn(
                    "w-full px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green bg-white hover:bg-gray-50 transition-colors",
                    isMobile ? "h-12 text-base" : "h-11"
                  )}>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-64"
                    style={{ zIndex: 9999 }}
                    onOpenAutoFocus={(e) => e.preventDefault()}>
                    {companySizeOptions.map((size) => (
                      <SelectItem 
                        key={size} 
                        value={size}
                        className={cn(
                          "px-3 hover:bg-future-green/10 cursor-pointer text-gray-700 focus:bg-future-green/10 focus:text-business-black",
                          isMobile ? "py-3 text-base" : "py-2"
                        )}
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
                  <SelectTrigger className={cn(
                    "w-full px-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green bg-white hover:bg-gray-50 transition-colors",
                    isMobile ? "h-12 text-base" : "h-11"
                  )}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    "bg-white border border-gray-200 rounded-lg shadow-xl",
                    isMobile ? "max-h-[50vh]" : "max-h-64"
                  )}
                  style={{ zIndex: 9999 }}
                  onOpenAutoFocus={(e) => e.preventDefault()}>
                    {!countrySearch && (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                          Popular Countries
                        </div>
                        {popularCountries.map((country) => (
                          <SelectItem 
                            key={country} 
                            value={country}
                            className={cn(
                              "px-3 hover:bg-future-green/10 cursor-pointer text-gray-700 focus:bg-future-green/10 focus:text-business-black",
                              isMobile ? "py-3 text-base" : "py-2"
                            )}
                          >
                            {country}
                          </SelectItem>
                        ))}
                        <div className="my-1 border-t border-gray-200" />
                      </>
                    )}
                    <div className="sticky top-0 bg-white p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className={cn(
                            "pl-8",
                            isMobile ? "h-10 text-base" : "h-9"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className={cn(
                      "overflow-y-auto",
                      isMobile ? "max-h-[40vh]" : "max-h-56"
                    )}>
                      {allCountries
                        .filter(country => 
                          country.toLowerCase().includes(countrySearch.toLowerCase())
                        )
                        .map((country) => (
                          <SelectItem 
                            key={country} 
                            value={country}
                            className={cn(
                              "px-3 hover:bg-future-green/10 cursor-pointer text-gray-700 focus:bg-future-green/10 focus:text-business-black",
                              isMobile ? "py-3 text-base" : "py-2"
                            )}
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
                className={cn(
                  "flex items-center gap-2 text-business-black/70 hover:text-business-black transition-colors",
                  isMobile ? "text-base py-2" : "text-sm"
                )}
              >
                {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Add optional details
              </button>
            </div>

            {/* Optional Fields */}
            {showOptionalFields && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className={cn(
                  "gap-4",
                  isMobile ? "space-y-4" : "grid grid-cols-2"
                )}>
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
                      className={cn(
                        "w-full px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green",
                        isMobile ? "py-2.5 text-base" : "py-2"
                      )}
                      autoComplete="organization-title"
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
                      className={cn(
                        "w-full px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green",
                        isMobile ? "py-2.5 text-base" : "py-2"
                      )}
                      autoComplete="tel"
                      inputMode="tel"
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
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green resize-none",
                      isMobile ? "text-base min-h-[100px]" : "min-h-[80px]"
                    )}
                    rows={isMobile ? 4 : 3}
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

          <div className={cn(
            "gap-3 pt-4",
            isMobile ? "space-y-3" : "flex"
          )}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className={cn(
                "border-2 border-gray-300 text-business-black hover:bg-gray-50 hover:text-business-black font-medium rounded-xl transition-colors",
                isMobile ? "w-full py-3 text-base" : "flex-1 py-2"
              )}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
                isMobile ? "w-full py-3 text-base" : "flex-1 py-2"
              )}
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
    </>
  );

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent 
          side="bottom"
          className="h-[90vh] overflow-y-auto bg-white rounded-t-2xl"
        >
          <SheetHeader className="text-center pb-4">
            <SheetTitle className="text-xl font-semibold text-business-black font-inter">
              {isSubmitted ? "Thank You!" : "Request a Demo"}
            </SheetTitle>
            <SheetDescription>
              {isSubmitted ? "Schedule your demo meeting" : "See LXERA in action with a personalized demonstration"}
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

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
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default DemoModalOptimized;