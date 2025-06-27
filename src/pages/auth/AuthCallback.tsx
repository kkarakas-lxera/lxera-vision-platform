
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to appropriate dashboard
          const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (userProfile) {
            switch (userProfile.role) {
              case 'super_admin':
                navigate('/admin');
                break;
              case 'company_admin':
                navigate('/dashboard');
                break;
              case 'learner':
                navigate('/learner');
                break;
              default:
                navigate('/');
            }
          } else {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
