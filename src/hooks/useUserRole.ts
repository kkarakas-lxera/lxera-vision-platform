import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user, userProfile } = useAuth();
  
  // Get role from user profile or fallback to user object
  const role = userProfile?.role || user?.role || 'user';
  
  return {
    role,
    isLearner: role === 'learner',
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isHR: role === 'hr'
  };
};