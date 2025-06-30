import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { EmployeeRecord } from '@/services/employeeService';
import { createCVProcessingService } from '@/services/cv/CVProcessingService';
import { useUser } from '@supabase/auth-helpers-react';

interface UseEnhancedOnboardingProps {
  employee: EmployeeRecord | null;
  cvFile: File | null;
  cvText: string;
  isCVUploaded: boolean;
  setIsCVUploaded: (value: boolean) => void;
}

const useEnhancedOnboarding = ({
  employee,
  cvFile,
  cvText,
  isCVUploaded,
  setIsCVUploaded,
}: UseEnhancedOnboardingProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const user = useUser();

  useEffect(() => {
    const analyzeCV = async () => {
      if (!employee || !cvFile || !cvText || !user) {
        return;
      }

      setIsAnalyzing(true);
      try {
        const cvService = createCVProcessingService(user.company_id);

        // Read the file content as a data URL
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target?.result as string;
          const fileName = cvFile.name;
          const fileSize = cvFile.size;

          // Store CV data in the database
          await cvService.storeCVData(employee.id, fileName, fileData, fileSize);

          toast({
            title: "CV Uploaded and Stored!",
            description: "Your CV has been successfully uploaded and stored.",
          });
          setIsCVUploaded(true);
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast({
            title: "Error Reading File",
            description: "Failed to read the CV file. Please try again.",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(cvFile);
      } catch (error: any) {
        console.error("CV processing failed:", error);
        toast({
          title: "CV Processing Failed",
          description: error.message || "Failed to process CV. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (cvFile && cvText && employee && user && !isCVUploaded) {
      analyzeCV();
    }
  }, [cvFile, cvText, employee, isCVUploaded, setIsCVUploaded, toast, user]);

  return { isAnalyzing };
};

export default useEnhancedOnboarding;
