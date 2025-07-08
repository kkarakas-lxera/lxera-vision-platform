import { useEffect } from "react";

interface ClarityProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export const ClarityProvider = ({ projectId, children }: ClarityProviderProps) => {
  useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      // Load Clarity asynchronously after page load to avoid blocking
      const loadClarity = () => {
        import("@microsoft/clarity").then((Clarity) => {
          Clarity.default.init(projectId);
        }).catch((error) => {
          console.error("Failed to load Microsoft Clarity:", error);
        });
      };

      // Use requestIdleCallback for better performance
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadClarity, { timeout: 2000 });
      } else {
        // Fallback to setTimeout for browsers that don't support requestIdleCallback
        setTimeout(loadClarity, 1);
      }
    }
  }, [projectId]);

  return <>{children}</>;
};