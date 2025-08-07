import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface RegenerateAnalysisButtonProps {
  onRegenerate: () => Promise<void>;
  isLoading?: boolean;
}

export function RegenerateAnalysisButton({ 
  onRegenerate, 
  isLoading = false 
}: RegenerateAnalysisButtonProps) {
  const [regenerationStatus, setRegenerationStatus] = useState<{
    remaining: number;
    used: number;
    max: number;
    resetAt: Date | null;
    lastRegeneratedAt: Date | null;
  }>({
    remaining: 0,
    used: 0,
    max: 3,
    resetAt: null,
    lastRegeneratedAt: null
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch regeneration status on mount
  useEffect(() => {
    fetchRegenerationStatus();
  }, []);

  const fetchRegenerationStatus = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_regeneration_status');

      if (error) throw error;

      if (data && data.success) {
        setRegenerationStatus({
          remaining: data.remaining || 0,
          used: data.used || 0,
          max: data.max || 3,
          resetAt: data.reset_at ? new Date(data.reset_at) : null,
          lastRegeneratedAt: data.last_regenerated_at ? new Date(data.last_regenerated_at) : null
        });
      }
    } catch (error) {
      console.error('Error fetching regeneration status:', error);
    }
  };

  const handleRegenerate = async () => {
    if (regenerationStatus.remaining <= 0) {
      toast.error('Monthly regeneration limit reached', {
        description: `Resets on ${regenerationStatus.resetAt ? format(regenerationStatus.resetAt, 'MMM dd, yyyy') : 'next month'}`
      });
      return;
    }

    setIsRegenerating(true);

    try {
      // Check and use regeneration
      const { data: regenerateData, error: regenerateError } = await supabase
        .rpc('check_and_use_regeneration');

      if (regenerateError) throw regenerateError;

      if (!regenerateData.success) {
        toast.error(regenerateData.error || 'Cannot regenerate at this time');
        return;
      }

      // Show progress toast
      const toastId = toast.loading('Regenerating analysis...', {
        description: 'This may take a moment'
      });

      try {
        // Call the actual regeneration function
        await onRegenerate();

        // Update local status
        setRegenerationStatus(prev => ({
          ...prev,
          remaining: regenerateData.remaining || 0,
          used: (prev.used || 0) + 1,
          lastRegeneratedAt: new Date()
        }));

        toast.success('Analysis regenerated successfully!', {
          id: toastId,
          description: `${regenerateData.remaining} regenerations remaining this month`
        });
      } catch (regenerateError) {
        // Regeneration failed - try to restore the count
        console.error('Regeneration failed:', regenerateError);
        
        // Restore the regeneration count since it failed
        try {
          await supabase.rpc('restore_regeneration_count');
        } catch (restoreError) {
          console.error('Could not restore regeneration count:', restoreError);
        }
        
        toast.error('Failed to regenerate analysis', {
          id: toastId,
          description: 'Your regeneration was not consumed. Please try again.'
        });
        
        // Re-fetch the status
        await fetchRegenerationStatus();
        throw regenerateError;
      }

    } catch (error) {
      console.error('Error regenerating analysis:', error);
      toast.error('Failed to regenerate analysis');
    } finally {
      setIsRegenerating(false);
    }
  };

  const isDisabled = isLoading || isRegenerating || regenerationStatus.remaining <= 0;
  const showWarning = regenerationStatus.remaining === 1;
  const showError = regenerationStatus.remaining === 0;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRegenerate}
              disabled={isDisabled}
              variant={showError ? "destructive" : showWarning ? "outline" : "default"}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate Analysis
              {regenerationStatus.remaining > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                  {regenerationStatus.remaining}/{regenerationStatus.max}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold">Regeneration Usage</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Used this month:</span>
                  <span className="font-medium">{regenerationStatus.used}/{regenerationStatus.max}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={`font-medium ${showError ? 'text-red-500' : showWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                    {regenerationStatus.remaining}
                  </span>
                </div>
                {regenerationStatus.resetAt && (
                  <div className="pt-1 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Resets {format(regenerationStatus.resetAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                )}
                {regenerationStatus.lastRegeneratedAt && (
                  <div className="text-xs text-muted-foreground">
                    Last regenerated: {format(regenerationStatus.lastRegeneratedAt, 'MMM dd, h:mm a')}
                  </div>
                )}
              </div>
              {showError && (
                <div className="flex items-center gap-1 text-xs text-red-500 pt-1 border-t">
                  <AlertCircle className="h-3 w-3" />
                  Monthly limit reached
                </div>
              )}
              {showWarning && (
                <div className="flex items-center gap-1 text-xs text-yellow-500 pt-1 border-t">
                  <AlertCircle className="h-3 w-3" />
                  Last regeneration available
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Mobile-friendly usage indicator */}
      <div className="text-xs text-muted-foreground sm:hidden">
        {regenerationStatus.remaining}/{regenerationStatus.max} left
      </div>
    </div>
  );
}