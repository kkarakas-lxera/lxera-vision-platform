import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Globe, Brain, Check, Loader2, X } from 'lucide-react';
import type { MarketIntelligenceRequest } from './MarketIntelligence';

interface MarketIntelligenceProgressProps {
  request: MarketIntelligenceRequest;
  onCancel?: () => void;
}

export default function MarketIntelligenceProgress({ 
  request, 
  onCancel 
}: MarketIntelligenceProgressProps) {
  
  const getProgressPercentage = () => {
    switch (request.status) {
      case 'queued': return 10;
      case 'scraping': return 40;
      case 'analyzing': return 70;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusMessage = () => {
    const roleTitle = request.position_title || 'positions';
    const dateLabel = request.date_window === '24h' ? 'last 24 hours' :
                      request.date_window === '7d' ? 'last 7 days' :
                      request.date_window === '30d' ? 'last 30 days' :
                      request.date_window === '90d' ? 'last 90 days' :
                      `since ${request.since_date}`;
    const locationLabel = request.regions?.join(', ') || request.countries?.join(', ') || 'selected locations';

    if (request.status === 'scraping') {
      return `Scraping ${roleTitle} — ${dateLabel} (${locationLabel})`;
    } else if (request.status === 'analyzing') {
      return 'Analyzing trends...';
    } else {
      return request.status_message || 'Initializing...';
    }
  };

  const steps = [
    { id: 'gathering', label: 'Gathering', icon: Globe, status: 'scraping' },
    { id: 'analyzing', label: 'Analyzing', icon: Brain, status: 'analyzing' },
    { id: 'complete', label: 'Complete', icon: Check, status: 'completed' }
  ];

  const currentStepIndex = request.status === 'queued' ? 0 :
                          request.status === 'scraping' ? 0 :
                          request.status === 'analyzing' ? 1 :
                          request.status === 'completed' ? 2 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Market Analysis in Progress</h3>
              <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">{getStatusMessage()}</p>
                {request.status_message && (
                  <p className="text-sm text-blue-700 mt-1">{request.status_message}</p>
                )}
                {request.scraped_data?.jobs_count && (
                  <p className="text-xs text-blue-600 mt-2">
                    Found {request.scraped_data.jobs_count} job postings
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {/* Progress Line Background */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
              {/* Progress Line Fill */}
              <div 
                className="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="relative flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                    `}>
                      {isCurrent && index < steps.length - 1 ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`
                      text-xs mt-2 font-medium
                      ${isActive ? 'text-blue-600' : 'text-gray-400'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}