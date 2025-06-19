
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Solutions from "./pages/Solutions";
import AIPersonalizedLearning from "./pages/solutions/AIPersonalizedLearning";
import WorkforceReskilling from "./pages/solutions/WorkforceReskilling";
import CitizenDeveloperEnablement from "./pages/solutions/CitizenDeveloperEnablement";
import LearningAnalytics from "./pages/solutions/LearningAnalytics";
import ScalableLearningSupport from "./pages/solutions/ScalableLearningSupport";
import EnterpriseInnovation from "./pages/solutions/EnterpriseInnovation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/solutions/ai-personalized-learning" element={<AIPersonalizedLearning />} />
            <Route path="/solutions/workforce-reskilling-upskilling" element={<WorkforceReskilling />} />
            <Route path="/solutions/citizen-developer-enablement" element={<CitizenDeveloperEnablement />} />
            <Route path="/solutions/learning-analytics-insights" element={<LearningAnalytics />} />
            <Route path="/solutions/scalable-learning-support-mentorship" element={<ScalableLearningSupport />} />
            <Route path="/solutions/enterprise-innovation-enablement" element={<EnterpriseInnovation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
