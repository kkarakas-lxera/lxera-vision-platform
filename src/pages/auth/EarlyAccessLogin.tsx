import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SmartEmailCapture from '@/components/forms/SmartEmailCapture';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, onComplete }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newValue = value.split('');
    newValue[index] = digit;
    const updatedValue = newValue.join('');
    onChange(updatedValue);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (updatedValue.length === 6 && !updatedValue.includes('')) {
      onComplete?.();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 focus:border-future-green focus:ring-2 focus:ring-future-green/20 transition-all touch-manipulation bg-white/80 backdrop-blur-sm hover:bg-future-green/5"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

const EarlyAccessLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userNotFound, setUserNotFound] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUserNotFound(false);

    try {
      // Check if email exists in early access leads
      const { data: lead, error: leadError } = await supabase
        .from('early_access_leads')
        .select('id, status')
        .eq('email', email.toLowerCase())
        .single();

      if (leadError || !lead) {
        // User not found in early access list
        setUserNotFound(true);
        setIsLoading(false);
        return;
      }

      // Send OTP
      const { error: otpError } = await supabase.functions.invoke('send-verification-code', {
        body: { email: email.toLowerCase() }
      });

      if (otpError) throw otpError;

      setOtpSent(true);
      setStep('otp');
      setResendTimer(60); // 60 second cooldown
      toast({
        title: 'Code sent!',
        description: 'Check your email for the 6-digit verification code.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp-code', {
        body: { email: email.toLowerCase(), code: otp }
      });

      if (error || !data.success) {
        if (data?.redirect) {
          setError('Email not found. Please sign up for early access first.');
          setTimeout(() => navigate(data.redirect), 2000);
        } else {
          setError(data?.error || 'Invalid or expired code');
        }
        return;
      }

      // Store token in localStorage
      localStorage.setItem('earlyAccessToken', data.token);
      localStorage.setItem('earlyAccessEmail', email.toLowerCase());

      // Navigate to waiting room with email and token
      navigate(`/waiting-room?email=${encodeURIComponent(email.toLowerCase())}&token=${data.token}`);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email: email.toLowerCase() }
      });

      if (error) throw error;

      setResendTimer(60);
      toast({
        title: 'Code resent!',
        description: 'Check your email for the new verification code.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
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
            Welcome back<span className="text-future-green">!</span>
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700 font-medium">
            Sign in to your early access account
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="pb-4 bg-gradient-to-br from-future-green/5 to-transparent">
            <CardTitle className="text-xl sm:text-2xl font-bold text-business-black">
              Early Access Login
            </CardTitle>
            <CardDescription className="text-base text-gray-700 mt-1">
              {step === 'email' 
                ? 'Enter your email to receive a verification code'
                : 'Enter the 6-digit code sent to your email'
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
                  <form onSubmit={handleSendOTP} className="space-y-4">
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
                          placeholder="you@company.com"
                          className="pl-10 py-5 text-base border-2 border-gray-200 focus:border-future-green focus:ring-2 focus:ring-future-green/20 transition-all bg-white/80 backdrop-blur-sm"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>

                    {!userNotFound && (
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98] group relative overflow-hidden" 
                        disabled={isLoading}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-lxera-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking email...
                            </>
                          ) : (
                            <>
                              Continue with email
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </span>
                      </Button>
                    )}

                    {/* Show this only after user submits email and they're not in the database */}
                    {userNotFound && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 mt-4"
                      >
                        <Alert className="border-2 border-future-green/30 bg-gradient-to-br from-future-green/10 to-lxera-blue/10">
                          <AlertCircle className="h-4 w-4 text-future-green" />
                          <AlertDescription className="text-business-black font-medium">
                            <strong className="text-business-black">{email}</strong> is not on our early access list yet.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="text-center space-y-3">
                          <p className="text-sm text-gray-600">
                            Join our early access program to get started
                          </p>
                          <div className="space-y-2">
                            <SmartEmailCapture
                              source="login-page-not-found"
                              variant="default"
                              buttonText="Get Early Access"
                              placeholder="Enter your work email"
                              initialEmail={email}
                              autoSubmit={false}
                              className="w-full [&_button]:bg-gradient-to-r [&_button]:from-future-green [&_button]:to-future-green/90 [&_button]:hover:from-future-green [&_button]:hover:to-lxera-blue [&_button]:text-business-black [&_button]:font-bold [&_button]:shadow-lg [&_button]:hover:shadow-xl [&_button]:transition-all [&_button]:transform [&_button]:hover:scale-[1.02]"
                              onSuccess={(email) => {
                                toast({
                                  title: 'Welcome to Early Access!',
                                  description: 'Check your email to complete your profile.',
                                });
                                // Reset the form state after successful submission
                                setUserNotFound(false);
                                setEmail('');
                              }}
                            />
                            <p className="text-xs text-gray-500">
                              30 seconds, no card required
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUserNotFound(false);
                              setEmail('');
                            }}
                            className="text-sm text-future-green hover:text-business-black font-bold transition-colors"
                          >
                            Try a different email
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-sm sm:text-base text-gray-700 font-medium">
                      We sent a code to <span className="font-bold text-business-black">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-center block text-base font-bold text-business-black">Verification code</Label>
                    <OTPInput 
                      value={otp} 
                      onChange={setOtp}
                      onComplete={handleVerifyOTP}
                    />
                  </div>

                  <Button 
                    onClick={handleVerifyOTP}
                    className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-[0.98] group relative overflow-hidden" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-lxera-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify and continue'
                      )}
                    </span>
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setError('');
                      }}
                      className="text-future-green hover:text-business-black font-bold transition-colors"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className={`font-bold transition-colors ${
                        resendTimer > 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-future-green hover:text-business-black'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <Alert className="mt-4 border-2 border-lxera-red/30 bg-gradient-to-br from-lxera-red/10 to-transparent">
                <AlertDescription className="text-lxera-red font-medium">
                  {error}
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

export default EarlyAccessLogin;