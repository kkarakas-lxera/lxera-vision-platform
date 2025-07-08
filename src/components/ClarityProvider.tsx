import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

interface ClarityProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export const ClarityProvider = ({ projectId, children }: ClarityProviderProps) => {
  useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      Clarity.init(projectId);
    }
  }, [projectId]);

  return <>{children}</>;
};