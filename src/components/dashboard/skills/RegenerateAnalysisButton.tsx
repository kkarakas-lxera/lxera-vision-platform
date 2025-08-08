import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
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
  isLoading = false,
}: RegenerateAnalysisButtonProps) {
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [lastRegeneratedAt, setLastRegeneratedAt] = useState<Date | null>(null);

  const handleRegenerate = async () => {
    if (isRegenerating) return;

    setIsRegenerating(true);

    const toastId = toast.loading('Regenerating analysis...', {
      description: 'This may take a moment',
    });

    try {
      await onRegenerate();
      setLastRegeneratedAt(new Date());
      toast.success('Analysis regenerated successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to regenerate analysis', { id: toastId });
      // eslint-disable-next-line no-console
      console.error('Regeneration error:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isDisabled: boolean = Boolean(isLoading || isRegenerating);

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRegenerate}
              disabled={isDisabled}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate Analysis
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold">Regenerate Benchmark</div>
              <div className="text-sm space-y-1">
                <div>Recalculates organization, department, and employee metrics.</div>
                {lastRegeneratedAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last regenerated: {format(lastRegeneratedAt, 'MMM dd, h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {lastRegeneratedAt && (
        <div className="text-xs text-muted-foreground sm:hidden">
          Last: {format(lastRegeneratedAt, 'MMM dd, h:mm a')}
        </div>
      )}
    </div>
  );
}