import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EarlyTrialBanner: React.FC = () => {
  return (
    <div className="flex justify-center mb-4">
      <Alert className="max-w-3xl border-orange-300 bg-gradient-to-r from-orange-50 via-orange-100/70 to-amber-50 text-orange-900 shadow-sm">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-sm font-medium">
          This is an early trial view. Some things might break. If so, please report to us as soon as possible.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EarlyTrialBanner;