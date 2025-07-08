import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    customAnswers?: {
      a1?: string; // Company
      a2?: string; // Job Title
      a3?: string; // Company Size
      a4?: string; // Country
    };
  };
  utm?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}

const CalendlyEmbedOptimized = ({ url, prefill, utm }: CalendlyEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();
  
  // Build URL with parameters
  const buildCalendlyUrl = () => {
    const params = new URLSearchParams();
    
    // Add prefill parameters
    if (prefill?.email) params.append('email', prefill.email);
    if (prefill?.firstName) params.append('first_name', prefill.firstName);
    if (prefill?.lastName) params.append('last_name', prefill.lastName);
    
    // Add custom answers
    if (prefill?.customAnswers?.a1) params.append('a1', prefill.customAnswers.a1);
    if (prefill?.customAnswers?.a2) params.append('a2', prefill.customAnswers.a2);
    if (prefill?.customAnswers?.a3) params.append('a3', prefill.customAnswers.a3);
    if (prefill?.customAnswers?.a4) params.append('a4', prefill.customAnswers.a4);
    
    // Add UTM parameters
    if (utm?.utmSource) params.append('utm_source', utm.utmSource);
    if (utm?.utmMedium) params.append('utm_medium', utm.utmMedium);
    if (utm?.utmCampaign) params.append('utm_campaign', utm.utmCampaign);
    
    // Add mobile-specific parameters
    if (isMobile) {
      params.append('hide_event_type_details', '1');
      params.append('background_color', 'ffffff');
      params.append('text_color', '1a1a1a');
      params.append('primary_color', '7AE5C6');
    }
    
    return `${url}?${params.toString()}`;
  };

  useEffect(() => {
    // Reset states when component mounts
    setIsLoading(true);
    setHasError(false);
    
    // Load Calendly script if not already loaded
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    
    const loadCalendly = () => {
      if (window.Calendly) {
        setIsLoading(false);
        // Initialize inline widget
        setTimeout(() => {
          try {
            window.Calendly.initInlineWidget({
              url: buildCalendlyUrl(),
              parentElement: document.querySelector('.calendly-inline-widget'),
              prefill: {},
              utm: {}
            });
          } catch (error) {
            console.error('Error initializing Calendly widget:', error);
            setHasError(true);
          }
        }, 100);
      }
    };
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = loadCalendly;
      script.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
    } else {
      loadCalendly();
    }
    
    // Cleanup function
    return () => {
      // Remove Calendly iframe if it exists
      const calendlyFrame = document.querySelector('.calendly-inline-widget iframe');
      if (calendlyFrame) {
        calendlyFrame.remove();
      }
    };
  }, [url, isMobile]);

  // Mobile-specific height calculation
  const getWidgetHeight = () => {
    if (isMobile) {
      // Calculate available height on mobile
      const viewportHeight = window.innerHeight;
      const headerHeight = 120; // Approximate header/form height
      const padding = 40;
      return Math.min(viewportHeight - headerHeight - padding, 500);
    }
    return 630; // Default desktop height
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center mb-4">
          Unable to load the scheduler. Please try again later.
        </p>
        <a 
          href={buildCalendlyUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-future-green hover:underline"
        >
          Open scheduler in new tab →
        </a>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative",
      isMobile && "mx-4" // Add some margin on mobile
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-future-green" />
            <p className="text-gray-500">Loading scheduler...</p>
          </div>
        </div>
      )}
      <div 
        className={cn(
          "calendly-inline-widget transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        data-url={buildCalendlyUrl()}
        style={{ 
          minWidth: isMobile ? '100%' : '320px',
          width: '100%',
          height: `${getWidgetHeight()}px`,
          overflow: 'hidden'
        }}
      />
      
      {/* Mobile touch scroll indicator */}
      {isMobile && !isLoading && (
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <p className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm inline-block px-3 py-1 rounded-full">
            Swipe to see available times
          </p>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for Calendly
declare global {
  interface Window {
    Calendly: any;
  }
}

export default CalendlyEmbedOptimized;