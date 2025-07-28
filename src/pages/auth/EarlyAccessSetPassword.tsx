import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EarlyAccessSetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [leadData, setLeadData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification token');
      setIsValidating(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-magic-link', {
        body: { token }
      });

      if (error || !data?.lead) {
        setError('Invalid or expired token. Please request a new password setup link.');
        setIsValidating(false);
        return;
      }

      // Check if already has password
      if (data.lead.password_set && data.lead.auth_user_id) {
        setError('You already have a password set. Please sign in.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      setLeadData(data.lead);
      setIsValidating(false);
    } catch (error) {
      console.error('Token verification error:', error);
      setError('Failed to verify token. Please try again.');
      setIsValidating(false);
    }
  };

  const isPasswordStrong = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const getPasswordStrengthColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    if (password.length < 8) return 'bg-red-400';
    if (isPasswordStrong(password)) return 'bg-future-green';
    return 'bg-yellow-400';
  };

  const getPasswordStrengthText = () => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'Too short';
    if (isPasswordStrong(password)) return 'Strong';
    return 'Medium';
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('convert-early-access-to-password', {
        body: { 
          token,
          password,
          name: leadData.name
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success('Password set successfully! Please sign in with your new password.');
        // Always redirect to login for proper authentication flow
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Password setup error:', error);
      setError(error.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-business-black" />
          <p className="mt-4 text-lg text-gray-700">Validating your link...</p>
        </div>
      </div>
    );
  }

  if (!token || error || !leadData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Alert className="border-2 border-red-600 bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
            <AlertCircle className="h-5 w-5 text-white" />
            <AlertDescription className="text-white font-bold text-base">
              {error || 'Invalid verification link'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-business-black/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-future-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lxera-blue/10 rounded-full blur-3xl" />
      
      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-business-black leading-tight">
            Set Your Password
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700 font-medium">
            Create a secure password for your early access account
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="pb-4 bg-gradient-to-br from-future-green/5 to-transparent">
            <CardTitle className="text-xl sm:text-2xl font-bold text-business-black">
              Welcome to Early Access
            </CardTitle>
            <CardDescription className="text-base text-gray-700 mt-1">
              {leadData?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-base font-bold text-business-black">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{
                            width: `${Math.min((password.length / 8) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use 8+ characters with uppercase, lowercase, and numbers
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-base font-bold text-business-black">
                  Confirm Password
                </Label>
                <div className="mt-1 relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all group relative overflow-hidden" 
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-lxera-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      Set Password & Access Early Access
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {error && (
              <Alert className="mt-4 border-2 border-red-600 bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
                <AlertCircle className="h-5 w-5 text-white" />
                <AlertDescription className="text-white font-bold text-base">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarlyAccessSetPassword;