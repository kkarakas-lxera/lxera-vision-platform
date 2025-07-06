import { useEffect, useState } from 'react';

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

const CalendlyEmbed = ({ url, prefill, utm }: CalendlyEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
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
    
    return `${url}?${params.toString()}`;
  };

  useEffect(() => {
    // Load Calendly script if not already loaded
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        setIsLoading(false);
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading scheduler...</div>
        </div>
      )}
      <div 
        className="calendly-inline-widget" 
        data-url={buildCalendlyUrl()}
        style={{ minWidth: '320px', height: '630px' }}
      />
    </div>
  );
};

export default CalendlyEmbed;