import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  
  // Parse error from URL hash
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const error = hashParams.get('error');
  const errorCode = hashParams.get('error_code');
  const errorDescription = hashParams.get('error_description');
  
  const isExpiredLink = errorCode === 'otp_expired';
  
  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      // Get email from stored session or prompt user
      const email = localStorage.getItem('pending_verification_email');
      
      if (!email) {
        toast.error('Please enter your email to resend verification');
        navigate('/login');
        return;
      }
      
      // Resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Please check your inbox.');
      
      // Clear the error from URL
      navigate('/login', { 
        state: { 
          message: 'A new verification link has been sent to your email.' 
        } 
      });
      
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  const getErrorMessage = () => {
    if (isExpiredLink) {
      return {
        title: 'Verification Link Expired',
        description: 'Your email verification link has expired for security reasons. Please request a new one.',
        icon: <Mail className="h-12 w-12 text-orange-500" />
      };
    }
    
    switch (error) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          description: errorDescription || 'You do not have permission to access this resource.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          description: 'The authentication request was invalid. Please try again.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
      default:
        return {
          title: 'Authentication Error',
          description: errorDescription || 'An error occurred during authentication.',
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
    }
  };
  
  const { title, description, icon } = getErrorMessage();
  
  return (
    <div className="min-h-screen bg-[#EFEFE3] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExpiredLink && (
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-[#7AE5C6] hover:bg-[#6AD4B5] text-[#191919]"
            >
              {isResending ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          
          {isExpiredLink && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Verification links expire after 24 hours for security. 
                Make sure to click the link as soon as you receive it.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}