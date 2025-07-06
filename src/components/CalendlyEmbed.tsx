import { useEffect, useRef, useState } from 'react';

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
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

declare global {
  interface Window {
    Calendly: any;
  }
}

const CalendlyEmbed = ({ url, prefill, utm }: CalendlyEmbedProps) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Calendly script
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        initializeWidget();
      };
    } else {
      // Script already loaded
      initializeWidget();
    }

    function initializeWidget() {
      if (window.Calendly && embedRef.current) {
        try {
          // Clear any existing content
          embedRef.current.innerHTML = '';
          
          window.Calendly.initInlineWidget({
            url: url,
            parentElement: embedRef.current,
            prefill: prefill || {},
            utm: utm || {},
          });
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing Calendly widget:', error);
          setIsLoading(false);
        }
      }
    }

    // Cleanup function
    return () => {
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }
    };
  }, [url, prefill, utm]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading scheduler...</div>
        </div>
      )}
      <div 
        ref={embedRef}
        className="calendly-inline-widget" 
        style={{ minWidth: '320px', height: '630px' }}
      />
    </div>
  );
};

export default CalendlyEmbed;