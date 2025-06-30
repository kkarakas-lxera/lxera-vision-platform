
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseGenerationProvider } from "@/contexts/CourseGenerationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";


// Import existing pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Solutions from "./pages/Solutions";
import Resources from "./pages/Resources";
import About from "./pages/company/About";
import Blog from "./pages/company/Blog";
import Careers from "./pages/company/Careers";
import Contact from "./pages/company/Contact";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";

// Import solution pages
import AIPersonalizedLearning from "./pages/solutions/AIPersonalizedLearning";
import WorkforceReskilling from "./pages/solutions/WorkforceReskilling";
import AIGamificationMotivation from "./pages/solutions/AIGamificationMotivation";
import CitizenDeveloperEnablement from "./pages/solutions/CitizenDeveloperEnablement";
import LearningAnalytics from "./pages/solutions/LearningAnalytics";
import AILearningSupport from "./pages/solutions/AILearningSupport";
import EnterpriseInnovation from "./pages/solutions/EnterpriseInnovation";
import ScalableLearningSupport from "./pages/solutions/ScalableLearningSupport";

// Import platform pages
import HowItWorks from "./pages/platform/HowItWorks";
import AIEngine from "./pages/platform/AIEngine";
import EngagementInsights from "./pages/platform/EngagementInsights";
import InnovationHub from "./pages/platform/InnovationHub";
import MentorshipSupport from "./pages/platform/MentorshipSupport";
import SecurityPrivacy from "./pages/platform/SecurityPrivacy";
import Integrations from "./pages/platform/Integrations";

// Import resource pages
import ResourcesBlog from "./pages/resources/Blog";
import SuccessStories from "./pages/resources/SuccessStories";
import ProductTour from "./pages/resources/ProductTour";
import Glossary from "./pages/resources/Glossary";

// Import auth pages
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Import learner pages
import LearnerDashboard from "./pages/learner/LearnerDashboard";
import CourseViewer from "./pages/learner/CourseViewer";
import CourseOverview from "./pages/learner/CourseOverview";
import CourseDisplay from "./pages/learner/CourseDisplay";
import MyCourses from "./pages/learner/MyCourses";

// Import admin pages
import CompaniesManagement from "./pages/admin/companies/CompaniesManagement";
import UsersManagement from "./pages/admin/users/UsersManagement";
import CoursesManagement from "./pages/admin/courses/CoursesManagement";

// Import company dashboard pages
import CompanyDashboard from "./pages/dashboard/CompanyDashboard";
import PositionManagement from "./pages/dashboard/PositionManagement";
import EmployeeOnboarding from "./pages/dashboard/EmployeeOnboarding";
import Employees from "./pages/dashboard/Employees";
import EmployeeProfile from "./pages/dashboard/EmployeeProfile";
import Courses from "./pages/dashboard/Courses";
import CourseDetails from "./pages/dashboard/CourseDetails";

// Import skills pages
import SkillsOverview from "./pages/dashboard/skills/SkillsOverview";
import AnalyzedEmployees from "./pages/dashboard/skills/AnalyzedEmployees";
import PositionRequirements from "./pages/dashboard/skills/PositionRequirements";
import DepartmentSkillsDetail from "./pages/dashboard/skills/DepartmentSkillsDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CourseGenerationProvider>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/company/about" element={<About />} />
            <Route path="/company/blog" element={<Blog />} />
            <Route path="/company/careers" element={<Careers />} />
            <Route path="/company/contact" element={<Contact />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />

            {/* Solution routes */}
            <Route path="/solutions/ai-personalized-learning" element={<AIPersonalizedLearning />} />
            <Route path="/solutions/workforce-reskilling-upskilling" element={<WorkforceReskilling />} />
            <Route path="/solutions/ai-gamification-motivation" element={<AIGamificationMotivation />} />
            <Route path="/solutions/citizen-led-innovation" element={<CitizenDeveloperEnablement />} />
            <Route path="/solutions/learning-analytics-engagement" element={<LearningAnalytics />} />
            <Route path="/solutions/ai-mentorship-support" element={<AILearningSupport />} />
            <Route path="/solutions/enterprise-innovation-enablement" element={<EnterpriseInnovation />} />
            <Route path="/solutions/scalable-learning-support" element={<ScalableLearningSupport />} />

            {/* Platform routes */}
            <Route path="/platform/how-it-works" element={<HowItWorks />} />
            <Route path="/platform/ai-engine" element={<AIEngine />} />
            <Route path="/platform/engagement-insights" element={<EngagementInsights />} />
            <Route path="/platform/innovation-hub" element={<InnovationHub />} />
            <Route path="/platform/mentorship-support" element={<MentorshipSupport />} />
            <Route path="/platform/security-privacy" element={<SecurityPrivacy />} />
            <Route path="/platform/integrations" element={<Integrations />} />

            {/* Resource routes */}
            <Route path="/resources/blog" element={<ResourcesBlog />} />
            <Route path="/resources/success-stories" element={<SuccessStories />} />
            <Route path="/resources/product-tour" element={<ProductTour />} />
            <Route path="/resources/glossary" element={<Glossary />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/companies" element={<CompaniesManagement />} />
                      <Route path="/users" element={<UsersManagement />} />
                      <Route path="/courses" element={<CoursesManagement />} />
                      <Route path="/analytics" element={<div>Analytics Dashboard Coming Soon</div>} />
                      <Route path="/settings" element={<div>Settings Page Coming Soon</div>} />
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
                      <Route path="/" element={<CompanyDashboard />} />
                      <Route path="/onboarding" element={<EmployeeOnboarding />} />
                      <Route path="/positions" element={<PositionManagement />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/employees/:employeeId" element={<EmployeeProfile />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/:courseId" element={<CourseDetails />} />
                      <Route path="/skills" element={<SkillsOverview />} />
                      <Route path="/skills/employees" element={<AnalyzedEmployees />} />
                      <Route path="/skills/positions" element={<PositionRequirements />} />
                      <Route path="/skills/department/:department" element={<DepartmentSkillsDetail />} />
                      <Route path="/analytics" element={<div>Analytics - Coming Soon</div>} />
                      <Route path="/settings" element={<div>Company Settings</div>} />
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
                    <Route path="/course/:courseId" element={<CourseDisplay />} />
                    <Route path="/course/:courseId/overview" element={<CourseOverview />} />
                    <Route path="/course/:courseId/module/:moduleId" element={<CourseViewer />} />
                    <Route path="/*" element={
                      <DashboardLayout>
                        <Routes>
                          <Route path="/" element={<LearnerDashboard />} />
                          <Route path="/courses" element={<MyCourses />} />
                          <Route path="/certificates" element={<div>My Certificates - Coming Soon</div>} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
