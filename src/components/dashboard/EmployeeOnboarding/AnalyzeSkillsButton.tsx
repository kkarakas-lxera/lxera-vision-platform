import React, { useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedOnboarding } from '@/hooks/useEnhancedOnboarding';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyzeSkillsButtonProps {
  sessionId?: string;
  employeeIds?: string[];
  onAnalysisComplete?: () => void;
  className?: string;
}

export function AnalyzeSkillsButton({ 
  sessionId, 
  employeeIds, 
  onAnalysisComplete,
  className 
}: AnalyzeSkillsButtonProps) {
  const { userProfile, loading: authLoading } = useAuth();
  const { queueCVsForProcessing, startProcessing, initializeLLM, createImportSession } = useEnhancedOnboarding();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });

  const handleAnalyze = async () => {
    if (!userProfile?.company_id) {
      toast.error('Company information not found. Please refresh and try again.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Initialize LLM if needed
      await initializeLLM();

      // Get employees to analyze
      let employeesToAnalyze: Array<{ id: string; cv_file_path: string }> = [];
      
      if (sessionId) {
        // Get employees from session
        const { data, error } = await supabase
          .from('st_import_session_items')
          .select('employee_id, cv_file_path')
          .eq('import_session_id', sessionId)
          .not('cv_file_path', 'is', null);
        
        if (error) throw error;
        employeesToAnalyze = data.map(item => ({ 
          id: item.employee_id, 
          cv_file_path: item.cv_file_path 
        }));
      } else if (employeeIds) {
        // Get specific employees
        const { data, error } = await supabase
          .from('employees')
          .select('id, cv_file_path')
          .in('id', employeeIds)
          .not('cv_file_path', 'is', null);
        
        if (error) throw error;
        employeesToAnalyze = data.map(emp => ({ 
          id: emp.id, 
          cv_file_path: emp.cv_file_path 
        }));
      }

      if (employeesToAnalyze.length === 0) {
        toast.error('No employees with CVs found to analyze');
        setIsAnalyzing(false);
        return;
      }

      setProgress({ processed: 0, total: employeesToAnalyze.length });

      // Create a session if none exists (for direct analysis)
      let analysisSessionId = sessionId;
      if (!analysisSessionId) {
        const newSession = await createImportSession('direct_cv_analysis');
        if (!newSession) {
          throw new Error('Failed to create analysis session');
        }
        analysisSessionId = newSession.id;

        // Create session items for direct analysis
        const employeeIds = employeesToAnalyze.map(emp => emp.id);
        const { error: sessionItemsError } = await supabase
          .rpc('create_session_items_for_employees', {
            p_session_id: analysisSessionId,
            p_employee_ids: employeeIds
          });

        if (sessionItemsError) {
          console.warn('Failed to create session items:', sessionItemsError);
          // Continue anyway - this is not critical for the main flow
        }
      }

      // Queue CVs for processing
      const itemsToQueue = employeesToAnalyze.map(emp => ({
        itemId: emp.id,
        filePath: emp.cv_file_path
      }));

      const queued = await queueCVsForProcessing(
        analysisSessionId,
        itemsToQueue,
        { priority: 1 }
      );

      if (queued === 0) {
        toast.error('Failed to queue CVs for analysis');
        setIsAnalyzing(false);
        return;
      }

      // Start processing with progress updates
      await startProcessing((progress) => {
        setProgress({
          processed: progress.processed,
          total: progress.totalQueued
        });
      });

      toast.success('Skills analysis completed successfully!');
      onAnalysisComplete?.();
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze skills');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing || authLoading || !userProfile}
      className={className}
      title={authLoading ? 'Loading user information...' : !userProfile ? 'User profile not loaded' : undefined}
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing... {progress.processed}/{progress.total}
        </>
      ) : authLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <BarChart3 className="h-4 w-4 mr-2" />
          Analyze Skills
        </>
      )}
    </Button>
  );
}