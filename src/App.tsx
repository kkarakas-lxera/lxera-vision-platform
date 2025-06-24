
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import LearnDashboard from "./pages/learn/LearnDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
                      <Route path="/companies" element={<div>Companies Management</div>} />
                      <Route path="/users" element={<div>Users Management</div>} />
                      <Route path="/courses" element={<div>Courses Management</div>} />
                      <Route path="/analytics" element={<div>Analytics</div>} />
                      <Route path="/settings" element={<div>Settings</div>} />
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
                      <Route path="/" element={<div>Company Dashboard</div>} />
                      <Route path="/employees" element={<div>Employee Management</div>} />
                      <Route path="/courses" element={<div>Course Management</div>} />
                      <Route path="/analytics" element={<div>Company Analytics</div>} />
                      <Route path="/settings" element={<div>Company Settings</div>} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected learner routes */}
            <Route
              path="/learn/*"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<LearnDashboard />} />
                      <Route path="/courses" element={<div>My Courses</div>} />
                      <Route path="/progress" element={<div>Learning Progress</div>} />
                      <Route path="/certificates" element={<div>My Certificates</div>} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
