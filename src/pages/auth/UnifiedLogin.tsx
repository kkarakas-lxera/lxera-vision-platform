import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowRight, Shield, AlertCircle, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, userProfile } = useAuth();
  
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [personalEmailError, setPersonalEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSetupSent, setPasswordSetupSent] = useState(false);
  const [userType, setUserType] = useState<'early_access' | 'company' | null>(null);

  // Get redirect path and token from URL parameters
  const redirectPath = searchParams.get('redirect');
  const invitationToken = searchParams.get('token');

  // Common personal/consumer email domains to block for early access
  const BLOCKED_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'me.com', 'protonmail.com', 'tutanota.com', 'yandex.com',
    'mail.com', 'gmx.com', 'zoho.com', 'fastmail.com', 'hushmail.com',
    'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'tempmail.org',
    'throwaway.email', 'maildrop.cc', 'sharklasers.com', 'grr.la'
  ];

  const isCompanyEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !BLOCKED_DOMAINS.includes(domain);
  };

  // Check if user is already authenticated
  useEffect(() => {
    if (user && userProfile) {
      const from = (location.state as any)?.from?.pathname;
      
      // Check for redirect parameter first
      if (redirectPath) {
        // Add token to the redirect path if available
        const finalPath = invitationToken 
          ? `${redirectPath}?token=${invitationToken}`
          : redirectPath;
        navigate(finalPath);
      } else if (from) {
        navigate(from);
      } else {
        // Redirect based on role
        switch (userProfile.role) {
          case 'super_admin':
            navigate('/admin');
            break;
          case 'company_admin':
            // Check if this is an early access user
            if (userProfile.metadata?.early_access === true) {
              navigate('/waiting-room');
            } else {
              navigate('/dashboard');
            }
            break;
          case 'learner':
            navigate('/learner');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [user, userProfile, navigate, location, redirectPath, invitationToken]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUserNotFound(false);
    setPersonalEmailError(false);
    setUserType(null);

    try {
      // First check if user exists in the users table (authenticated users)
      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email.toLowerCase());

      if (users && users.length > 0) {
        // This is an authenticated user - determine their type
        const userRole = users[0].role;
        if (userRole === 'early_access') {
          setUserType('early_access');
        } else if (userRole === 'learner') {
          setUserType('learner');
        } else {
          setUserType('company');
        }
        setStep('password');
      } else {
        // Not an authenticated user, check if they're early access
        // @ts-ignore - early_access_leads table not in generated types yet
        const { data: leads } = await supabase
          .from('early_access_leads' as any)
          .select('id, status, password_set, auth_user_id')
          .eq('email', email.toLowerCase());

        if (leads && leads.length > 0) {
          // This is an early access user
          setUserType('early_access');
          const lead = leads[0];

          // Check if it's a company email for early access
          if (!isCompanyEmail(email)) {
            setPersonalEmailError(true);
            setIsLoading(false);
            return;
          }

          // Check if user has password set
          if (lead.password_set && lead.auth_user_id) {
            setStep('password');
          } else {
            // Send password setup email
            const { error: emailError } = await supabase.functions.invoke('send-password-setup-email', {
              body: { email: email.toLowerCase(), isNewUser: true }
            });

            if (emailError) throw emailError;

            setPasswordSetupSent(true);
            toast.success('Email sent!', {
              description: 'Check your email to set up your password and access early access.',
            });
          }
        } else {
          // User not found anywhere
          setUserNotFound(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Auth context will handle the redirect
        if (userType === 'early_access') {
          navigate('/waiting-room');
        }
      }
    } catch (err: any) {
      console.error('Password login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

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
            Welcome back<span className="text-business-black">!</span>
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700 font-medium">
            Sign in to your account
          </p>
        </div>

        {invitationToken && (
          <Alert className="bg-future-green/10 border-future-green/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to complete your profile setup
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="pb-4 bg-gradient-to-br from-future-green/5 to-transparent">
            <CardTitle className="text-xl sm:text-2xl font-bold text-business-black">
              Sign In
            </CardTitle>
            <CardDescription className="text-base text-gray-700 mt-1">
              {step === 'email' 
                ? 'Enter your email to continue'
                : 'Enter your password to access your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!userNotFound && !personalEmailError && !passwordSetupSent && (
                    <form onSubmit={handleCheckEmail} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-base font-bold text-business-black">Email address</Label>
                        <div className="mt-1 relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setPersonalEmailError(false);
                            }}
                            required
                            placeholder="you@company.com"
                            className="pl-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                            autoComplete="email"
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98] group relative overflow-hidden" 
                        disabled={isLoading}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-lxera-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">
                          {isLoading ? (
                            <span className="flex items-center justify-center whitespace-nowrap">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin inline-flex" />
                              Checking email...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center whitespace-nowrap">
                              Continue with email
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform inline-flex" />
                            </span>
                          )}
                        </span>
                      </Button>
                    </form>
                  )}

                  {/* Show password setup sent message */}
                  {passwordSetupSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Alert className="border-2 border-green-600 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-gray-800 font-medium">
                          Email sent! Check your inbox to set up your password and access early access.
                        </AlertDescription>
                      </Alert>
                      <div className="text-center mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordSetupSent(false);
                            setEmail('');
                          }}
                          className="text-sm text-business-black/80 hover:text-business-black font-bold transition-colors underline underline-offset-2"
                        >
                          Try with a different email
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Show this when user enters a personal email */}
                  {personalEmailError && !passwordSetupSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 mt-4"
                    >
                      <Alert className="border-2 border-red-400/50 bg-gradient-to-br from-red-50 via-red-50/80 to-red-100/60 shadow-lg shadow-red-200/20">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-gray-800 font-medium">
                          Please use your company email address
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">
                          Early access is available for business accounts only
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setPersonalEmailError(false);
                            setEmail('');
                          }}
                          className="text-sm text-business-black/80 hover:text-business-black font-bold transition-colors underline underline-offset-2"
                        >
                          Try with your work email
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Show this only after user submits email and they're not in the database */}
                  {userNotFound && !signupSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 mt-4"
                    >
                      <Alert className="border-2 border-orange-400/50 bg-gradient-to-br from-orange-50 via-amber-50/80 to-orange-100/60 shadow-lg shadow-orange-200/20">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-gray-800 font-medium">
                          <strong className="text-gray-900">{email}</strong> is not found.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">
                          Please check your email or contact support
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUserNotFound(false);
                            setEmail('');
                          }}
                          className="text-sm text-business-black/80 hover:text-business-black font-bold transition-colors underline underline-offset-2"
                        >
                          Try a different email
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm sm:text-base text-gray-700 font-medium">
                        Welcome back! <span className="font-bold text-business-black">{email}</span>
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-base font-bold text-business-black">Password</Label>
                      <div className="mt-1 relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="pl-10 pr-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                          autoComplete="current-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98] group relative overflow-hidden" 
                      disabled={isLoading}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-lxera-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative">
                        {isLoading ? (
                          <span className="flex items-center justify-center whitespace-nowrap">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline-flex" />
                            Signing in...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center whitespace-nowrap">
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform inline-flex" />
                          </span>
                        )}
                      </span>
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setPassword('');
                          setError('');
                        }}
                        className="text-future-green hover:text-business-black font-bold transition-colors flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Use different email
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          try {
                            if (userType === 'early_access') {
                              const { error } = await supabase.functions.invoke('send-password-setup-email', {
                                body: { email: email.toLowerCase(), isNewUser: false }
                              });
                              if (error) throw error;
                              toast.success('Password reset email sent!', {
                                description: 'Check your email to reset your password.',
                              });
                            } else {
                              const { error } = await supabase.auth.resetPasswordForEmail(
                                email.toLowerCase(),
                                { redirectTo: `${window.location.origin}/reset-password` }
                              );
                              if (error) throw error;
                              toast.success('Password reset email sent!', {
                                description: 'Check your email to reset your password.',
                              });
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to send reset email');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="text-future-green hover:text-business-black font-bold transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  scale: [0.3, 1.1, 0.95, 1.02, 1],
                  y: [0, 5, -2, 0],
                  x: [0, -12, 12, -10, 10, -8, 8, -5, 5, -2, 0],
                  rotate: [0, -1, 1, -1, 1, -0.5, 0.5, 0]
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.15, 0.3, 0.45, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1],
                  ease: "easeInOut"
                }}
                className="mt-4"
              >
                <Alert className="border-2 border-red-600 bg-gradient-to-br from-red-500 to-red-600 shadow-xl animate-pulse-slow relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  <AlertCircle className="h-5 w-5 text-white animate-bounce-slow" />
                  <AlertDescription className="text-white font-bold text-base relative">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            {signupSuccess && (
              <Alert className="border-2 border-green-600 bg-green-50 mt-4">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-gray-800 font-medium">
                  Success! Check your inbox to finish setting up your account.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-gray-600 font-medium">
          By continuing, you agree to our <span className="text-business-black">Terms of Service</span> and <span className="text-business-black">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default UnifiedLogin;