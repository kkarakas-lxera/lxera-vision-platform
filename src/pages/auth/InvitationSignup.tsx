import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, User, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeData {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  company_name: string;
  position?: string;
  department?: string;
}

const InvitationSignup = () => {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  const invitationToken = searchParams.get('token');

  // Validate invitation token and fetch employee data
  useEffect(() => {
    const validateToken = async () => {
      if (!invitationToken) {
        setError('Invalid invitation link. No token provided.');
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        
        // Get invitation details with employee and company data
        const { data: invitation, error: invitationError } = await supabase
          .from('profile_invitations')
          .select(`
            id,
            employee_id,
            expires_at,
            completed_at,
            employees!inner (
              id,
              email,
              full_name,
              company_id,
              position,
              department,
              companies!inner (
                id,
                name
              )
            )
          `)
          .eq('invitation_token', invitationToken)
          .single();

        if (invitationError || !invitation) {
          setError('Invalid invitation token. Please check your invitation link.');
          setIsValidating(false);
          return;
        }

        // Check if invitation has expired
        if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
          setError('This invitation has expired. Please contact your administrator for a new invitation.');
          setIsValidating(false);
          return;
        }

        // Check if invitation has already been completed
        if (invitation.completed_at) {
          setError('This invitation has already been used. Please sign in instead.');
          setIsValidating(false);
          return;
        }

        // Check if user already exists
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', invitation.employees.email)
          .single();

        if (!userError && existingUser) {
          setError('An account with this email already exists. Please sign in instead.');
          setIsValidating(false);
          return;
        }

        // Set employee data
        const employee = invitation.employees;
        setEmployeeData({
          id: employee.id,
          email: employee.email,
          full_name: employee.full_name,
          company_id: employee.company_id,
          company_name: employee.companies.name,
          position: employee.position,
          department: employee.department
        });

        setTokenValid(true);
        setIsValidating(false);
      } catch (error) {
        console.error('Error validating invitation:', error);
        setError('Failed to validate invitation. Please try again.');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [invitationToken]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeData || !tokenValid) {
      setError('Invalid invitation data.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create Supabase auth user
      const { error: signUpError } = await signUp(employeeData.email, password, employeeData.full_name);
      
      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Step 2: Wait a moment for auth trigger to create user profile, then update it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the created user from auth
      const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
      
      if (authUserError || !authUser) {
        console.error('Error getting auth user:', authUserError);
        setError('Failed to retrieve user account. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Update the automatically created user profile with company info
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          role: 'learner',
          company_id: employeeData.company_id,
          is_active: true,
          email_verified: true
        })
        .eq('id', authUser.id);

      if (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError);
        setError('Failed to update user profile. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Step 3: Link employee to user
      const { error: linkError } = await supabase
        .from('employees')
        .update({ user_id: authUser.id })
        .eq('id', employeeData.id);

      if (linkError) {
        console.error('Error linking employee to user:', linkError);
        setError('Failed to link employee profile. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Step 4: Mark invitation as viewed
      const { error: markViewedError } = await supabase
        .from('profile_invitations')
        .update({ viewed_at: new Date().toISOString() })
        .eq('invitation_token', invitationToken);

      if (markViewedError) {
        console.error('Error marking invitation as viewed:', markViewedError);
        // Don't fail for this - it's not critical
      }

      // Step 5: Auto sign in and redirect to profile completion
      const { error: signInError } = await signIn(employeeData.email, password);
      
      if (signInError) {
        // If auto sign-in fails, redirect to login with success message
        navigate(`/admin-login?redirect=/learner/profile&token=${invitationToken}&message=account-created`);
      } else {
        // Success! Redirect to profile builder
        navigate('/learner/profile');
      }

    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-business-black" />
          <p className="mt-4 text-lg text-gray-700">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Alert className="border-2 border-red-600 bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
            <AlertCircle className="h-5 w-5 text-white" />
            <AlertDescription className="text-white font-bold text-base">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/admin-login')}
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
            Welcome to LXERA<span className="text-business-black">.</span>
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700 font-medium">
            Create your account to get started
          </p>
        </div>

        {/* Employee Info Card */}
        <Card className="border-0 shadow-lg bg-future-green/5 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-future-green" />
              <div>
                <p className="text-sm font-medium text-business-black">
                  {employeeData.full_name}
                </p>
                <p className="text-xs text-gray-600">
                  {employeeData.email} • {employeeData.company_name}
                </p>
                {employeeData.position && (
                  <p className="text-xs text-gray-500">
                    {employeeData.position}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="pb-4 bg-gradient-to-br from-future-green/5 to-transparent">
            <CardTitle className="text-xl sm:text-2xl font-bold text-business-black">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base text-gray-700 mt-1">
              Set up your password to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base font-bold text-business-black">Email address</Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={employeeData.email}
                      disabled
                      className="pl-10 py-5 text-base border-2 border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName" className="text-base font-bold text-business-black">Full name</Label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="fullName"
                      type="text"
                      value={employeeData.full_name}
                      disabled
                      className="pl-10 py-5 text-base border-2 border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-base font-bold text-business-black">Password</Label>
                  <div className="mt-1 relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="pl-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                      autoComplete="new-password"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-base font-bold text-business-black">Confirm Password</Label>
                  <div className="mt-1 relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="pl-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                      autoComplete="new-password"
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
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center whitespace-nowrap">
                        Create Account & Continue
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform inline-flex" />
                      </span>
                    )}
                  </span>
                </Button>
              </form>
            </motion.div>

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
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-gray-600 font-medium">
          By creating an account, you agree to our <span className="text-business-black">Terms of Service</span> and <span className="text-business-black">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default InvitationSignup;