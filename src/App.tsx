
// Using Sonner as the primary toast system for better features and consistency
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseGenerationProvider } from "@/contexts/CourseGenerationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ClarityProvider } from "@/components/ClarityProvider";
import HotjarProvider from "@/components/HotjarProvider";
import { lazy, Suspense, useState, useRef, useEffect } from "react";
import Loading from "@/components/Loading";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Mail, User, Users, MessageSquare, Check, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { demoCaptureService } from "@/services/demoCaptureService";
import { toast } from "@/components/ui/sonner";

// Critical pages - loaded synchronously
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import EarlyAccessLogin from "./pages/auth/EarlyAccessLogin";
import AuthCallback from "./pages/auth/AuthCallback";

// Lazy load public/marketing pages
const Pricing = lazy(() => import("./pages/Pricing"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Resources = lazy(() => import("./pages/Resources"));
const Platform = lazy(() => import("./pages/Platform"));

// Lazy load company pages
const About = lazy(() => import("./pages/company/About"));
const Blog = lazy(() => import("./pages/company/Blog"));
const Careers = lazy(() => import("./pages/company/Careers"));
const Contact = lazy(() => import("./pages/company/Contact"));

// Lazy load legal pages
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));

// Lazy load solution pages
const AIPersonalizedLearning = lazy(() => import("./pages/solutions/AIPersonalizedLearning"));
const WorkforceReskilling = lazy(() => import("./pages/solutions/WorkforceReskilling"));
const AIGamificationMotivation = lazy(() => import("./pages/solutions/AIGamificationMotivation"));
const CitizenDeveloperEnablement = lazy(() => import("./pages/solutions/CitizenDeveloperEnablement"));
const LearningAnalytics = lazy(() => import("./pages/solutions/LearningAnalytics"));
const AILearningSupport = lazy(() => import("./pages/solutions/AILearningSupport"));
const EnterpriseInnovation = lazy(() => import("./pages/solutions/EnterpriseInnovation"));
const ScalableLearningSupport = lazy(() => import("./pages/solutions/ScalableLearningSupport"));

// Lazy load platform pages
const HowItWorks = lazy(() => import("./pages/platform/HowItWorks"));
const AIEngine = lazy(() => import("./pages/platform/AIEngine"));
const EngagementInsights = lazy(() => import("./pages/platform/EngagementInsights"));
const InnovationHub = lazy(() => import("./pages/platform/InnovationHub"));
const MentorshipSupport = lazy(() => import("./pages/platform/MentorshipSupport"));
const SecurityPrivacy = lazy(() => import("./pages/platform/SecurityPrivacy"));
const Integrations = lazy(() => import("./pages/platform/Integrations"));

// Lazy load resource pages
const ResourcesBlog = lazy(() => import("./pages/resources/Blog"));
const SuccessStories = lazy(() => import("./pages/resources/SuccessStories"));
const ProductTour = lazy(() => import("./pages/resources/ProductTour"));
const Glossary = lazy(() => import("./pages/resources/Glossary"));

