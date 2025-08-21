import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

const TawkTo = () => {
  const location = useLocation();

  useEffect(() => {
    // List of paths where Tawk.to should NOT appear
    const excludedPaths = ['/dashboard', '/learner', '/admin', '/login', '/waiting-room', '/waiting-list'];
    
    // Check if current path starts with any excluded path
    const shouldExclude = excludedPaths.some(path => 
      location.pathname.startsWith(path)
    );

    if (shouldExclude) {
      // Hide Tawk.to if it exists
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      return;
    }

    // Initialize Tawk.to for public pages
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Only load the script if it hasn't been loaded yet
    if (!document.getElementById('tawk-script')) {
      const script = document.createElement('script');
      script.id = 'tawk-script';
      script.async = true;
      script.src = 'https://embed.tawk.to/6876048dd848a619117d6baa/1j06g3isk';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      script.onload = () => {
        // Show widget when script loads
        if (window.Tawk_API && window.Tawk_API.showWidget) {
          window.Tawk_API.showWidget();
        }
      };

      document.head.appendChild(script);
    } else {
      // If script already exists, just show the widget
      if (window.Tawk_API && window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget();
      }
    }

    // Cleanup function
    return () => {
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [location.pathname]);

  return null;
};

export default TawkTo;