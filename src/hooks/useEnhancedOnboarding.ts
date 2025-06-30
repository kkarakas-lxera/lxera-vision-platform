
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseEnhancedOnboardingProps {
  employee?: any;
  cvFile?: File | null;
  cvText?: string;
  isCVUploaded?: boolean;
  setIsCVUploaded?: (value: boolean) => void;
}

const useEnhancedOnboarding = (props?: UseEnhancedOnboardingProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const queueCVsForProcessing = async (sessionId: string, items: Array<{itemId: string, filePath: string}>, options?: {priority?: number}) => {
    // Implementation for queuing CVs
    return items.length;
  };

  const startProcessing = async (progressCallback?: (progress: {processed: number, totalQueued: number}) => void) => {
    // Implementation for starting processing
    if (progressCallback) {
      progressCallback({processed: 0, totalQueued: 0});
    }
  };

  const initializeLLM = async () => {
    // Implementation for initializing LLM
    return true;
  };

  const createImportSession = async (type: string) => {
    // Implementation for creating import session
    return { id: 'session-id' };
  };

  useEffect(() => {
    const analyzeCV = async () => {
      if (!props || !props.employee || !props.cvFile || !props.cvText || !user) {
        return;
      }

      setIsAnalyzing(true);
      try {
        // Use employee_cv_data table instead of employee_cv_uploads
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target?.result as string;
          const fileName = props.cvFile!.name;
          const fileSize = props.cvFile!.size;

          // Store CV data in the database using employee_cv_data table
          const { error } = await supabase
            .from('employee_cv_data')
            .insert([
              {
                employee_id: props.employee.id,
                file_name: fileName,
                file_data: fileData,
                file_size: fileSize,
                file_type: 'application/pdf',
              },
            ]);

          if (error) {
            console.error('Error storing CV data:', error);
            throw error;
          }

          toast({
            title: "CV Uploaded and Stored!",
            description: "Your CV has been successfully uploaded and stored.",
          });
          props.setIsCVUploaded?.(true);
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast({
            title: "Error Reading File",
            description: "Failed to read the CV file. Please try again.",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(props.cvFile);
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

    if (props?.cvFile && props?.cvText && props?.employee && user && !props?.isCVUploaded) {
      analyzeCV();
    }
  }, [props?.cvFile, props?.cvText, props?.employee, props?.isCVUploaded, props?.setIsCVUploaded, toast, user]);

  return { 
    isAnalyzing,
    queueCVsForProcessing,
    startProcessing,
    initializeLLM,
    createImportSession
  };
};

export default useEnhancedOnboarding;
