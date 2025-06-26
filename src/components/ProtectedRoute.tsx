
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
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { user: !!user, userProfile, loading, allowedRoles });

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!userProfile) {
    console.log('No user profile, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    console.log('User role not allowed, redirecting based on role:', userProfile.role);
    // Redirect based on user role
    switch (userProfile.role) {
      case 'super_admin':
        return <Navigate to="/admin" replace />;
      case 'company_admin':
        return <Navigate to="/dashboard" replace />;
      case 'learner':
        return <Navigate to="/learner" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};
