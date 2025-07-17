
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

const Login = () => {
  const { user, userProfile, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from);
      } else {
        // Redirect based on role
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
      }
    }
  }, [user, userProfile, navigate, location]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
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
            Admin Portal<span className="text-business-black">.</span>
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700 font-medium">
            Sign in to your admin account
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="pb-4 bg-gradient-to-br from-future-green/5 to-transparent">
            <CardTitle className="text-xl sm:text-2xl font-bold text-business-black">
              Admin Login
            </CardTitle>
            <CardDescription className="text-base text-gray-700 mt-1">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base font-bold text-business-black">Email address</Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@company.com"
                      className="pl-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-base font-bold text-business-black">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-0 focus:outline-none transition-all bg-white backdrop-blur-sm placeholder:text-gray-400"
                    autoComplete="current-password"
                  />
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
                        Sign in to Admin Portal
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
          By continuing, you agree to our <span className="text-business-black">Terms of Service</span> and <span className="text-business-black">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