// Lazy load onboarding pages
const EarlyAccess = lazy(() => import("./pages/onboarding/EarlyAccess"));
const EarlyAccessSignup = lazy(() => import("./pages/EarlyAccessSignup"));
const WaitingRoom = lazy(() => import("./pages/WaitingRoom"));

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const CompaniesManagement = lazy(() => import("./pages/admin/companies/CompaniesManagement"));
const UsersManagement = lazy(() => import("./pages/admin/users/UsersManagement"));
const CoursesManagement = lazy(() => import("./pages/admin/courses/CoursesManagement"));
const AnalyticsDashboard = lazy(() => import("./pages/admin/analytics/AnalyticsDashboard"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const CustomerFeedback = lazy(() => import("./pages/admin/CustomerFeedback"));

// Lazy load learner pages
const LearnerDashboard = lazy(() => import("./pages/learner/LearnerDashboard"));
const CourseViewer = lazy(() => import("./pages/learner/CourseViewer"));
const CourseOverview = lazy(() => import("./pages/learner/CourseOverview"));
const MyCourses = lazy(() => import("./pages/learner/MyCourses"));
const ProfileBuilder = lazy(() => import("./pages/learner/ProfileBuilder"));

// Lazy load company dashboard pages
const CompanyDashboard = lazy(() => import("./pages/dashboard/CompanyDashboard"));
const PositionManagement = lazy(() => import("./pages/dashboard/PositionManagement"));
const PositionCreate = lazy(() => import("./pages/dashboard/PositionCreate"));
const EmployeeOnboarding = lazy(() => import("./pages/dashboard/EmployeeOnboarding"));
const Employees = lazy(() => import("./pages/dashboard/Employees"));
const EmployeeProfile = lazy(() => import("./pages/dashboard/EmployeeProfile"));
const Courses = lazy(() => import("./pages/dashboard/Courses"));
const CourseDetails = lazy(() => import("./pages/dashboard/CourseDetails"));

// Lazy load skills pages
const SkillsOverview = lazy(() => import("./pages/dashboard/skills/SkillsOverview"));
const AnalyzedEmployees = lazy(() => import("./pages/dashboard/skills/AnalyzedEmployees"));
const PositionRequirements = lazy(() => import("./pages/dashboard/skills/PositionRequirements"));
const DepartmentSkillsDetail = lazy(() => import("./pages/dashboard/skills/DepartmentSkillsDetail"));

// Lazy load gamification analytics
const GamificationAnalytics = lazy(() => import("./pages/dashboard/GamificationAnalytics"));
const CompanySettings = lazy(() => import("./pages/dashboard/CompanySettings"));
const HRISCallback = lazy(() => import("./pages/dashboard/HRISCallback"));

// Lazy load course generation
const CourseGeneration = lazy(() => import("./pages/dashboard/CourseGenerationTwoColumn"));

const queryClient = new QueryClient();

// Page loading wrapper
const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense 
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading page..." />
      </div>
    }
  >
    {children}
  </Suspense>
);

