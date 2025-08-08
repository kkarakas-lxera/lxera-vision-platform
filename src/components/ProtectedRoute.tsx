
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'company_admin' | 'learner')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login'
}) => {
  const { user, userProfile, loading, initialCheckComplete } = useAuth();
  const location = useLocation();

  // Only show loading if initial check is not complete
  // This prevents loading state during route transitions
  if (!initialCheckComplete) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!userProfile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // Redirect based on user role
    switch (userProfile.role) {
      case 'super_admin':
        return <Navigate to="/admin" replace />;
      case 'company_admin':
        return <Navigate to="/dashboard" replace />;
      case 'learner':
        // Check if learner has completed their profile
        if (userProfile.employee?.profile_complete && userProfile.employee?.skills_validation_completed) {
          return <Navigate to="/learner" replace />;
        } else {
          return <Navigate to="/learner/profile" replace />;
        }
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
