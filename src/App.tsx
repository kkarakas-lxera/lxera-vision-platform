
import { Toaster } from "@/components/ui/toaster";
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
import { lazy, Suspense } from "react";
import Loading from "@/components/Loading";

// Critical pages - loaded synchronously
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
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

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Tickets = lazy(() => import("./pages/admin/Tickets"));
const CompaniesManagement = lazy(() => import("./pages/admin/companies/CompaniesManagement"));
const UsersManagement = lazy(() => import("./pages/admin/users/UsersManagement"));
const CoursesManagement = lazy(() => import("./pages/admin/courses/CoursesManagement"));
const AnalyticsDashboard = lazy(() => import("./pages/admin/analytics/AnalyticsDashboard"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const CustomerFeedback = lazy(() => import("./pages/admin/CustomerFeedback"));
const DemoRequests = lazy(() => import("./pages/admin/DemoRequests"));

// Lazy load learner pages
const LearnerDashboard = lazy(() => import("./pages/learner/LearnerDashboard"));
const CourseViewer = lazy(() => import("./pages/learner/CourseViewer"));
const CourseOverview = lazy(() => import("./pages/learner/CourseOverview"));
const MyCourses = lazy(() => import("./pages/learner/MyCourses"));

// Lazy load company dashboard pages
const CompanyDashboard = lazy(() => import("./pages/dashboard/CompanyDashboard"));
const PositionManagement = lazy(() => import("./pages/dashboard/PositionManagement"));
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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <CourseGenerationProvider>
                  <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<PageSuspense><Pricing /></PageSuspense>} />
            <Route path="/solutions" element={<PageSuspense><Solutions /></PageSuspense>} />
            <Route path="/platform" element={<PageSuspense><Platform /></PageSuspense>} />
            <Route path="/resources" element={<PageSuspense><Resources /></PageSuspense>} />
            <Route path="/company/about" element={<PageSuspense><About /></PageSuspense>} />
            <Route path="/company/blog" element={<PageSuspense><Blog /></PageSuspense>} />
            <Route path="/company/careers" element={<PageSuspense><Careers /></PageSuspense>} />
            <Route path="/company/contact" element={<PageSuspense><Contact /></PageSuspense>} />
            <Route path="/legal/privacy" element={<PageSuspense><PrivacyPolicy /></PageSuspense>} />
            <Route path="/legal/terms" element={<PageSuspense><TermsOfService /></PageSuspense>} />
            <Route path="/legal/cookies" element={<PageSuspense><CookiePolicy /></PageSuspense>} />

            {/* Solution routes */}
            <Route path="/solutions/ai-personalized-learning" element={<PageSuspense><AIPersonalizedLearning /></PageSuspense>} />
            <Route path="/solutions/workforce-reskilling-upskilling" element={<PageSuspense><WorkforceReskilling /></PageSuspense>} />
            <Route path="/solutions/ai-gamification-motivation" element={<PageSuspense><AIGamificationMotivation /></PageSuspense>} />
            <Route path="/solutions/citizen-led-innovation" element={<PageSuspense><CitizenDeveloperEnablement /></PageSuspense>} />
            <Route path="/solutions/learning-analytics-engagement" element={<PageSuspense><LearningAnalytics /></PageSuspense>} />
            <Route path="/solutions/ai-mentorship-support" element={<PageSuspense><AILearningSupport /></PageSuspense>} />
            <Route path="/solutions/enterprise-innovation-enablement" element={<PageSuspense><EnterpriseInnovation /></PageSuspense>} />
            <Route path="/solutions/scalable-learning-support" element={<PageSuspense><ScalableLearningSupport /></PageSuspense>} />

            {/* Platform routes */}
            <Route path="/platform/how-it-works" element={<PageSuspense><HowItWorks /></PageSuspense>} />
            <Route path="/platform/ai-engine" element={<PageSuspense><AIEngine /></PageSuspense>} />
            <Route path="/platform/engagement-insights" element={<PageSuspense><EngagementInsights /></PageSuspense>} />
            <Route path="/platform/innovation-hub" element={<PageSuspense><InnovationHub /></PageSuspense>} />
            <Route path="/platform/mentorship-support" element={<PageSuspense><MentorshipSupport /></PageSuspense>} />
            <Route path="/platform/security-privacy" element={<PageSuspense><SecurityPrivacy /></PageSuspense>} />
            <Route path="/platform/integrations" element={<PageSuspense><Integrations /></PageSuspense>} />

            {/* Resource routes */}
            <Route path="/resources/blog" element={<PageSuspense><ResourcesBlog /></PageSuspense>} />
            <Route path="/resources/success-stories" element={<PageSuspense><SuccessStories /></PageSuspense>} />
            <Route path="/resources/product-tour" element={<PageSuspense><ProductTour /></PageSuspense>} />
            <Route path="/resources/glossary" element={<PageSuspense><Glossary /></PageSuspense>} />

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
                      <Route path="/" element={<PageSuspense><AdminDashboard /></PageSuspense>} />
                      <Route path="/tickets" element={<PageSuspense><Tickets /></PageSuspense>} />
                      <Route path="/companies" element={<PageSuspense><CompaniesManagement /></PageSuspense>} />
                      <Route path="/users" element={<PageSuspense><UsersManagement /></PageSuspense>} />
                      <Route path="/courses" element={<PageSuspense><CoursesManagement /></PageSuspense>} />
                      <Route path="/analytics" element={<PageSuspense><AnalyticsDashboard /></PageSuspense>} />
                      <Route path="/settings" element={<PageSuspense><Settings /></PageSuspense>} />
                      <Route path="/feedback" element={<PageSuspense><CustomerFeedback /></PageSuspense>} />
                      <Route path="/demo-requests" element={<PageSuspense><DemoRequests /></PageSuspense>} />
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
                      <Route path="/onboarding" element={<PageSuspense><EmployeeOnboarding /></PageSuspense>} />
                      <Route path="/positions" element={<PageSuspense><PositionManagement /></PageSuspense>} />
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
                      <Route path="/settings" element={<PageSuspense><div>Company Settings</div></PageSuspense>} />
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
  );
};

export default App;
