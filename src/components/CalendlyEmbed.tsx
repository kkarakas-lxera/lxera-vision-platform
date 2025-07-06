import { useEffect } from 'react';

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
  useEffect(() => {
    // Load Calendly script
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    head?.appendChild(script);

    return () => {
      // Cleanup
      head?.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Initialize Calendly widget when script is loaded
    const initializeCalendly = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: document.getElementById('calendly-embed'),
          prefill: prefill,
          utm: utm,
        });
      }
    };

    // Check if Calendly is already loaded
    if (window.Calendly) {
      initializeCalendly();
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.Calendly) {
          clearInterval(checkInterval);
          initializeCalendly();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [url, prefill, utm]);

  return (
    <div className="calendly-inline-widget" id="calendly-embed" style={{ minWidth: '320px', height: '630px' }} />
  );
};

export default CalendlyEmbed;