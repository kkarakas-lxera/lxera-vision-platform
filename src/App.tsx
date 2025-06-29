
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

// Import auth pages
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Import learner pages
import LearnerDashboard from "./pages/learner/LearnerDashboard";
import CourseViewer from "./pages/learner/CourseViewer";
import CourseOverview from "./pages/learner/CourseOverview";

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

// Import skills pages
import SkillsOverview from "./pages/dashboard/skills/SkillsOverview";
import AnalyzedEmployees from "./pages/dashboard/skills/AnalyzedEmployees";
import PositionRequirements from "./pages/dashboard/skills/PositionRequirements";

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
                      <Route path="/skills" element={<SkillsOverview />} />
                      <Route path="/skills/employees" element={<AnalyzedEmployees />} />
                      <Route path="/skills/positions" element={<PositionRequirements />} />
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
                    <Route path="/course/:courseId" element={<CourseOverview />} />
                    <Route path="/course/:courseId/module/:moduleId" element={<CourseViewer />} />
                    <Route path="/*" element={
                      <DashboardLayout>
                        <Routes>
                          <Route path="/" element={<LearnerDashboard />} />
                          <Route path="/courses" element={<div>My Courses - Coming Soon</div>} />
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
