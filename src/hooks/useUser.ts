
import { useAuth } from '@/contexts/AuthContext';

export const useUser = () => {
  const { user, userProfile } = useAuth();
  
  return {
    user: userProfile || user,
    loading: false
  };
};