const App = () => {
  // Global demo modal state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoModalSource, setDemoModalSource] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    companySize: ''
  });
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Global early access modal state
  const [earlyAccessModalOpen, setEarlyAccessModalOpen] = useState(false);
  const [earlyAccessModalSource, setEarlyAccessModalSource] = useState("");
  const [earlyAccessFormData, setEarlyAccessFormData] = useState({
    email: '',
    name: ''
  });
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);
  const earlyAccessEmailRef = useRef<HTMLInputElement>(null);
  const earlyAccessNameRef = useRef<HTMLInputElement>(null);

  // Global contact sales modal state
  const [contactSalesModalOpen, setContactSalesModalOpen] = useState(false);
  const [contactSalesModalSource, setContactSalesModalSource] = useState("");
  const [contactSalesFormData, setContactSalesFormData] = useState({
    email: '',
    name: '',
    company: '',
    teamSize: '',
    message: ''
  });
  const [contactSalesLoading, setContactSalesLoading] = useState(false);
  const [contactSalesSubmitted, setContactSalesSubmitted] = useState(false);
  const [contactSalesErrors, setContactSalesErrors] = useState<Record<string, string>>({});
  const [contactSalesServerError, setContactSalesServerError] = useState<string | null>(null);
  const contactSalesEmailRef = useRef<HTMLInputElement>(null);
  const contactSalesNameRef = useRef<HTMLInputElement>(null);

  const companySizeOptions = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' }
  ];

  const teamSizeOptions = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' }
  ];

  // Common personal/consumer email domains to block
  const BLOCKED_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'me.com', 'protonmail.com', 'tutanota.com', 'yandex.com',
    'mail.com', 'gmx.com', 'zoho.com', 'fastmail.com', 'hushmail.com',
    'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'tempmail.org',
    'throwaway.email', 'maildrop.cc', 'sharklasers.com', 'grr.la'
  ];

  const isCompanyEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !BLOCKED_DOMAINS.includes(domain);
  };

  // Auto-save and restore form data
  useEffect(() => {
    if (formData.email) {
      localStorage.setItem('demo_progress', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    const saved = localStorage.getItem('demo_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
    }
  }, []);

  // Focus management for demo modal - only focus on initial open
  useEffect(() => {
    if (demoModalOpen) {
      // Only focus on the first field when modal opens
      if (emailRef.current) {
        emailRef.current.focus();
      }
    }
  }, [demoModalOpen]);

  // Auto-save and restore early access form data
  useEffect(() => {
    if (earlyAccessFormData.email) {
      localStorage.setItem('early_access_progress', JSON.stringify(earlyAccessFormData));
    }
  }, [earlyAccessFormData]);

  useEffect(() => {
    const saved = localStorage.getItem('early_access_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEarlyAccessFormData(parsed);
    }
  }, []);

  // Auto-save and restore contact sales form data
  useEffect(() => {
    if (contactSalesFormData.email) {
      localStorage.setItem('contact_sales_progress', JSON.stringify(contactSalesFormData));
    }
  }, [contactSalesFormData]);

  useEffect(() => {
    const saved = localStorage.getItem('contact_sales_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setContactSalesFormData(parsed);
    }
  }, []);

  // Focus management for contact sales modal - only focus on initial open
  useEffect(() => {
    if (contactSalesModalOpen) {
      // Only focus on the first field when modal opens
      if (contactSalesEmailRef.current) {
        contactSalesEmailRef.current.focus();
      }
    }
  }, [contactSalesModalOpen]);

  const validateContactSalesForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email format
    if (!contactSalesFormData.email || !contactSalesFormData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!isCompanyEmail(contactSalesFormData.email)) {
      newErrors.email = 'Please use your company email address';
    }
    
    // Validate required fields
    if (!contactSalesFormData.name || contactSalesFormData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name';
    }
    
    if (!contactSalesFormData.company || contactSalesFormData.company.trim().length < 2) {
      newErrors.company = 'Please enter your company name';
    }
    
    if (!contactSalesFormData.teamSize) {
      newErrors.teamSize = 'Please select your team size';
    }
    
    setContactSalesErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setContactSalesErrors({});
    setContactSalesServerError(null);
    
    // Validate form
    if (!validateContactSalesForm()) {
      return;
    }

    setContactSalesLoading(true);

    try {
      // Submit to capture-contact-sales edge function
      const response = await supabase.functions.invoke('capture-contact-sales', {
        body: {
          email: contactSalesFormData.email,
          name: contactSalesFormData.name.trim(),
          company: contactSalesFormData.company.trim(),
          teamSize: contactSalesFormData.teamSize,
          message: contactSalesFormData.message.trim() || null,
          source: contactSalesModalSource,
          utmSource: new URLSearchParams(window.location.search).get('utm_source'),
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
        }
      });

      if (response.error) throw response.error;

      const data = response.data as any;

      if (data.success) {
        setContactSalesSubmitted(true);
        
        toast.success('Message Sent!', {
          description: 'Our sales team will contact you within 24 hours.',
        });

        localStorage.removeItem('contact_sales_progress');
        
        // Reset form after delay
        setTimeout(() => {
          setContactSalesFormData({
            email: '',
            name: '',
            company: '',
            teamSize: '',
            message: ''
          });
          setContactSalesModalOpen(false);
          setContactSalesSubmitted(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting contact sales:', error);
      
      toast.error('Error', {
        description: error.message || 'Something went wrong. Please try again.',
      });
      
      setContactSalesServerError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setContactSalesLoading(false);
    }
  };

  const openDemoModal = (source: string) => {
    setDemoModalSource(source);
    setDemoModalOpen(true);
  };

  const openEarlyAccessModal = (source: string) => {
    setEarlyAccessModalSource(source);
    setEarlyAccessModalOpen(true);
  };

  const openContactSalesModal = (source: string) => {
    setContactSalesModalSource(source);
    setContactSalesModalOpen(true);
    setContactSalesSubmitted(false);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid work email');
      return;
    }

    // Check for company email
    if (!isCompanyEmail(formData.email)) {
      toast.error('Please use your company email address');
      return;
    }

    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.companySize) {
      toast.error('Please select your company size');
      return;
    }

    setLoading(true);

    try {
      const domain = formData.email.split('@')[1];
      const companyName = domain.split('.')[0];
      const company = formData.company || companyName.charAt(0).toUpperCase() + companyName.slice(1);
      
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      await demoCaptureService.captureDemo({
        email: formData.email,
        name: formData.name.trim(),
        company,
        companySize: formData.companySize,
        source: demoModalSource,
        stepCompleted: 2,
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
      });

      const emailResult = await supabase.functions.invoke('send-demo-email', {
        body: {
          email: formData.email,
          firstName,
          lastName,
          company,
          companySize: formData.companySize
        }
      });

      if (emailResult.error) {
        console.error('Failed to send demo email:', emailResult.error);
      }
      
      localStorage.removeItem('demo_progress');
      
      setDemoModalOpen(false);
      
      toast.success('Check Your Email!', {
        description: 'We sent you a link to schedule your demo.',
      });

      // Reset form
      setFormData({
        email: '',
        name: '',
        company: '',
        companySize: ''
      });
    } catch (error: any) {
      console.error('Demo request submission failed:', error);
      toast.error('Submission Failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEarlyAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!earlyAccessFormData.email || !earlyAccessFormData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for company email
    if (!isCompanyEmail(earlyAccessFormData.email)) {
      toast.error('Please use your company email address');
      return;
    }

    // Validate name
    if (!earlyAccessFormData.name || earlyAccessFormData.name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    setEarlyAccessLoading(true);

    try {
      const response = await supabase.functions.invoke('capture-email', {
        body: {
          email: earlyAccessFormData.email,
          name: earlyAccessFormData.name.trim(),
          source: earlyAccessModalSource,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
        }
      });

      if (response.error) throw response.error;

      const data = response.data as any;

      if (data.success) {
        localStorage.removeItem('early_access_progress');
        
        setEarlyAccessModalOpen(false);
        
        toast.success('Check Your Email!', {
          description: 'We sent you a magic link to complete your profile.',
        });

        // Reset form
        setEarlyAccessFormData({
          email: '',
          name: ''
        });
      }
    } catch (error: any) {
      console.error('Error capturing email:', error);
      toast.error('Error', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setEarlyAccessLoading(false);
    }
  };

  return (
    <>
      {/* Global Demo Modal */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="font-semibold text-lg text-business-black">Book Your Demo</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">See how LXERA can transform your workforce</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={emailRef}
                type="email"
                value={formData.email}
                onChange={(e)=>setFormData(prev=>({...prev,email:e.target.value}))}
                placeholder="Enter your work email"
                className="w-full h-12 text-base border-gray-300 pl-10 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
                autoComplete="email" 
                inputMode="email"
                disabled={loading}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                ref={nameRef}
                value={formData.name}
                onChange={(e)=>setFormData(prev=>({...prev,name:e.target.value}))}
                placeholder="Your full name"
                className="w-full h-12 text-base border-gray-300 pl-10 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
                autoComplete="name"
                disabled={loading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Select 
                value={formData.companySize} 
                onValueChange={(v)=>{
                  setFormData(prev=>({...prev,companySize:v}));
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-12 text-base bg-white border-gray-300 pl-10 focus:border-future-green focus:ring-future-green focus:ring-opacity-50 hover:border-gray-400">
                  <SelectValue placeholder="Number of employees" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg">
                  {companySizeOptions.map(opt=>(
                    <SelectItem 
                      key={opt.value} 
                      value={opt.value}
                      className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                    >
                      {opt.label} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading||!formData.email||!formData.name||!formData.companySize} 
              className="w-full h-12 bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Booking...</span>
                </span>
              ) : (
                'Book Demo'
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Enterprise ready • Quick 15-min call • No obligation
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Early Access Modal */}
      <Dialog open={earlyAccessModalOpen} onOpenChange={setEarlyAccessModalOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="font-semibold text-lg text-business-black">Get Early Access</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">Enter your work email and name to continue</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEarlyAccessSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={earlyAccessEmailRef}
                type="email"
                value={earlyAccessFormData.email}
                onChange={(e) => setEarlyAccessFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your work email"
                className="w-full h-12 text-base border-gray-300 pl-10 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
                autoComplete="email"
                inputMode="email"
                disabled={earlyAccessLoading}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                ref={earlyAccessNameRef}
                type="text"
                value={earlyAccessFormData.name}
                onChange={(e) => setEarlyAccessFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full h-12 text-base border-gray-300 pl-10 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
                autoComplete="name"
                disabled={earlyAccessLoading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <Button 
              type="submit" 
              disabled={earlyAccessLoading || !earlyAccessFormData.email || !earlyAccessFormData.name}
              className="w-full h-12 bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-full"
            >
              {earlyAccessLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </span>
              ) : (
                'Get Access'
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Work email required • No spam, ever
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Contact Sales Modal */}
      <Dialog open={contactSalesModalOpen} onOpenChange={setContactSalesModalOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="font-semibold text-lg text-business-black">
              {contactSalesSubmitted ? "Thank You!" : "Contact Sales"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              {contactSalesSubmitted ? "We'll be in touch soon!" : "Let's discuss how LXERA can work for your team"}
            </DialogDescription>
          </DialogHeader>
          
          {contactSalesSubmitted ? (
            <div className="text-center py-4">
              <div className="w-full py-4 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Success! Check your email.</span>
              </div>
            </div>
          ) : (
            <>

              {contactSalesServerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{contactSalesServerError}</p>
                </div>
              )}

              <form onSubmit={handleContactSalesSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    ref={contactSalesEmailRef}
                    type="email"
                    value={contactSalesFormData.email}
                    onChange={(e) => {
                      setContactSalesFormData(prev => ({ ...prev, email: e.target.value }));
                      if (contactSalesErrors.email) setContactSalesErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="Enter your work email"
                    className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-colors duration-200"
                    disabled={contactSalesLoading}
                    inputMode="email"
                    autoComplete="email"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {contactSalesErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{contactSalesErrors.email}</p>
                  )}
                </div>
                
                <div className="relative">
                  <Input
                    ref={contactSalesNameRef}
                    type="text"
                    value={contactSalesFormData.name}
                    onChange={(e) => {
                      setContactSalesFormData(prev => ({ ...prev, name: e.target.value }));
                      if (contactSalesErrors.name) setContactSalesErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Your full name"
                    className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-colors duration-200"
                    disabled={contactSalesLoading}
                    autoComplete="name"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {contactSalesErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{contactSalesErrors.name}</p>
                  )}
                </div>
                
                <div className="relative">
                  <Input
                    type="text"
                    value={contactSalesFormData.company}
                    onChange={(e) => {
                      setContactSalesFormData(prev => ({ ...prev, company: e.target.value }));
                      if (contactSalesErrors.company) setContactSalesErrors(prev => ({ ...prev, company: '' }));
                    }}
                    placeholder="Company name"
                    className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-colors duration-200"
                    disabled={contactSalesLoading}
                    autoComplete="organization"
                  />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {contactSalesErrors.company && (
                    <p className="text-red-500 text-xs mt-1">{contactSalesErrors.company}</p>
                  )}
                </div>
                
                <div className="relative">
                  <Select 
                    value={contactSalesFormData.teamSize} 
                    onValueChange={(value) => {
                      setContactSalesFormData(prev => ({ ...prev, teamSize: value }));
                      if (contactSalesErrors.teamSize) setContactSalesErrors(prev => ({ ...prev, teamSize: '' }));
                    }}
                    disabled={contactSalesLoading}
                  >
                    <SelectTrigger className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-colors duration-200">
                      <SelectValue placeholder="Team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  {contactSalesErrors.teamSize && (
                    <p className="text-red-500 text-xs mt-1">{contactSalesErrors.teamSize}</p>
                  )}
                </div>
                
                <div className="relative">
                  <Textarea
                    value={contactSalesFormData.message}
                    onChange={(e) => setContactSalesFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your needs (optional)"
                    className="w-full min-h-[80px] text-base pl-10 pt-3 border-2 border-gray-300 focus:border-business-black transition-all duration-200 resize-none"
                    disabled={contactSalesLoading}
                    rows={3}
                  />
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={contactSalesLoading}
                  className="w-full py-4 rounded-xl font-semibold text-base bg-business-black hover:bg-business-black/90 text-white transition-all duration-300 hover:shadow-lg"
                >
                  {contactSalesLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span>Send Message</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  Work email required • We'll respond within 24 hours
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner position="top-right" richColors closeButton />
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <CourseGenerationProvider>
                  <Routes>
            {/* Public routes - Pass openDemoModal and openEarlyAccessModal to pages that need them */}
            <Route path="/" element={<Index openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} />} />
            <Route path="/pricing" element={<PageSuspense><Pricing openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/solutions" element={<PageSuspense><Solutions openDemoModal={openDemoModal} /></PageSuspense>} />
            <Route path="/platform" element={<PageSuspense><Platform openDemoModal={openDemoModal} /></PageSuspense>} />
            <Route path="/resources" element={<PageSuspense><Resources /></PageSuspense>} />
            <Route path="/company/about" element={<PageSuspense><About openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/company/blog" element={<PageSuspense><Blog /></PageSuspense>} />
            <Route path="/company/careers" element={<PageSuspense><Careers /></PageSuspense>} />
            <Route path="/company/contact" element={<PageSuspense><Contact openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/legal/privacy" element={<PageSuspense><PrivacyPolicy /></PageSuspense>} />
            <Route path="/legal/terms" element={<PageSuspense><TermsOfService /></PageSuspense>} />
            <Route path="/legal/cookies" element={<PageSuspense><CookiePolicy /></PageSuspense>} />

            {/* Solution routes */}
            <Route path="/solutions/ai-personalized-learning" element={<PageSuspense><AIPersonalizedLearning openEarlyAccessModal={openEarlyAccessModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/solutions/workforce-reskilling-upskilling" element={<PageSuspense><WorkforceReskilling openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/solutions/ai-gamification-motivation" element={<PageSuspense><AIGamificationMotivation openEarlyAccessModal={openEarlyAccessModal} /></PageSuspense>} />
            <Route path="/solutions/citizen-led-innovation" element={<PageSuspense><CitizenDeveloperEnablement openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/solutions/learning-analytics-engagement" element={<PageSuspense><LearningAnalytics openDemoModal={openDemoModal} /></PageSuspense>} />
            <Route path="/solutions/ai-mentorship-support" element={<PageSuspense><AILearningSupport openEarlyAccessModal={openEarlyAccessModal} /></PageSuspense>} />
            <Route path="/solutions/enterprise-innovation-enablement" element={<PageSuspense><EnterpriseInnovation openEarlyAccessModal={openEarlyAccessModal} /></PageSuspense>} />
            <Route path="/solutions/scalable-learning-support" element={<PageSuspense><ScalableLearningSupport openContactSalesModal={openContactSalesModal} /></PageSuspense>} />

            {/* Platform routes */}
            <Route path="/platform/how-it-works" element={<PageSuspense><HowItWorks openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/ai-engine" element={<PageSuspense><AIEngine openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/engagement-insights" element={<PageSuspense><EngagementInsights openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/innovation-hub" element={<PageSuspense><InnovationHub openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/mentorship-support" element={<PageSuspense><MentorshipSupport openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/security-privacy" element={<PageSuspense><SecurityPrivacy openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />
            <Route path="/platform/integrations" element={<PageSuspense><Integrations openDemoModal={openDemoModal} openContactSalesModal={openContactSalesModal} /></PageSuspense>} />

            {/* Resource routes */}
            <Route path="/resources/blog" element={<PageSuspense><ResourcesBlog /></PageSuspense>} />
            <Route path="/resources/success-stories" element={<PageSuspense><SuccessStories /></PageSuspense>} />
            <Route path="/resources/product-tour" element={<PageSuspense><ProductTour openDemoModal={openDemoModal} openEarlyAccessModal={openEarlyAccessModal} /></PageSuspense>} />
            <Route path="/resources/glossary" element={<PageSuspense><Glossary /></PageSuspense>} />

            {/* Auth routes */}
            <Route path="/login" element={<EarlyAccessLogin />} />
            <Route path="/admin-login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Onboarding routes */}
            <Route path="/onboarding/early-access" element={<PageSuspense><EarlyAccess /></PageSuspense>} />
            <Route path="/early-access" element={<PageSuspense><EarlyAccessSignup openEarlyAccessModal={openEarlyAccessModal} /></PageSuspense>} />
            <Route path="/waiting-room" element={<PageSuspense><WaitingRoom /></PageSuspense>} />

            {/* Protected admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<PageSuspense><AdminDashboard /></PageSuspense>} />
                      <Route path="/leads" element={<PageSuspense><Leads /></PageSuspense>} />
                      <Route path="/companies" element={<PageSuspense><CompaniesManagement /></PageSuspense>} />
                      <Route path="/users" element={<PageSuspense><UsersManagement /></PageSuspense>} />
                      <Route path="/courses" element={<PageSuspense><CoursesManagement /></PageSuspense>} />
                      <Route path="/analytics" element={<PageSuspense><AnalyticsDashboard /></PageSuspense>} />
                      <Route path="/settings" element={<PageSuspense><Settings /></PageSuspense>} />
                      <Route path="/feedback" element={<PageSuspense><CustomerFeedback /></PageSuspense>} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected company admin routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['company_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<PageSuspense><CompanyDashboard /></PageSuspense>} />
                      <Route path="/onboarding/*" element={<PageSuspense><EmployeeOnboarding /></PageSuspense>} />
                      <Route path="/positions" element={<PageSuspense><PositionManagement /></PageSuspense>} />
                      <Route path="/positions/new" element={<PageSuspense><PositionCreate /></PageSuspense>} />
                      <Route path="/employees" element={<PageSuspense><Employees /></PageSuspense>} />
                      <Route path="/employees/:employeeId" element={<PageSuspense><EmployeeProfile /></PageSuspense>} />
                      <Route path="/courses" element={<PageSuspense><Courses /></PageSuspense>} />
                      <Route path="/courses/:courseId" element={<PageSuspense><CourseDetails /></PageSuspense>} />
                      <Route path="/skills" element={<PageSuspense><SkillsOverview /></PageSuspense>} />
                      <Route path="/skills/employees" element={<PageSuspense><AnalyzedEmployees /></PageSuspense>} />
                      <Route path="/skills/positions" element={<PageSuspense><PositionRequirements /></PageSuspense>} />
                      <Route path="/skills/department/:department" element={<PageSuspense><DepartmentSkillsDetail /></PageSuspense>} />
                      <Route path="/analytics" element={<PageSuspense><GamificationAnalytics /></PageSuspense>} />
                      <Route path="/course-generation" element={<PageSuspense><CourseGeneration /></PageSuspense>} />
                      <Route path="/settings" element={<PageSuspense><CompanySettings /></PageSuspense>} />
                      <Route path="/settings/hris-callback" element={<PageSuspense><HRISCallback /></PageSuspense>} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected learner routes */}
            <Route
              path="/learner/*"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <Routes>
                    <Route path="/course/:courseId" element={<PageSuspense><CourseViewer /></PageSuspense>} />
                    <Route path="/course/:courseId/overview" element={<PageSuspense><CourseOverview /></PageSuspense>} />
                    <Route path="/course/:courseId/module/:moduleId" element={<PageSuspense><CourseViewer /></PageSuspense>} />
                    <Route path="/*" element={
                      <DashboardLayout>
                        <Routes>
                          <Route path="/" element={<PageSuspense><LearnerDashboard /></PageSuspense>} />
                          <Route path="/courses" element={<PageSuspense><MyCourses /></PageSuspense>} />
                          <Route path="/profile" element={<PageSuspense><ProfileBuilder /></PageSuspense>} />
                          <Route path="/certificates" element={<PageSuspense><div>My Certificates - Coming Soon</div></PageSuspense>} />
                        </Routes>
                      </DashboardLayout>
                    } />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
                </Routes>
              </CourseGenerationProvider>
            </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
          <ClarityProvider projectId="sbjtfdiclk">
            <HotjarProvider siteId={6458736}>
              <Analytics />
              <SpeedInsights />
            </HotjarProvider>
          </ClarityProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
    </>
  );
};

export default App;
