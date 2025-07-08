import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

interface OptimizedAnalyticsProps {
  clarityProjectId?: string;
}

export const OptimizedAnalytics = ({ clarityProjectId }: OptimizedAnalyticsProps) => {
  useEffect(() => {
    // Load Microsoft Clarity asynchronously after page load
    if (clarityProjectId && typeof window !== "undefined") {
      // Wait for the page to be fully loaded before initializing analytics
      const loadClarity = () => {
        // Dynamically import Clarity to prevent blocking initial render
        import("@microsoft/clarity").then((Clarity) => {
          Clarity.default.init(clarityProjectId);
        }).catch((error) => {
          console.error("Failed to load Microsoft Clarity:", error);
        });
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadClarity, { timeout: 2000 });
      } else {
        setTimeout(loadClarity, 1);
      }
    }
  }, [clarityProjectId]);

  return (
    <>
      {/* Vercel Analytics and Speed Insights are already optimized for non-blocking loading */}
      <Analytics />
      <SpeedInsights />
    </>
  );
};