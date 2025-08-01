import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function OnboardingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Map old onboarding routes to new employee tabs
    const path = location.pathname;
    
    if (path.includes('/onboarding/import')) {
      navigate('/dashboard/employees?tab=import', { replace: true });
    } else if (path.includes('/onboarding/invite')) {
      navigate('/dashboard/employees?tab=invitations', { replace: true });
    } else if (path.includes('/onboarding/analysis')) {
      navigate('/dashboard/employees?tab=analysis', { replace: true });
    } else {
      // Default to directory tab
      navigate('/dashboard/employees', { replace: true });
    }
  }, [location, navigate]);

  return null;
}