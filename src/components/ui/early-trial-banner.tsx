import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EarlyTrialBanner: React.FC = () => {
  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50/80 text-amber-900">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm">
        This is an early trial view. Some things might break. If so, please report to us as soon as possible.
      </AlertDescription>
    </Alert>
  );
};

export default EarlyTrialBanner;